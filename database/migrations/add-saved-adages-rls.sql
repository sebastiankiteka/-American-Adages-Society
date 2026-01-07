-- Add Row Level Security (RLS) policies for saved_adages table
-- This ensures users can only save/unsave their own adages
--
-- NOTE: This application currently uses NextAuth (not Supabase Auth), so auth.uid() 
-- will return NULL and these policies will block all operations if using the regular 
-- Supabase client. The API routes use supabaseAdmin to bypass RLS with manual 
-- validation. These policies are kept for defense-in-depth and future compatibility.
--
-- If you migrate to Supabase Auth, these policies will work as intended.

-- Enable RLS on saved_adages table
ALTER TABLE saved_adages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can save adages" ON saved_adages;
DROP POLICY IF EXISTS "Users can unsave adages" ON saved_adages;
DROP POLICY IF EXISTS "Users can view their saved adages" ON saved_adages;

-- Policy: Users can insert (save) adages where they are the user
CREATE POLICY "Users can save adages"
  ON saved_adages
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users can delete (unsave) their own saved adages
CREATE POLICY "Users can unsave adages"
  ON saved_adages
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Policy: Users can view their own saved adages
CREATE POLICY "Users can view their saved adages"
  ON saved_adages
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Note: auth.uid() is a Supabase function that returns the UUID of the authenticated user
-- If using a different authentication system, adjust accordingly

