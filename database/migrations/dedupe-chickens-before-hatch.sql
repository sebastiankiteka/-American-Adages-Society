-- =============================================================================
-- Deduplicate canonical adage: "Don't count your chickens before they hatch"
-- =============================================================================
-- KEPT (canonical — FULL template row; do not modify elsewhere):
--   0d588e53-a308-420c-9088-2319635562e0
--
-- REMOVED (soft-delete — PARTIAL duplicate; same surface wording):
--   10421d5d-f824-4b33-9191-a209fc6a7b13
--
-- Repoints views, votes, comments, collections, citations, child tables, and
-- related_adages so nothing points at the duplicate. Merges views_count.
-- Drops redundant variant rows when the keeper already has the same variant_text.
-- Optional: fills NULL columns on the keeper from the duplicate (no overwrite).
--
-- Safe + rerunnable: soft-delete is no-op if duplicate already deleted.
-- DO NOT EXECUTE until reviewed.
-- =============================================================================

BEGIN;

-- 0a) Merge any NULL prose on keeper from duplicate (does not overwrite FULL text)
UPDATE adages keeper
SET
  definition = COALESCE(keeper.definition, dup.definition),
  origin = COALESCE(keeper.origin, dup.origin),
  first_known_usage = COALESCE(keeper.first_known_usage, dup.first_known_usage),
  etymology = COALESCE(keeper.etymology, dup.etymology),
  historical_context = COALESCE(keeper.historical_context, dup.historical_context),
  interpretation = COALESCE(keeper.interpretation, dup.interpretation),
  modern_practicality = COALESCE(keeper.modern_practicality, dup.modern_practicality),
  tags = (
    SELECT ARRAY(
      SELECT DISTINCT unnest(COALESCE(keeper.tags, ARRAY[]::text[]) || COALESCE(dup.tags, ARRAY[]::text[]))
    )
  ),
  updated_at = now()
FROM adages dup
WHERE keeper.id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND dup.id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND dup.deleted_at IS NULL
  AND keeper.deleted_at IS NULL;

-- 0b) Granular view log → keeper
UPDATE views
SET target_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE target_type = 'adage'
  AND target_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0c) Votes: drop duplicate rows that would collide with existing keeper vote
DELETE FROM votes v
USING votes v2
WHERE v.target_type = 'adage'
  AND v.target_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND v2.target_type = 'adage'
  AND v2.target_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND v.user_id = v2.user_id;

UPDATE votes
SET target_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid,
  updated_at = now()
WHERE target_type = 'adage'
  AND target_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0d) Comments on adage
UPDATE comments
SET target_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid,
  updated_at = now()
WHERE target_type = 'adage'
  AND target_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0e) Reader challenges
UPDATE reader_challenges
SET target_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE target_type = 'adage'
  AND target_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0f) Collection items: remove dup when same collection already has keeper
DELETE FROM collection_items ci
USING collection_items ci2
WHERE ci.adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND ci2.collection_id = ci.collection_id
  AND ci2.adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid;

UPDATE collection_items
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0g) Citations (repoint; drop dup citation if same source_text already on keeper)
DELETE FROM citations c
USING citations k
WHERE c.adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND k.adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND k.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND k.source_text = c.source_text;

UPDATE citations
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0h) Events: replace duplicate id in related_adage_ids arrays
UPDATE events e
SET
  related_adage_ids = (
    SELECT array_agg(elem ORDER BY elem)
    FROM (
      SELECT DISTINCT CASE
        WHEN u = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid THEN '0d588e53-a308-420c-9088-2319635562e0'::uuid
        ELSE u
      END AS elem
      FROM unnest(e.related_adage_ids) AS u
    ) s
  ),
  updated_at = now()
WHERE e.related_adage_ids IS NOT NULL
  AND '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid = ANY (e.related_adage_ids);

-- 0i) Related adages: repoint adage_id from duplicate → keeper
UPDATE related_adages r
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE r.adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND NOT EXISTS (
    SELECT 1
    FROM related_adages x
    WHERE x.adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
      AND x.related_adage_id = r.related_adage_id
      AND x.relationship_type = r.relationship_type
  );

DELETE FROM related_adages
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0j) Related adages: repoint related_adage_id from duplicate → keeper
UPDATE related_adages r
SET related_adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE r.related_adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND NOT EXISTS (
    SELECT 1
    FROM related_adages x
    WHERE x.adage_id = r.adage_id
      AND x.related_adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
      AND x.relationship_type = r.relationship_type
  );

DELETE FROM related_adages
WHERE related_adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0k) Remove self-loop if both columns ended on keeper (should not occur)
DELETE FROM related_adages
WHERE adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND related_adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid;

-- 0l) Child tables: repoint (usage, timeline, translations)
UPDATE adage_usage_examples
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

UPDATE adage_timeline
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

UPDATE adage_translations
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid;

-- 0m) Variants: soft-delete duplicate rows when keeper already has same variant_text
UPDATE adage_variants v
SET deleted_at = now()
WHERE v.adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND v.deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM adage_variants k
    WHERE k.adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
      AND k.deleted_at IS NULL
      AND k.variant_text = v.variant_text
  );

-- Repoint remaining variants to keeper
UPDATE adage_variants
SET adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM adage_variants k
    WHERE k.adage_id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
      AND k.deleted_at IS NULL
      AND k.variant_text = adage_variants.variant_text
  );

UPDATE adage_variants
SET deleted_at = now()
WHERE adage_id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND deleted_at IS NULL;

-- 0n) Merge view counts
UPDATE adages keeper
SET
  views_count = keeper.views_count + COALESCE(dup.views_count, 0),
  updated_at = now()
FROM adages dup
WHERE keeper.id = '0d588e53-a308-420c-9088-2319635562e0'::uuid
  AND dup.id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND dup.deleted_at IS NULL;

-- 0o) Soft-delete duplicate canonical row
UPDATE adages
SET
  deleted_at = now(),
  updated_at = now()
WHERE id = '10421d5d-f824-4b33-9191-a209fc6a7b13'::uuid
  AND deleted_at IS NULL;

COMMIT;
