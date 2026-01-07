-- Migration: Create message_replies table for threaded conversations
-- Run this in Supabase SQL Editor

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



