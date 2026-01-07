-- Migration: Create notifications table for user notifications
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('report_accepted', 'report_rejected', 'report_warning', 'comment_deleted', 'appeal_response', 'general')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- ID of related item (challenge_id, comment_id, etc.)
  related_type VARCHAR(50), -- Type of related item ('challenge', 'comment', etc.)
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE deleted_at IS NULL AND read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC) WHERE deleted_at IS NULL;



