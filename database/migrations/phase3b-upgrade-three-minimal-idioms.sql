-- =============================================================================
-- Phase 3b — Three remaining MINIMAL idioms → PARTIAL (definition + enrichment)
-- =============================================================================
-- Targets only:
--   3d41c368-506a-4272-9175-66b50914db3b — Grinding my gears
--   68af3dbb-d333-4cef-ab1a-404465ed7dad — It's a piece of cake
--   a7204fa2-7ad8-4ef2-a588-040109f11f56 — Once in a blue moon
--
-- Definition: expanded only when current length < 100 characters (idempotent).
-- Usage: second official example per adage (skipped if that exact text already exists).
-- Variant: one legitimate wording for "Grinding my gears" only.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3d41c368-506a-4272-9175-66b50914db3b — Grinding my gears
-- -----------------------------------------------------------------------------
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'To say that something or someone is grinding your gears is to complain that they cause persistent irritation or frustration, often in a repeated, low-grade way. The idiom is informal American English and is used in speech or casual writing rather than in formal registers.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = '3d41c368-506a-4272-9175-66b50914db3b'::uuid
  AND deleted_at IS NULL;

INSERT INTO adage_variants (adage_id, variant_text, notes)
SELECT
  '3d41c368-506a-4272-9175-66b50914db3b'::uuid,
  'You really grind my gears',
  'Common wording with explicit subject; same informal register.'
WHERE NOT EXISTS (
  SELECT 1 FROM adage_variants v
  WHERE v.adage_id = '3d41c368-506a-4272-9175-66b50914db3b'::uuid
    AND v.variant_text = 'You really grind my gears'
    AND v.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT
  '3d41c368-506a-4272-9175-66b50914db3b'::uuid,
  'Having to restate the same policy every week really grinds my gears.',
  'Workplace',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '3d41c368-506a-4272-9175-66b50914db3b'::uuid
    AND e.deleted_at IS NULL
    AND e.example_text = 'Having to restate the same policy every week really grinds my gears.'
);

-- -----------------------------------------------------------------------------
-- 68af3dbb-d333-4cef-ab1a-404465ed7dad — It's a piece of cake
-- -----------------------------------------------------------------------------
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'Something described as a piece of cake is very easy to do or to complete, relative to the speaker''s skill, preparation, or the task''s actual demands. The phrase is informal and is used to reassure, to report ease, or sometimes to downplay difficulty others may still experience.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid
  AND deleted_at IS NULL;

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT
  '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid,
  'The first deployment was a piece of cake once the checklist was automated.',
  'Software operations',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid
    AND e.deleted_at IS NULL
    AND e.example_text = 'The first deployment was a piece of cake once the checklist was automated.'
);

-- -----------------------------------------------------------------------------
-- a7204fa2-7ad8-4ef2-a588-040109f11f56 — Once in a blue moon
-- -----------------------------------------------------------------------------
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'An event that happens once in a blue moon happens very rarely—so seldom that it is almost unexpected when it does occur. The phrase is used for habits, visits, or events in ordinary speech; it refers to frequency, not to technical astronomy, unless the speaker specifies otherwise.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid
  AND deleted_at IS NULL;

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT
  'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid,
  'We only get a hard freeze here once in a blue moon.',
  'Climate / casual',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid
    AND e.deleted_at IS NULL
    AND e.example_text = 'We only get a hard freeze here once in a blue moon.'
);
