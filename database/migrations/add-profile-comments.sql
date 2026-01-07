-- Migration: Add profile comments support
-- Allows comments to be made directly on user profiles

-- Update comments table to allow 'user' as target_type
-- First, drop the existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'comments_target_type_check'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT comments_target_type_check;
    END IF;
END $$;

-- Add new constraint with 'user' included
ALTER TABLE comments 
ADD CONSTRAINT comments_target_type_check 
CHECK (target_type IN ('blog', 'adage', 'forum', 'user'));

