-- Add Row Level Security (RLS) policies for collections and collection_items tables
-- This ensures users can only manage their own collections
--
-- NOTE: This application currently uses NextAuth (not Supabase Auth), so auth.uid() 
-- will return NULL and these policies will block all operations if using the regular 
-- Supabase client. The API routes use supabaseAdmin to bypass RLS with manual 
-- validation. These policies are kept for defense-in-depth and future compatibility.
--
-- If you migrate to Supabase Auth, these policies will work as intended.

-- ============================================
-- Collections Table RLS
-- ============================================

-- Enable RLS on collections table
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can create collections" ON collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can view public collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;

-- Policy: Users can create collections where they are the owner
CREATE POLICY "Users can create collections"
  ON collections
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can view their own collections
CREATE POLICY "Users can view their own collections"
  ON collections
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Users can view public collections
CREATE POLICY "Users can view public collections"
  ON collections
  FOR SELECT
  USING (
    is_public = true
  );

-- Policy: Users can update their own collections
CREATE POLICY "Users can update their own collections"
  ON collections
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can delete (soft delete) their own collections
CREATE POLICY "Users can delete their own collections"
  ON collections
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- ============================================
-- Collection Items Table RLS
-- ============================================

-- Enable RLS on collection_items table
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can add items to their collections" ON collection_items;
DROP POLICY IF EXISTS "Users can view items in their collections" ON collection_items;
DROP POLICY IF EXISTS "Users can view items in public collections" ON collection_items;
DROP POLICY IF EXISTS "Users can update items in their collections" ON collection_items;
DROP POLICY IF EXISTS "Users can remove items from their collections" ON collection_items;

-- Policy: Users can add items to their own collections
CREATE POLICY "Users can add items to their collections"
  ON collection_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Policy: Users can view items in their own collections
CREATE POLICY "Users can view items in their collections"
  ON collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Policy: Users can view items in public collections
CREATE POLICY "Users can view items in public collections"
  ON collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.is_public = true
    )
  );

-- Policy: Users can update items in their own collections
CREATE POLICY "Users can update items in their collections"
  ON collection_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Policy: Users can remove items from their own collections
CREATE POLICY "Users can remove items from their collections"
  ON collection_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Note: auth.uid() is a Supabase function that returns the UUID of the authenticated user
-- If using a different authentication system, adjust accordingly

