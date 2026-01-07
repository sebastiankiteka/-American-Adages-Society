-- Add Row Level Security (RLS) policies for comments table
-- This ensures users can only manage their own comments and view public comments
--
-- NOTE: This application currently uses NextAuth (not Supabase Auth), so auth.uid() 
-- will return NULL and these policies will block all operations if using the regular 
-- Supabase client. The API routes use supabaseAdmin to bypass RLS with manual 
-- validation. These policies are kept for defense-in-depth and future compatibility.
--
-- If you migrate to Supabase Auth, these policies will work as intended.

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can view public comments" ON comments;
DROP POLICY IF EXISTS "Users can view their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Moderators can manage all comments" ON comments;

-- Policy: Users can create comments where they are the author
CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can view non-deleted, non-hidden comments
CREATE POLICY "Users can view public comments"
  ON comments
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND hidden_at IS NULL
  );

-- Policy: Users can view their own comments (even if deleted)
CREATE POLICY "Users can view their own comments"
  ON comments
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can delete (soft delete) their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Policy: Moderators can manage all comments
-- Note: This policy checks for moderator role in the users table
-- Adjust the role check based on your role system
CREATE POLICY "Moderators can manage all comments"
  ON comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Note: auth.uid() is a Supabase function that returns the UUID of the authenticated user
-- If using a different authentication system, adjust accordingly

