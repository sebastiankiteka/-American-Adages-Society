-- Migration: Add mailing list preferences
-- Adds preferences for what users want to receive via email

-- Add mailing list preferences to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_weekly_adage BOOLEAN DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_events BOOLEAN DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_site_updates BOOLEAN DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_archive_additions BOOLEAN DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_comment_notifications BOOLEAN DEFAULT TRUE;

-- Link mailing_list to users (for logged-in users)
ALTER TABLE mailing_list 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user_id in mailing_list
CREATE INDEX IF NOT EXISTS idx_mailing_list_user ON mailing_list(user_id) WHERE user_id IS NOT NULL;

-- Create indexes for email preferences
CREATE INDEX IF NOT EXISTS idx_users_email_weekly_adage ON users(email_weekly_adage) WHERE email_weekly_adage = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_events ON users(email_events) WHERE email_events = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_site_updates ON users(email_site_updates) WHERE email_site_updates = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_archive_additions ON users(email_archive_additions) WHERE email_archive_additions = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_comment_notifications ON users(email_comment_notifications) WHERE email_comment_notifications = TRUE AND deleted_at IS NULL;


