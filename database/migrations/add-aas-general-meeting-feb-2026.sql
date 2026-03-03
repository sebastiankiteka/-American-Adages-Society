-- Add AAS General Meeting event: February 26, 2026, 2:00 PM – 3:00 PM CST
-- Location: PCL, Room 5.104. Organization: American Adages Society (AAS)
-- Run in Supabase SQL Editor if you prefer not to use the Node script.

INSERT INTO events (
  title,
  description,
  event_date,
  end_date,
  location,
  event_type,
  created_by
)
SELECT
  'AAS General Meeting',
  E'General meeting of the American Adages Society.\n\nTime: 2:00 PM – 3:00 PM CST\nOrganization: American Adages Society (AAS)',
  '2026-02-26 20:00:00+00',
  '2026-02-26 21:00:00+00',
  'PCL, Room 5.104',
  'other',
  (SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM events
  WHERE title = 'AAS General Meeting'
    AND event_date = '2026-02-26 20:00:00+00'
    AND deleted_at IS NULL
);
