-- Migration: Add reply support to contact messages
-- Run this in Supabase SQL Editor

-- Add reply fields to contact_messages
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reply_text TEXT,
ADD COLUMN IF NOT EXISTS reply_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES users(id);

-- Add index for user inbox queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_user ON contact_messages(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contact_messages_reply ON contact_messages(reply_sent_at) WHERE reply_sent_at IS NOT NULL;



