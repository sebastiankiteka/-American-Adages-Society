-- Migration: Create saved_adages table for user's saved adages
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS saved_adages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, adage_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_adages_user ON saved_adages(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_adages_adage ON saved_adages(adage_id) WHERE deleted_at IS NULL;















