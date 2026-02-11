-- Fix Supabase Advisor Warnings
-- This migration addresses 11 security and performance issues identified by Supabase Advisor

-- ============================================================================
-- SECURITY FIXES (2 items)
-- ============================================================================

-- 1. Fix Function Search Path Mutable for update_updated_at_column
-- Security: Prevents search_path injection attacks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Fix Function Search Path Mutable for update_forum_thread_reply_count
-- Security: Prevents search_path injection attacks
CREATE OR REPLACE FUNCTION update_forum_thread_reply_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET replies_count = replies_count + 1,
        last_reply_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads 
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================================================
-- PERFORMANCE FIXES - friendships table (4 items)
-- ============================================================================

-- 3-6. Fix Auth RLS Initialization Plan for friendships policies
-- Performance: Wrap auth.uid() with (select auth.uid()) to prevent re-evaluation per row

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own friendship requests" ON friendships;
DROP POLICY IF EXISTS "Users can view friendships where they are involved" ON friendships;
DROP POLICY IF EXISTS "Users can update friendships where they are involved" ON friendships;
DROP POLICY IF EXISTS "Users can delete friendships where they are involved" ON friendships;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can insert their own friendship requests"
  ON friendships
  FOR INSERT
  WITH CHECK (
    (select auth.uid()) = user_id
  );

CREATE POLICY "Users can view friendships where they are involved"
  ON friendships
  FOR SELECT
  USING (
    (select auth.uid()) = user_id OR (select auth.uid()) = friend_id
  );

CREATE POLICY "Users can update friendships where they are involved"
  ON friendships
  FOR UPDATE
  USING (
    (select auth.uid()) = user_id OR (select auth.uid()) = friend_id
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR (select auth.uid()) = friend_id
  );

CREATE POLICY "Users can delete friendships where they are involved"
  ON friendships
  FOR DELETE
  USING (
    (select auth.uid()) = user_id OR (select auth.uid()) = friend_id
  );

-- ============================================================================
-- PERFORMANCE FIXES - contact_messages table (5 items)
-- ============================================================================

-- 7-10. Fix Auth RLS Initialization Plan for contact_messages policies
-- Performance: Wrap auth.uid() with (select auth.uid()) to prevent re-evaluation per row

-- 11. Consolidate multiple permissive SELECT policies into one
-- Performance: Combine "Users can view their own messages" and "Admins can view all messages"
-- into a single policy to avoid evaluating multiple policies per row

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public contact form submissions" ON contact_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON contact_messages;

-- Recreate INSERT policy (unchanged, no auth.uid() calls)
CREATE POLICY "Allow public contact form submissions"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    length(message) >= 10
    AND length(message) <= 5000
    AND length(name) >= 2
    AND length(name) <= 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 255
    AND category IN ('general', 'correction', 'event', 'partnership', 'donation', 'get_involved', 'other')
  );

-- Consolidated SELECT policy (combines user and admin access)
-- This replaces the two separate SELECT policies for better performance
CREATE POLICY "Users and admins can view messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      -- Users can view their own messages
      (user_id IS NOT NULL AND user_id = (select auth.uid()))
      OR
      -- Admins can view all messages
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = (select auth.uid())
        AND users.role IN ('admin', 'moderator')
      )
    )
  );

-- UPDATE policy with optimized auth.uid()
CREATE POLICY "Admins can update messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'moderator')
    )
  );

-- DELETE policy with optimized auth.uid()
CREATE POLICY "Admins can delete messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'moderator')
    )
  );

