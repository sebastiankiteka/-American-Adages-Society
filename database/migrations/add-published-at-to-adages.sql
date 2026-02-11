-- Migration: Add published_at field to adages table
-- Run this in Supabase SQL Editor

ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Set published_at for existing adages to their created_at date
UPDATE adages 
SET published_at = created_at 
WHERE published_at IS NULL AND deleted_at IS NULL;















