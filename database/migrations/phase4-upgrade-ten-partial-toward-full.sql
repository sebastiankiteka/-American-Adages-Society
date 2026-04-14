-- =============================================================================
-- Phase 4 (preview) — Enrich 10 PARTIAL adages toward FULL template
-- =============================================================================
-- Reference detail page: /archive/0d588e53-a308-420c-9088-2319635562e0
-- FULL bar (audit): etymology + historical_context + interpretation + modern_practicality
--   + first_known_usage + def>=100 + orig>=50 + tags>=2 + (variants+translations+usage+timeline)>=3
--
-- This script adds TIMELINE + RELATED ADAGES (and optional second related edge) only.
-- It does NOT bulk-rewrite prose columns; run after Phase 3 content exists, or extend
-- with separate UPDATEs if those fields are still NULL for a given id.
--
-- DO NOT EXECUTE until reviewed. Safe pattern: idempotent inserts via NOT EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Selected 10 (high recognition, conceptual richness, good for relationship edges)
-- -----------------------------------------------------------------------------
-- 1  5657e461-22cd-43f6-ba48-48df9d5f508a  A stitch in time saves nine
-- 2  f5494365-1d8d-4345-a1f7-eedff200bf32  Look before you leap
-- 3  374f564a-19ff-4f9e-aac9-a821c0fc9078  Fortune favors the bold
-- 4  9d8e41e5-0508-422c-ae84-8922003fa8fd  Time is money
-- 5  16199dce-c70f-4665-bccb-5598bc5244a2  You reap what you sow
-- 6  f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a  Measure twice, cut once
-- 7  d4a99df8-66a9-4d4a-9d2c-74967f19f42a  Nothing ventured, nothing gained
-- 8  606df382-af67-4917-80e9-d23a675c6f17  Speak softly and carry a big stick
-- 9  1dd26dc6-5afb-4372-81ac-e625de26eac6  The pen is mightier than the sword
-- 10 2a4eb022-8ad7-4ad7-bb5c-c049ce94501c  An ounce of prevention is worth a pound of cure
--
-- External id used only for related_adages (also PARTIAL in audit):
--    081da24c-5f1b-4e0e-91e8-7752d5d1c7b7  Penny wise and pound foolish
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Enrichment summary (what this file adds)
-- -----------------------------------------------------------------------------
-- Per adage: 2 adage_timeline rows (broad periods, approximate; notes disclaim precision)
-- Related pairs: conceptual links among the 10 + one link to Penny wise for Time is money
-- No translations or citations here (add only with verifiable sources in a follow-up).
-- -----------------------------------------------------------------------------

-- Example shape (for documentation):
-- Timeline row A: early modern–19th c. print circulation (popularity_level + notes)
-- Timeline row B: 20th–21st c. general English (very_common / ubiquitous + notes)
-- Related: (adage_id, related_adage_id, relationship_type, short academic note)

-- =============================================================================
-- 1) TIMELINE (gen_random_uuid(); skip if duplicate period note per adage — use NOT EXISTS)
-- =============================================================================

-- Helper: insert one timeline row if no row exists with same adage_id + overlapping note fingerprint
-- We use NOT EXISTS on notes text match for idempotency (adjust if you prefer unique constraint).

-- 5657e461 — A stitch in time saves nine
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid, '1750-01-01', '1899-12-31', 'common',
  'Proverbial in British and American English by the long 19th century; exact first attestation varies by collection.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1750-01-01' AND t.time_period_end = '1899-12-31'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid, '1900-01-01', NULL, 'very_common',
  'Standard advice idiom in maintenance, engineering, and everyday speech in the 20th–21st centuries.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.time_period_end IS NULL
);

-- f5494365 — Look before you leap
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid, '1600-01-01', '1850-12-31', 'common',
  'Moral-proverb tradition in English; phrasing stable in early modern collections (dates approximate).',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid, '1900-01-01', NULL, 'ubiquitous',
  'Ubiquitous in modern English for contracts, safety, and personal decisions.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND COALESCE(t.notes,'') LIKE '%Ubiquitous in modern English%'
);

-- 374f564a — Fortune favors the bold
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid, '1600-01-01', '1899-12-31', 'uncommon',
  'Latin antecedents (e.g. Virgil) refracted through English motto and essay tradition; not a single “first date.”',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01' AND t.time_period_end = '1899-12-31'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid, '1900-01-01', NULL, 'very_common',
  'Frequent in business, sport, and politics from the 20th century onward.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.notes LIKE '%business, sport%'
);

-- 9d8e41e5 — Time is money
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid, '1750-01-01', '1899-12-31', 'common',
  'Associated with Franklin-era aphorism culture; similar sentiments predate the exact pairing.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1750-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid, '1900-01-01', NULL, 'ubiquitous',
  'Standard in productivity and management discourse in the 20th–21st centuries.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.notes LIKE '%productivity%'
);

-- 16199dce — You reap what you sow
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid, '1600-01-01', '1899-12-31', 'common',
  'Homiletic and agricultural register in English; biblical echo widely known (interpretive traditions vary).',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid, '1900-01-01', NULL, 'very_common',
  'Secular use in ethics, management, and everyday accountability talk.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.notes LIKE '%Secular use%'
);

-- f3ba7b90 — Measure twice, cut once
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid, '1800-01-01', '1949-12-31', 'common',
  'Trade and workshop culture in English-speaking regions; dates approximate.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1800-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid, '1950-01-01', NULL, 'very_common',
  'Generalized to software, surgery planning, and irreversible decisions.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- d4a99df8 — Nothing ventured, nothing gained
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid, '1600-01-01', '1899-12-31', 'common',
  'English moral and commercial proverb; parallel forms in other languages.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid, '1900-01-01', NULL, 'very_common',
  'Venture and career discourse in modern English.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.notes LIKE '%Venture and career%'
);

-- 606df382 — Speak softly and carry a big stick
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '606df382-af67-4917-80e9-d23a675c6f17'::uuid, '1900-01-01', '1945-12-31', 'common',
  'Associated with early-20th-century U.S. political speech; prior diplomatic metaphors exist.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '606df382-af67-4917-80e9-d23a675c6f17'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.time_period_end = '1945-12-31'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '606df382-af67-4917-80e9-d23a675c6f17'::uuid, '1950-01-01', NULL, 'very_common',
  'Cited in IR, negotiation, and leadership literature; meanings contested by context.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '606df382-af67-4917-80e9-d23a675c6f17'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- 1dd26dc6 — The pen is mightier than the sword
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid, '1830-01-01', '1899-12-31', 'common',
  'After Bulwer-Lytton (1839) formulation; similar ideas appear earlier in other authors.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1830-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid, '1900-01-01', NULL, 'ubiquitous',
  'Journalism, law, and civic discourse in modern English.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.notes LIKE '%Journalism%'
);

-- 2a4eb022 — An ounce of prevention is worth a pound of cure
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid, '1730-01-01', '1899-12-31', 'common',
  'Often linked to Franklin’s almanac tradition; medical and civic prevention metaphor.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1730-01-01'
);

INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid, '1900-01-01', NULL, 'very_common',
  'Public health, safety, and risk management contexts in the 20th–21st centuries.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.notes LIKE '%Public health%'
);

-- =============================================================================
-- 2) RELATED ADAGES (idempotent: NOT EXISTS on pair + type)
-- =============================================================================

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid, '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid, 'commonly_paired',
  'Both counsel early action to avoid larger downstream cost.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid
    AND r.related_adage_id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid AND r.relationship_type = 'commonly_paired'
);

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid, 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid, 'commonly_paired',
  'Both emphasize verification before an irreversible or costly step.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid
    AND r.related_adage_id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid AND r.relationship_type = 'commonly_paired'
);

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid, 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid, 'similar',
  'Both address risk-taking and the opportunity cost of inaction.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid
    AND r.related_adage_id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid AND r.relationship_type = 'similar'
);

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid, 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid, 'opposing',
  'Tension: bold commitment versus careful reconnaissance before acting.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid
    AND r.related_adage_id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid AND r.relationship_type = 'opposing'
);

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid, '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid, 'similar',
  'Both concern economic rationality: attention to cost, waste, and trade-offs.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid
    AND r.related_adage_id = '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid AND r.relationship_type = 'similar'
);

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid, '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid, 'similar',
  'Both link present action to later outcomes, on different time scales.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid
    AND r.related_adage_id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid AND r.relationship_type = 'similar'
);

INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '606df382-af67-4917-80e9-d23a675c6f17'::uuid, '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid, 'similar',
  'Both concern persuasion and coercion: words, posture, and capacity for force.',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '606df382-af67-4917-80e9-d23a675c6f17'::uuid
    AND r.related_adage_id = '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid AND r.relationship_type = 'similar'
);

-- Reverse pair for stitch ↔ ounce (optional symmetry for browsing from either page)
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid, '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid, 'commonly_paired',
  'See paired note on “A stitch in time saves nine.”',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid
    AND r.related_adage_id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid AND r.relationship_type = 'commonly_paired'
);
