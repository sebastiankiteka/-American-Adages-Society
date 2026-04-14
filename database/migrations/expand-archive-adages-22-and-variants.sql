-- =============================================================================
-- Prerequisites: site_metrics + safe refresh_total_adages_metric()
-- Ensures adages triggers do not fail when site_metrics is missing.
-- =============================================================================

CREATE TABLE IF NOT EXISTS site_metrics (
  key TEXT PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO site_metrics (key, value, updated_at)
SELECT 'total_adages', COUNT(*)::BIGINT, NOW()
FROM adages
WHERE deleted_at IS NULL
  AND hidden_at IS NULL
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

CREATE OR REPLACE FUNCTION public.refresh_total_adages_metric()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'site_metrics'
  ) THEN
    INSERT INTO site_metrics (key, value, updated_at)
    SELECT 'total_adages', COUNT(*)::BIGINT, NOW()
    FROM adages
    WHERE deleted_at IS NULL
      AND hidden_at IS NULL
    ON CONFLICT (key)
    DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW();
  END IF;

  RETURN NULL;
END;
$$;

-- =============================================================================
-- Expand AAS archive: 22 new adages + primary/variant cleanup for known duplicates.
--
-- Reference entry (DO NOT MODIFY): id = '0d588e53-a308-420c-9088-2319635562e0'
--   Any UPDATE below skips this UUID so the canonical formatting reference row is untouched.
--
-- Duplicate policy:
--   Primary: Don't count your chickens before they hatch
--   Variant: Don't count your chickens before they are hatched
--   Primary: Don't put all your eggs in one basket
--   Variant: Don't put your eggs all in one basket
--
-- Safe to run more than once: inserts use NOT EXISTS; variants use NOT EXISTS;
-- updates are idempotent for matching text.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Standardize primary adage text (excluding reference UUID)
-- -----------------------------------------------------------------------------

UPDATE adages
SET
  adage = 'Don''t count your chickens before they hatch',
  updated_at = now()
WHERE adage = 'Don''t count your chickens before they are hatched'
  AND deleted_at IS NULL
  AND id <> '0d588e53-a308-420c-9088-2319635562e0'::uuid;

UPDATE adages
SET
  adage = 'Don''t put all your eggs in one basket',
  updated_at = now()
WHERE adage = 'Don''t put your eggs all in one basket'
  AND deleted_at IS NULL
  AND id <> '0d588e53-a308-420c-9088-2319635562e0'::uuid;

-- -----------------------------------------------------------------------------
-- 2) Attach variants (only when primary row exists and variant not already present)
-- -----------------------------------------------------------------------------

INSERT INTO adage_variants (adage_id, variant_text, notes)
SELECT
  a.id,
  'Don''t count your chickens before they are hatched',
  'Alternate wording; same meaning.'
FROM adages a
WHERE a.adage = 'Don''t count your chickens before they hatch'
  AND a.deleted_at IS NULL
  AND a.id <> '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND NOT EXISTS (
    SELECT 1
    FROM adage_variants av
    WHERE av.adage_id = a.id
      AND av.variant_text = 'Don''t count your chickens before they are hatched'
      AND av.deleted_at IS NULL
  );

INSERT INTO adage_variants (adage_id, variant_text, notes)
SELECT
  a.id,
  'Don''t put your eggs all in one basket',
  'Alternate word order; same meaning.'
FROM adages a
WHERE a.adage = 'Don''t put all your eggs in one basket'
  AND a.deleted_at IS NULL
  AND a.id <> '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND NOT EXISTS (
    SELECT 1
    FROM adage_variants av
    WHERE av.adage_id = a.id
      AND av.variant_text = 'Don''t put your eggs all in one basket'
      AND av.deleted_at IS NULL
  );

-- -----------------------------------------------------------------------------
-- 3) Insert 22 new archive adages (skip if same adage text already exists)
-- -----------------------------------------------------------------------------

INSERT INTO adages (
  id,
  adage,
  definition,
  origin,
  first_known_usage,
  tags,
  created_at,
  updated_at,
  created_by,
  published_at
)
SELECT
  gen_random_uuid(),
  v.adage,
  v.definition,
  v.origin,
  v.first_known_usage,
  v.tags,
  now(),
  now(),
  (SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1),
  now()
FROM (
  VALUES
    (
      'Trust, but verify',
      'Have confidence in others, but always confirm facts independently before relying on them. This emphasizes balancing trust with accountability.',
      'Russian proverb; popularized in English during the Cold War.',
      'Cold War era',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'The road to hell is paved with good intentions',
      'Good intentions alone are not enough; poorly executed actions can still lead to harmful outcomes.',
      'English proverb; medieval roots.',
      'Medieval proverb',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'What gets measured gets managed',
      'Tracking and measuring something is necessary to control, improve, or optimize it effectively.',
      'Commonly attributed to Peter Drucker (attribution debated).',
      '20th-century management',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'Absence makes the heart grow fonder',
      'Spending time apart can increase appreciation and affection for someone or something.',
      'English proverb; 19th century.',
      '19th-century English',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'The pen is mightier than the sword',
      'Ideas, writing, and communication have more lasting influence than force or violence.',
      'Edward Bulwer-Lytton, 1839.',
      '1839 literature',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'You can''t pour from an empty cup',
      'You must take care of your own well-being before you can effectively support others.',
      'Modern proverb.',
      'Modern proverb',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'A rising tide lifts all boats',
      'When general conditions improve, everyone benefits, not just a select few.',
      'Popularized in American political discourse.',
      'Modern American',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'He who has a why to live can bear almost any how',
      'A strong sense of purpose allows a person to endure great hardship or suffering.',
      'Friedrich Nietzsche.',
      'Philosophy (Nietzsche)',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'An ounce of prevention is worth a pound of cure',
      'Preventing problems early is far easier and more effective than fixing them later.',
      'Attributed to Benjamin Franklin.',
      'Early American proverb',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'Many hands make light work',
      'Tasks become easier and more efficient when people cooperate and share effort.',
      'English proverb.',
      'Traditional English',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'The apple doesn''t fall far from the tree',
      'Children often resemble their parents in behavior, character, or traits.',
      'European proverb.',
      'European proverb',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'You can lead a horse to water, but you can''t make it drink',
      'You can provide opportunity or guidance, but you cannot force someone to act or accept it.',
      'English proverb.',
      'Traditional English',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'The nail that sticks out gets hammered down',
      'Those who stand out too much may face criticism, pressure, or suppression from others.',
      'Japanese proverb.',
      'Japanese proverb',
      ARRAY['archive', 'English', 'Japanese']::text[]
    ),
    (
      'Fall seven times, stand up eight',
      'Persistence and resilience are more important than avoiding failure.',
      'Japanese proverb.',
      'Japanese proverb',
      ARRAY['archive', 'English', 'Japanese']::text[]
    ),
    (
      'Better to light a candle than curse the darkness',
      'It is more productive to take action than to complain about a problem.',
      'Often attributed to Chinese philosophical tradition.',
      'Chinese tradition (attributed)',
      ARRAY['archive', 'English', 'Chinese']::text[]
    ),
    (
      'When elephants fight, it is the grass that suffers',
      'Conflicts between powerful groups often harm ordinary people the most.',
      'African proverb.',
      'African proverb',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'Even a stopped clock is right twice a day',
      'Even unreliable or incorrect sources can occasionally be correct.',
      'English proverb.',
      'Traditional English',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'A chain is only as strong as its weakest link',
      'The overall strength of a system is limited by its weakest component.',
      'English proverb.',
      'Traditional English',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'The best time to plant a tree was 20 years ago. The second best time is now',
      'It is always better to begin late than to never begin at all.',
      'Chinese proverb (attributed).',
      'Chinese proverb (attributed)',
      ARRAY['archive', 'English', 'Chinese']::text[]
    ),
    (
      'Do not mistake motion for progress',
      'Being busy or active does not necessarily mean you are achieving meaningful results.',
      'Commonly attributed to Alfred A. Montapert.',
      '20th century',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'A smooth sea never made a skilled sailor',
      'Challenges and difficulties are necessary for developing strength and competence.',
      'English proverb.',
      'Traditional English',
      ARRAY['archive', 'English']::text[]
    ),
    (
      'An apple a day keeps the doctor away',
      'Maintaining healthy habits helps prevent illness and reduces the need for medical care.',
      'Welsh proverb; 19th century.',
      'Welsh / 19th century',
      ARRAY['archive', 'English', 'Welsh']::text[]
    )
) AS v(adage, definition, origin, first_known_usage, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM adages a WHERE a.adage = v.adage AND a.deleted_at IS NULL
);

-- =============================================================================
-- Post-migration verification (read-only; run after the block above succeeds)
-- =============================================================================

-- 1) Total canonical adages (rows in adages, excluding soft-deleted)
SELECT count(*)::int AS canonical_adages_total
FROM adages
WHERE deleted_at IS NULL;

-- 2) Canonical row: Don’t count your chickens before they hatch
SELECT id, adage, origin, updated_at
FROM adages
WHERE adage = 'Don''t count your chickens before they hatch'
  AND deleted_at IS NULL;

-- 3) Variants for that primary
SELECT v.id, v.adage_id, v.variant_text, v.notes
FROM adage_variants v
JOIN adages a ON a.id = v.adage_id
WHERE a.adage = 'Don''t count your chickens before they hatch'
  AND a.deleted_at IS NULL
  AND v.deleted_at IS NULL;

-- 4) Canonical row: Don’t put all your eggs in one basket
SELECT id, adage, origin, updated_at
FROM adages
WHERE adage = 'Don''t put all your eggs in one basket'
  AND deleted_at IS NULL;

-- 5) Variants for that primary
SELECT v.id, v.adage_id, v.variant_text, v.notes
FROM adage_variants v
JOIN adages a ON a.id = v.adage_id
WHERE a.adage = 'Don''t put all your eggs in one basket'
  AND a.deleted_at IS NULL
  AND v.deleted_at IS NULL;

-- 6) New batch: summary (expect new_adages_found = 22)
SELECT count(*)::int AS new_adages_found, 22 AS expected_total
FROM adages
WHERE deleted_at IS NULL
  AND adage IN (
    'Trust, but verify',
    'The road to hell is paved with good intentions',
    'What gets measured gets managed',
    'Absence makes the heart grow fonder',
    'The pen is mightier than the sword',
    'You can''t pour from an empty cup',
    'A rising tide lifts all boats',
    'He who has a why to live can bear almost any how',
    'An ounce of prevention is worth a pound of cure',
    'Many hands make light work',
    'The apple doesn''t fall far from the tree',
    'You can lead a horse to water, but you can''t make it drink',
    'The nail that sticks out gets hammered down',
    'Fall seven times, stand up eight',
    'Better to light a candle than curse the darkness',
    'When elephants fight, it is the grass that suffers',
    'Even a stopped clock is right twice a day',
    'A chain is only as strong as its weakest link',
    'The best time to plant a tree was 20 years ago. The second best time is now',
    'Do not mistake motion for progress',
    'A smooth sea never made a skilled sailor',
    'An apple a day keeps the doctor away'
  );

-- 6b) Per-row checklist (each row should have present = true)
WITH expected(adage) AS (
  VALUES
    ('Trust, but verify'),
    ('The road to hell is paved with good intentions'),
    ('What gets measured gets managed'),
    ('Absence makes the heart grow fonder'),
    ('The pen is mightier than the sword'),
    ('You can''t pour from an empty cup'),
    ('A rising tide lifts all boats'),
    ('He who has a why to live can bear almost any how'),
    ('An ounce of prevention is worth a pound of cure'),
    ('Many hands make light work'),
    ('The apple doesn''t fall far from the tree'),
    ('You can lead a horse to water, but you can''t make it drink'),
    ('The nail that sticks out gets hammered down'),
    ('Fall seven times, stand up eight'),
    ('Better to light a candle than curse the darkness'),
    ('When elephants fight, it is the grass that suffers'),
    ('Even a stopped clock is right twice a day'),
    ('A chain is only as strong as its weakest link'),
    ('The best time to plant a tree was 20 years ago. The second best time is now'),
    ('Do not mistake motion for progress'),
    ('A smooth sea never made a skilled sailor'),
    ('An apple a day keeps the doctor away')
)
SELECT
  e.adage,
  (a.id IS NOT NULL) AS present,
  a.id AS adage_id
FROM expected e
LEFT JOIN adages a ON a.adage = e.adage AND a.deleted_at IS NULL
ORDER BY e.adage;

-- 7) Duplicate canonical texts (same adage string on more than one row)
SELECT adage, count(*)::int AS row_count
FROM adages
WHERE deleted_at IS NULL
GROUP BY adage
HAVING count(*) > 1
ORDER BY adage;
