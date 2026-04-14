-- =============================================================================
-- Deduplicate canonical adage: "Don't put all your eggs in one basket"
-- =============================================================================
-- KEPT (canonical — more complete: full etymology / historical / interpretation /
--   modern_practicality, richer origin, tags, Phase 3 content):
--   3b770021-1929-437e-a104-b81c8dd7c559
--
-- REMOVED (soft-delete — thinner seed row; same surface adage text):
--   2ec71bf6-f2d6-4720-8d06-fdfba24780eb
--
-- Both rows had the same variant wording ("Don't put your eggs all in one basket").
-- The duplicate's variant row is soft-deleted because the keeper already has that
-- variant; no text loss.
--
-- Merge: views_count from duplicate added to keeper. No other FK data on
-- duplicate (votes/saves/comments/usage/citations/timeline = 0 in production check).
--
-- Safe + rerunnable: no-op if duplicate is already soft-deleted.
--
-- If related_adages (or other tables) later reference the duplicate id, repoint
-- those rows to the keeper before running, or add matching UPDATEs above COMMIT.
-- =============================================================================

BEGIN;

-- 0) Point granular view log rows at the keeper (no FK; avoids orphaned target_id)
UPDATE views
SET target_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
WHERE target_type = 'adage'
  AND target_id = '2ec71bf6-f2d6-4720-8d06-fdfba24780eb'::uuid;

-- 1) Drop redundant variant on the duplicate row when keeper already has the same variant_text
UPDATE adage_variants v
SET deleted_at = now()
WHERE v.adage_id = '2ec71bf6-f2d6-4720-8d06-fdfba24780eb'::uuid
  AND v.deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM adage_variants k
    WHERE k.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
      AND k.deleted_at IS NULL
      AND k.variant_text = v.variant_text
  );

-- 2) Merge view counts into keeper (duplicate had no other user data to migrate)
UPDATE adages keeper
SET
  views_count = keeper.views_count + COALESCE(dup.views_count, 0),
  updated_at = now()
FROM adages dup
WHERE keeper.id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
  AND dup.id = '2ec71bf6-f2d6-4720-8d06-fdfba24780eb'::uuid
  AND dup.deleted_at IS NULL;

-- 3) Soft-delete duplicate canonical row (archive count / listings exclude deleted_at)
UPDATE adages
SET
  deleted_at = now(),
  updated_at = now()
WHERE id = '2ec71bf6-f2d6-4720-8d06-fdfba24780eb'::uuid
  AND deleted_at IS NULL;

COMMIT;
