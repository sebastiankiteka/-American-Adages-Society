-- Migration: Add profile features and ban reason
-- Adds featured_comments, profile_private, and ban_reason fields to users table

-- Add featured_comments array to store featured comment IDs
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS featured_comments UUID[] DEFAULT '{}';

-- Add profile_private flag to prevent comments on profile
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_private BOOLEAN DEFAULT FALSE;

-- Add ban_reason field to store reason for ban
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Add ban_date to track when user was banned
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ban_date TIMESTAMP WITH TIME ZONE;

-- Add appeal_email field to track appeal email address
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS appeal_email VARCHAR(255);

-- Add comments_friends_only flag to restrict comments to friends only
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS comments_friends_only BOOLEAN DEFAULT FALSE;

-- Create index for featured_comments
CREATE INDEX IF NOT EXISTS idx_users_featured_comments ON users USING GIN(featured_comments) WHERE featured_comments IS NOT NULL;

-- Create index for profile_private
CREATE INDEX IF NOT EXISTS idx_users_profile_private ON users(profile_private) WHERE deleted_at IS NULL;

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_users_banned ON users(role, ban_date) WHERE role = 'banned' AND deleted_at IS NULL;

-- Create index for comments_friends_only
CREATE INDEX IF NOT EXISTS idx_users_comments_friends_only ON users(comments_friends_only) WHERE deleted_at IS NULL;

