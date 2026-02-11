-- Fix RLS for views table - Allow inserts for tracking views
-- The views table needs to allow inserts from server-side code (via supabaseAdmin)
-- Since we use supabaseAdmin, RLS shouldn't block, but it's safer to have policies

-- Option 1: Disable RLS on views table (simplest - since we use supabaseAdmin anyway)
-- This is safe because views are only inserted via server-side API routes using supabaseAdmin
ALTER TABLE views DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create a policy to allow inserts
-- Uncomment below if you prefer to keep RLS enabled:
/*
ALTER TABLE views ENABLE ROW LEVEL SECURITY;

-- Allow inserts from any role (since we use supabaseAdmin which bypasses RLS anyway)
CREATE POLICY "Allow view tracking inserts"
  ON views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to read all views (for analytics)
CREATE POLICY "Admins can view all analytics"
  ON views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'moderator')
    )
  );
*/

-- Note: We're disabling RLS because:
-- 1. Views are only inserted via server-side API routes using supabaseAdmin (bypasses RLS)
-- 2. Views are only read via admin API routes using supabaseAdmin (bypasses RLS)
-- 3. No client-side code directly accesses the views table
-- 4. This simplifies the setup and avoids any potential RLS blocking issues

