-- Verification script to check if email preference columns exist
-- Run this in Supabase SQL Editor to see which columns are missing

-- Check if email preference columns exist
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN (
    'email_weekly_adage',
    'email_events',
    'email_site_updates',
    'email_archive_additions',
    'email_comment_notifications',
    'email_inbox_only'
  )
ORDER BY column_name;

-- If the query returns fewer than 6 rows, some columns are missing
-- Run the appropriate migrations:
-- - database/migrations/add-mailing-list-preferences.sql (for first 5 columns)
-- - database/migrations/add-inbox-only-notifications.sql (for email_inbox_only)














