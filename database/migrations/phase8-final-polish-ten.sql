-- =============================================================================
-- Phase 8 (preview) — Final polish: 10 PARTIAL adages → FULL (audit heuristic)
-- =============================================================================
-- Reference bar (audit-adage-template-completeness.sql):
--   etymology + historical_context + interpretation + modern_practicality
--   + first_known_usage + def>=100 + orig>=50 + tags>=2
--   + (variants + translations + usage_examples + timeline) >= 3
--
-- Selection: live audit — PARTIAL rows with gap_count 1 (all 6) + gap_count 2 (4 of 7).
-- Fix ONLY missing gaps; CASE for definition/origin; COALESCE not needed here;
-- NOT EXISTS on timeline (time_period_start fingerprint) and usage (official).
--
-- DO NOT EXECUTE until reviewed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Selected 10 — id + exact gaps vs reference (why “closest to FULL”)
-- -----------------------------------------------------------------------------
-- 1  ec00e7df-906a-40e2-b6e2-5a6badafeaf1  A penny saved is a penny earned
--    Gaps: origin thin (37 chars). All other template fields + enrichment already meet bar.
-- 2  b365b93c-9a9d-4c5b-8d16-3c06ce1f8fdc  The early bird catches the worm
--    Gaps: origin thin (45 chars). Prose + enrichment already strong.
-- 3  68af3dbb-d333-4cef-ab1a-404465ed7dad  It's a piece of cake
--    Gaps: enrichment only (usage 2 + timeline 0 → sum 2). One timeline row reaches 3.
-- 4  a7204fa2-7ad8-4ef2-a588-040109f11f56  Once in a blue moon
--    Gaps: enrichment only (usage 2 + timeline 0). One timeline row reaches 3.
-- 5  081da24c-5f1b-4e0e-91e8-7752d5d1c7b7  Penny wise and pound foolish
--    Gaps: enrichment only (usage 1 + timeline 0 → sum 1). Two timeline rows reach 3.
-- 6  0049ef4b-c07f-4f6d-a77a-d6077c2c7d58  Put that in your back pocket for a rainy day
--    Gaps: enrichment only (0+0+0+0). Two timelines + one official usage reach 3.
-- 7  4385ddee-7a6e-4742-8dcc-9bfb7e133135  Every dog has its day
--    Gaps: definition short (70) + enrichment (sum 1). Expand definition; two timelines.
-- 8  1ea2091f-bf55-4325-bfa2-0885ed05480b  If it ain't broke, don't fix it
--    Gaps: definition short (60) + enrichment (usage 1 only → sum 1). Expand definition; two timelines.
-- 9  ac828be2-f404-4888-a519-8ca5828b7c9c  Necessity is the mother of invention
--    Gaps: definition short (85) + enrichment (usage 1 only → sum 1). Expand definition; two timelines.
--10  e6e43f21-25b0-478b-8505-45034347ca46  Still waters run deep
--    Gaps: definition short (88) + enrichment (usage 1 only → sum 1). Expand definition; two timelines.
--
-- Omitted gap_count=2 (same audit tier, not in this batch of 4): The proof is in the pudding;
--   The squeaky wheel gets the grease; Where there's a will, there's a way.
-- =============================================================================

-- =============================================================================
-- A) Origin depth (thin vs reference: length < 50)
-- =============================================================================

-- ec00e7df — A penny saved is a penny earned
UPDATE adages SET
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Commonly attributed to Benjamin Franklin in American popular memory (Poor Richard’s Almanack tradition). The maxim treats thrift as economically equivalent to new income—an exaggeration for moral effect, not a literal accounting identity. Similar “save as earn” sentiments appear in earlier English and European advice literature; exact wording and date vary by printing.'
    ELSE origin
  END,
  updated_at = now()
WHERE id = 'ec00e7df-906a-40e2-b6e2-5a6badafeaf1'::uuid
  AND deleted_at IS NULL;

-- b365b93c — The early bird catches the worm
UPDATE adages SET
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverb in print, schoolroom morals, and journalism from the early modern period onward; the bird-and-worm image rewards punctuality and initiative. First attestations are scattered rather than tied to one famous author—treat it as circulated proverb wisdom with approximate dating in reference works.'
    ELSE origin
  END,
  updated_at = now()
WHERE id = 'b365b93c-9a9d-4c5b-8d16-3c06ce1f8fdc'::uuid
  AND deleted_at IS NULL;

-- =============================================================================
-- B) Definition length (short vs reference: length < 100)
-- =============================================================================

-- 4385ddee — Every dog has its day
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'Everyone is said to get a moment of luck, recognition, or advantage—when fortune turns their way for a time. The English proverb is not a guarantee of fairness; it counsels humility for the successful and patience for the overlooked. Speakers use it to console, to warn against counting others out, or to describe politics and careers where timing matters.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid
  AND deleted_at IS NULL;

-- 1ea2091f — If it ain't broke, don't fix it
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'If a system or habit is working well enough for its purpose, avoid unnecessary change that risks new defects. The line is common in engineering, IT, and operations; it cautions against cosmetic refactors and thrash, not against safety or ethical upgrades when evidence or regulation demands them.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid
  AND deleted_at IS NULL;

-- ac828be2 — Necessity is the mother of invention
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'When people need an outcome badly enough, they often invent workarounds, tools, and institutions—constraint becomes a spur to ingenuity. The saying describes a familiar pattern in crisis, poverty, and everyday life; it does not claim every need is met justly, quickly, or without harm along the way.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid
  AND deleted_at IS NULL;

-- e6e43f21 — Still waters run deep
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'Quiet or reserved people are often thought to have depth—strong feeling, intelligence, or motive beneath a calm surface. The metaphor is cautionary too: stillness can hide turmoil or risk. Use it with care in personal judgment, not as a stereotype about temperament or character.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid
  AND deleted_at IS NULL;

-- =============================================================================
-- C) Enrichment — adage_timeline (NOT EXISTS on adage_id + time_period_start)
-- =============================================================================

-- 68af3dbb — It's a piece of cake (+1 toward sum >= 3)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid, '1950-01-01', '1999-12-31', 'common',
  'Informal American English; generalization from “easy treat” to trivial task; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- a7204fa2 — Once in a blue moon (+1)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid, '1900-01-01', '1969-12-31', 'uncommon',
  'Colloquial rarity idiom; “blue moon” sense varies (calendar vs folklore); Anglophone spread.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- 081da24c — Penny wise and pound foolish (+2)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid, '1700-01-01', '1899-12-31', 'common',
  'British currency proverb; household and essay literature; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1700-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid, '1900-01-01', NULL, 'very_common',
  'Personal finance, policy, and workplace talk in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- 0049ef4b — Put that in your back pocket for a rainy day (+2 timeline; +1 usage below)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '0049ef4b-c07f-4f6d-a77a-d6077c2c7d58'::uuid, '1920-01-01', '1979-12-31', 'uncommon',
  'American colloquial savings/reserve idiom; print and spoken advice; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '0049ef4b-c07f-4f6d-a77a-d6077c2c7d58'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1920-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '0049ef4b-c07f-4f6d-a77a-d6077c2c7d58'::uuid, '1980-01-01', NULL, 'common',
  'Coaching, HR, and everyday planning discourse in late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '0049ef4b-c07f-4f6d-a77a-d6077c2c7d58'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1980-01-01'
);

-- 4385ddee — Every dog has its day (+2)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid, '1600-01-01', '1899-12-31', 'common',
  'English literary and proverbial use; Chaucer/Shakespeare echoes; wording unstable across centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid, '1900-01-01', NULL, 'very_common',
  'Journalism, sports, and everyday consolation in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- 1ea2091f — If it ain't broke, don't fix it (+2; prior sum was usage 1 only)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid, '1950-01-01', '1979-12-31', 'uncommon',
  'Informal American maintenance and folk engineering talk; exact origin lines fuzzy.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid, '1980-01-01', NULL, 'very_common',
  'IT operations, change management, and everyday office speech in late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1980-01-01'
);

-- ac828be2 — Necessity is the mother of invention (+2; prior sum was usage 1 only)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid, '1600-01-01', '1699-12-31', 'uncommon',
  'Early modern English moral and essay literature; classical echoes; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid, '1700-01-01', '1899-12-31', 'common',
  'English proverb print tradition; innovation and crisis narratives; phrasing debated.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1700-01-01'
);

-- e6e43f21 — Still waters run deep (+2; prior sum was usage 1 only)
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid, '1600-01-01', '1799-12-31', 'common',
  'European literary parallels; proverbial consolidation in English letters; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid, '1800-01-01', NULL, 'very_common',
  'Psychology, education, and everyday character talk in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1800-01-01'
);

-- =============================================================================
-- D) Enrichment — official usage (0049ef4b only: completes sum to 3)
-- =============================================================================

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT
  '0049ef4b-c07f-4f6d-a77a-d6077c2c7d58'::uuid,
  'Keep that vendor backup plan in your back pocket for a rainy day—don’t spend it on a routine refresh.',
  'Business continuity',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '0049ef4b-c07f-4f6d-a77a-d6077c2c7d58'::uuid
    AND e.source_type = 'official'
    AND e.deleted_at IS NULL
    AND e.hidden_at IS NULL
);
