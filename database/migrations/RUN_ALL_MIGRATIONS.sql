-- ============================================
-- American Adages Society - Complete Migration Script
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- All migrations are idempotent (safe to run multiple times)
-- ============================================

-- ============================================
-- 1. Main Database Schema
-- ============================================
-- Run the complete schema from: database/schema.sql
-- This creates all tables, indexes, triggers, and functions

-- ============================================
-- 2. Message Replies Table (for threaded inbox conversations)
-- ============================================
CREATE TABLE IF NOT EXISTS message_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID REFERENCES users(id), -- admin user_id or null for user replies
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_message_replies_message ON message_replies(message_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_message_replies_created ON message_replies(created_at) WHERE deleted_at IS NULL;

-- ============================================
-- 3. Saved Adages Table (for user's saved adages)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_adages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, adage_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_adages_user ON saved_adages(user_id) WHERE deleted_at IS NULL;

-- ============================================
-- 4. Notifications Table (for user notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('report_accepted', 'report_rejected', 'report_warning', 'comment_deleted', 'appeal_response', 'general')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type VARCHAR(50),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE deleted_at IS NULL AND read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_adages_adage ON saved_adages(adage_id) WHERE deleted_at IS NULL;

-- ============================================
-- 4. Contact Messages Category Constraint Update
-- ============================================
ALTER TABLE contact_messages 
DROP CONSTRAINT IF EXISTS contact_messages_category_check;

ALTER TABLE contact_messages 
ADD CONSTRAINT contact_messages_category_check 
CHECK (category IN ('general', 'correction', 'event', 'partnership', 'donation', 'get_involved', 'other'));

-- ============================================
-- 5. Add published_at to Adages
-- ============================================
ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

UPDATE adages 
SET published_at = created_at 
WHERE published_at IS NULL AND deleted_at IS NULL;

-- ============================================
-- 6. Sample Forum Section (Optional - for testing)
-- ============================================
-- See: database/migrations/add-sample-forum-section.sql
-- This creates a "General Discussion" section with a welcome thread

-- ============================================
-- 7. Appeal Tracking for Reader Challenges
-- ============================================
ALTER TABLE reader_challenges 
ADD COLUMN IF NOT EXISTS appeal_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS appeal_allowed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_appeal_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS appeal_decision VARCHAR(20) CHECK (appeal_decision IN ('accepted', 'rejected', NULL));

CREATE INDEX IF NOT EXISTS idx_challenges_appeal ON reader_challenges(appeal_allowed, appeal_decision) WHERE deleted_at IS NULL;

-- ============================================
-- 8. Stats Performance Indexes
-- ============================================
-- See: database/migrations/add-stats-indexes.sql
-- This adds indexes to improve performance of the /api/users/[id]/stats endpoint
-- IMPORTANT: Run add-stats-indexes.sql separately in Supabase SQL Editor

-- ============================================
-- 9. Privacy Field for Users
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_private BOOLEAN DEFAULT FALSE;

-- ============================================
-- 10. Friend Request Notifications
-- ============================================
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('report_accepted', 'report_rejected', 'report_warning', 'comment_deleted', 'appeal_response', 'general', 'friend_request', 'system'));

-- ============================================
-- 11. Password Reset Tokens
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);

-- ============================================
-- 12. Geographic Fields for Timeline
-- ============================================
ALTER TABLE adage_timeline 
ADD COLUMN IF NOT EXISTS primary_location TEXT,
ADD COLUMN IF NOT EXISTS geographic_changes TEXT;

-- ============================================
-- 13. Featured Adages History
-- ============================================
CREATE TABLE IF NOT EXISTS featured_adages_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  featured_from TIMESTAMP WITH TIME ZONE NOT NULL,
  featured_until TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_featured_history_adage ON featured_adages_history(adage_id);
CREATE INDEX IF NOT EXISTS idx_featured_history_dates ON featured_adages_history(featured_from, featured_until);
-- Note: Cannot create index with NOW() in predicate (not immutable)
-- Queries can still filter by current date at query time efficiently using the dates index above

-- ============================================
-- 6. Profile Features and Ban Reason
-- ============================================
-- Add featured_comments, profile_private, ban_reason, ban_date, and appeal_email to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS featured_comments UUID[] DEFAULT '{}';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_private BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ban_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS appeal_email VARCHAR(255);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS comments_friends_only BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_featured_comments ON users USING GIN(featured_comments) WHERE featured_comments IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_profile_private ON users(profile_private) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_banned ON users(role, ban_date) WHERE role = 'banned' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_comments_friends_only ON users(comments_friends_only) WHERE deleted_at IS NULL;

-- ============================================
-- 7. Profile Comments Support
-- ============================================
-- Allow comments to be made directly on user profiles
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'comments_target_type_check'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_target_type_check;
    END IF;
END $$;

ALTER TABLE comments 
ADD CONSTRAINT comments_target_type_check 
CHECK (target_type IN ('blog', 'adage', 'forum', 'user'));

-- ============================================
-- 8. Mailing List Preferences
-- ============================================
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

-- Add inbox-only notification preference
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_inbox_only BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email_inbox_only ON users(email_inbox_only) WHERE email_inbox_only = TRUE AND deleted_at IS NULL;

-- ============================================
-- 9. Update Mailing List Source Constraint
-- ============================================
-- Allow 'profile' as a valid source for mailing list subscriptions
ALTER TABLE mailing_list 
DROP CONSTRAINT IF EXISTS mailing_list_source_check;

ALTER TABLE mailing_list 
ADD CONSTRAINT mailing_list_source_check 
CHECK (source IN ('contact', 'signup', 'forum', 'profile'));

-- ============================================
-- Documents Table (for transparency section)
-- ============================================
-- Run: database/migrations/create-documents-table.sql
-- This creates the documents table for managing transparency documents

-- ============================================
-- Migration Complete!
-- ============================================
-- All tables, indexes, and constraints are now in place.
-- You can now use the full feature set of the American Adages Society website.
-- 
-- Don't forget to run: database/migrations/add-stats-indexes.sql
-- This will significantly improve commendation stats query performance.

