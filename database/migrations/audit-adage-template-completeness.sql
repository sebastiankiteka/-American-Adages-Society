-- =============================================================================
-- Phase 1 — Audit: classify canonical adages vs reference “full” template
-- =============================================================================
-- Reference (do not delete or bulk-overwrite without review):
--   id = '0d588e53-a308-420c-9088-2319635562e0'
--   Profile (from live data): definition + origin + first_known_usage + etymology +
--   historical_context + interpretation + modern_practicality; content tags >= 2
--   (tags other than system "archive"; archive does not count toward the bar);
--   variants + translations + usage_examples + timeline (combined count >= 3).
--
-- “Full” = matches that bar (same heuristic as reference row).
-- “Partial” = has definition + origin + first_known_usage at seed level, but not full.
-- “Minimal” = missing first_known_usage or very thin definition/origin.
--
-- Run in Supabase SQL Editor (both statements: summary, then full checklist).
-- Results drive Phase 3 enrichment (partial/minimal only).
-- =============================================================================

-- --- Query A: Summary counts ---
WITH enriched AS (
  SELECT
    a.id,
    a.adage,
    length(coalesce(a.definition, '')) AS def_len,
    length(coalesce(a.origin, '')) AS orig_len,
    (SELECT count(*)::int FROM unnest(coalesce(a.tags, ARRAY[]::text[])) AS t(tag) WHERE tag IS DISTINCT FROM 'archive') AS content_tag_count,
    (a.first_known_usage IS NOT NULL AND trim(a.first_known_usage) <> '') AS has_fku,
    (a.etymology IS NOT NULL AND trim(a.etymology) <> '') AS has_etym,
    (a.historical_context IS NOT NULL AND trim(a.historical_context) <> '') AS has_hist,
    (a.interpretation IS NOT NULL AND trim(a.interpretation) <> '') AS has_interp,
    (a.modern_practicality IS NOT NULL AND trim(a.modern_practicality) <> '') AS has_mod,
    (SELECT count(*)::int FROM adage_variants v WHERE v.adage_id = a.id AND v.deleted_at IS NULL) AS variants,
    (SELECT count(*)::int FROM adage_translations t WHERE t.adage_id = a.id AND t.deleted_at IS NULL) AS translations,
    (SELECT count(*)::int FROM adage_usage_examples u WHERE u.adage_id = a.id AND u.deleted_at IS NULL AND u.hidden_at IS NULL) AS usage_ex,
    (SELECT count(*)::int FROM adage_timeline tl WHERE tl.adage_id = a.id AND tl.deleted_at IS NULL) AS timeline_n
  FROM adages a
  WHERE a.deleted_at IS NULL
    AND a.hidden_at IS NULL
),
classified AS (
  SELECT
    *,
    CASE
      WHEN id = '0d588e53-a308-420c-9088-2319635562e0'::uuid THEN 'full'
      WHEN has_etym AND has_hist AND has_interp AND has_mod AND has_fku
        AND def_len >= 100 AND orig_len >= 50 AND content_tag_count >= 2
        AND (variants + translations + usage_ex + timeline_n) >= 3
      THEN 'full'
      WHEN def_len >= 40 AND orig_len >= 15 AND has_fku THEN 'partial'
      ELSE 'minimal'
    END AS status
  FROM enriched
)
SELECT status, count(*)::int AS n
FROM classified
GROUP BY status
ORDER BY status;

-- --- Query B: Full checklist (every row): id, text, status, gaps vs reference ---
WITH enriched AS (
  SELECT
    a.id,
    a.adage,
    length(coalesce(a.definition, '')) AS def_len,
    length(coalesce(a.origin, '')) AS orig_len,
    (SELECT count(*)::int FROM unnest(coalesce(a.tags, ARRAY[]::text[])) AS t(tag) WHERE tag IS DISTINCT FROM 'archive') AS content_tag_count,
    (a.first_known_usage IS NOT NULL AND trim(a.first_known_usage) <> '') AS has_fku,
    (a.etymology IS NOT NULL AND trim(a.etymology) <> '') AS has_etym,
    (a.historical_context IS NOT NULL AND trim(a.historical_context) <> '') AS has_hist,
    (a.interpretation IS NOT NULL AND trim(a.interpretation) <> '') AS has_interp,
    (a.modern_practicality IS NOT NULL AND trim(a.modern_practicality) <> '') AS has_mod,
    (SELECT count(*)::int FROM adage_variants v WHERE v.adage_id = a.id AND v.deleted_at IS NULL) AS variants,
    (SELECT count(*)::int FROM adage_translations t WHERE t.adage_id = a.id AND t.deleted_at IS NULL) AS translations,
    (SELECT count(*)::int FROM adage_usage_examples u WHERE u.adage_id = a.id AND u.deleted_at IS NULL AND u.hidden_at IS NULL) AS usage_ex,
    (SELECT count(*)::int FROM adage_timeline tl WHERE tl.adage_id = a.id AND tl.deleted_at IS NULL) AS timeline_n
  FROM adages a
  WHERE a.deleted_at IS NULL
    AND a.hidden_at IS NULL
),
classified AS (
  SELECT
    *,
    CASE
      WHEN id = '0d588e53-a308-420c-9088-2319635562e0'::uuid THEN 'full'
      WHEN has_etym AND has_hist AND has_interp AND has_mod AND has_fku
        AND def_len >= 100 AND orig_len >= 50 AND content_tag_count >= 2
        AND (variants + translations + usage_ex + timeline_n) >= 3
      THEN 'full'
      WHEN def_len >= 40 AND orig_len >= 15 AND has_fku THEN 'partial'
      ELSE 'minimal'
    END AS status
  FROM enriched
)
SELECT
  id,
  adage,
  status,
  concat_ws(
    '; ',
    CASE WHEN NOT has_etym THEN 'etymology' END,
    CASE WHEN NOT has_hist THEN 'historical_context' END,
    CASE WHEN NOT has_interp THEN 'interpretation' END,
    CASE WHEN NOT has_mod THEN 'modern_practicality' END,
    CASE WHEN NOT has_fku THEN 'first_known_usage' END,
    CASE WHEN def_len < 100 THEN 'definition (short vs reference)' END,
    CASE WHEN orig_len < 50 THEN 'origin (thin vs reference)' END,
    CASE WHEN content_tag_count < 2 THEN 'tags (<2, excluding system archive)' END,
    CASE WHEN (variants + translations + usage_ex + timeline_n) < 3 THEN 'enrichment (variants+translations+usage+timeline < 3)' END
  ) AS gaps_vs_reference_template
FROM classified
ORDER BY
  CASE status WHEN 'full' THEN 1 WHEN 'partial' THEN 2 ELSE 3 END,
  adage;
