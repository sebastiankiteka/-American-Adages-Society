-- Migration: Add 'get_involved' category to contact_messages
-- Run this in Supabase SQL Editor

ALTER TABLE contact_messages 
DROP CONSTRAINT IF EXISTS contact_messages_category_check;

ALTER TABLE contact_messages 
ADD CONSTRAINT contact_messages_category_check 
CHECK (category IN ('general', 'correction', 'event', 'partnership', 'donation', 'get_involved', 'other'));



