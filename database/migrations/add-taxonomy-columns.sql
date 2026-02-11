-- Migration: Add taxonomy columns to adages table
-- This migration adds support for categorizing sayings by type
-- Run this migration to prepare for taxonomy expansion

-- Add type column with default value 'adage' for existing rows
ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'adage' 
CHECK (type IN ('adage', 'proverb', 'idiom', 'aphorism', 'colloquialism'));

-- Update existing rows to have type='adage' if they don't have a type set
UPDATE adages 
SET type = 'adage' 
WHERE type IS NULL;

-- Make type NOT NULL after setting defaults
ALTER TABLE adages 
ALTER COLUMN type SET NOT NULL;

-- Add optional fields for future taxonomy expansion
ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS first_recorded DATE;

ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS region TEXT;

ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS era TEXT;

ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS advisory BOOLEAN DEFAULT TRUE;

ALTER TABLE adages 
ADD COLUMN IF NOT EXISTS vulgarity_flag BOOLEAN DEFAULT FALSE;

-- Add index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_adages_type ON adages(type) WHERE deleted_at IS NULL;

-- Add comment to document the type column
COMMENT ON COLUMN adages.type IS 'Taxonomy classification: adage (wisdom statement), proverb (traditional cultural wisdom), idiom (figurative expression), aphorism (concise statement), colloquialism (informal expression)';

