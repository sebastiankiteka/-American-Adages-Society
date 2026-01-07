-- Add privacy field to users table to prevent friend requests
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_private BOOLEAN DEFAULT FALSE;



