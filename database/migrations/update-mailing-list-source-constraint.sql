-- Migration: Update mailing_list source constraint to allow 'profile'
-- Fixes the constraint violation when subscribing from profile page

-- Drop the existing constraint
ALTER TABLE mailing_list 
DROP CONSTRAINT IF EXISTS mailing_list_source_check;

-- Add new constraint with 'profile' included
ALTER TABLE mailing_list 
ADD CONSTRAINT mailing_list_source_check 
CHECK (source IN ('contact', 'signup', 'forum', 'profile'));














