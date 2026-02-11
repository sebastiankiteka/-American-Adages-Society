-- Migration: Add appeal tracking to reader_challenges
-- Run this in Supabase SQL Editor

-- Add appeal fields to reader_challenges
ALTER TABLE reader_challenges 
ADD COLUMN IF NOT EXISTS appeal_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS appeal_allowed BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_appeal_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS appeal_decision VARCHAR(20) CHECK (appeal_decision IN ('accepted', 'rejected', NULL));

-- Add index for appeal queries
CREATE INDEX IF NOT EXISTS idx_challenges_appeal ON reader_challenges(appeal_allowed, appeal_decision) WHERE deleted_at IS NULL;















