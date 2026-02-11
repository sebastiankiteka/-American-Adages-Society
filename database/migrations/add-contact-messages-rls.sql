-- Add Row Level Security (RLS) policies for contact_messages table
-- This allows public/anonymous users to submit contact forms while keeping other operations secure
--
-- NOTE: This application uses NextAuth (not Supabase Auth), so auth.uid() will return NULL.
-- For contact form submissions, we allow anonymous inserts. For admin operations, the API routes
-- use supabaseAdmin to bypass RLS with manual validation.

-- Enable RLS on contact_messages table
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow public contact form submissions" ON contact_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON contact_messages;

-- Policy: Allow anonymous/public users to insert contact messages
-- WITH CHECK ensures basic validation (message length, email format)
-- Note: Using 'public' role includes both 'anon' and 'authenticated' roles
CREATE POLICY "Allow public contact form submissions"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    -- Basic validation: message must be at least 10 characters
    length(message) >= 10
    AND length(message) <= 5000
    -- Name must be at least 2 characters
    AND length(name) >= 2
    AND length(name) <= 255
    -- Email must match basic format (PostgreSQL regex)
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND length(email) <= 255
    -- Category must be valid
    AND category IN ('general', 'correction', 'event', 'partnership', 'donation', 'get_involved', 'other')
  );

-- Policy: Users can view their own messages (if user_id is set)
CREATE POLICY "Users can view their own messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    user_id IS NOT NULL
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Policy: Admins can view all non-deleted messages
-- Note: This checks for admin role in the users table
CREATE POLICY "Admins can view all messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
    AND deleted_at IS NULL
  );

-- Policy: Admins can update messages
CREATE POLICY "Admins can update messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
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

-- Policy: Admins can delete (soft delete) messages
CREATE POLICY "Admins can delete messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Note: The 'anon' role in Supabase represents unauthenticated users
-- The 'authenticated' role represents logged-in users (even with NextAuth, Supabase still recognizes authenticated sessions)

