-- AAS × Anthropological Society collaboration: April 14, 2026, 6:30 PM – 7:30 PM CDT
-- William C. Powers, Jr. Student Activity Center, WCP 5.118 (address as provided)
-- Run in Supabase SQL Editor when ready. Idempotent if title+start match.

INSERT INTO events (
  title,
  description,
  event_date,
  end_date,
  location,
  event_type,
  related_adage_ids,
  created_by,
  created_at
)
SELECT
  'American Adages Society × Anthropological Society Collaboration',
  E'A collaborative session between the American Adages Society and the Anthropological Society exploring the cultural, linguistic, and historical significance of proverbs across societies, with attention to how adages evolve, transmit meaning, and reflect collective identity.',
  '2026-04-14T23:30:00+00',
  '2026-04-15T00:30:00+00',
  'William C. Powers, Jr. Student Activity Center — 2201 Speedyway, Austin, TX 78713, United States — Room WCP 5.118',
  'discussion',
  ARRAY[]::uuid[],
  (SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM events
  WHERE title = 'American Adages Society × Anthropological Society Collaboration'
    AND event_date = '2026-04-14T23:30:00+00'::timestamptz
    AND deleted_at IS NULL
);
