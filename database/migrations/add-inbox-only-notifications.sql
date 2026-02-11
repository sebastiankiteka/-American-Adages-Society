-- Migration: Add inbox-only notification preference
-- Allows users to receive notifications in their inbox without email

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_inbox_only BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email_inbox_only ON users(email_inbox_only) WHERE email_inbox_only = TRUE AND deleted_at IS NULL;














