-- Add Row Level Security (RLS) policies for friendships table
-- This ensures users can only create friendships where they are the requester
-- and can only view friendships where they are either the user or friend
--
-- NOTE: This application currently uses NextAuth (not Supabase Auth), so auth.uid() 
-- will return NULL and these policies will block all operations if using the regular 
-- Supabase client. The API routes use supabaseAdmin to bypass RLS with manual 
-- validation. These policies are kept for defense-in-depth and future compatibility.
--
-- If you migrate to Supabase Auth, these policies will work as intended.

-- Enable RLS on friendships table
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can insert their own friendship requests" ON friendships;
DROP POLICY IF EXISTS "Users can view friendships where they are involved" ON friendships;
DROP POLICY IF EXISTS "Users can update friendships where they are involved" ON friendships;
DROP POLICY IF EXISTS "Users can delete friendships where they are involved" ON friendships;

-- Policy: Users can insert friendship requests where they are the requester (user_id)
CREATE POLICY "Users can insert their own friendship requests"
  ON friendships
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can view friendships where they are either the requester or the recipient
CREATE POLICY "Users can view friendships where they are involved"
  ON friendships
  FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Policy: Users can update friendships where they are the recipient (to accept/reject)
-- OR where they are the requester (to cancel/block)
CREATE POLICY "Users can update friendships where they are involved"
  ON friendships
  FOR UPDATE
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  )
  WITH CHECK (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Policy: Users can delete friendships where they are involved
CREATE POLICY "Users can delete friendships where they are involved"
  ON friendships
  FOR DELETE
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Note: auth.uid() is a Supabase function that returns the UUID of the authenticated user
-- If using a different authentication system, adjust accordingly

