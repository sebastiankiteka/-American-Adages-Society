-- =============================================================================
-- Phase 5 (preview) — Cluster upgrade: prudence, foresight, and risk limits
-- =============================================================================
-- Theme: managing uncertainty before commitment — when to hold back, spread risk,
-- or correct misjudgment. Five PARTIAL targets only (ids below). Does NOT include
-- the FULL canonical “Don’t count your chickens…” (0d588e53…) or the duplicate
-- row (10421d5d…) — run dedupe-chickens-before-hatch.sql first to soft-delete the duplicate.
--
-- Reference template: /archive/0d588e53-a308-420c-9088-2319635562e0
-- Full bar (audit): etymology + historical_context + interpretation + modern_practicality
--   + first_known_usage + def>=100 + orig>=50 + tags>=2
--   + (variants + translations + usage_ex + timeline) >= 3
--
-- Patterns:
--   - definition / origin: CASE when below threshold; else keep existing
--   - other prose: COALESCE (fill NULL only; preserve strong text)
--   - tags: DISTINCT merge
--   - timeline / usage / related: NOT EXISTS guards
--
-- DO NOT EXECUTE until reviewed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Cluster members (5) — PARTIAL only
-- -----------------------------------------------------------------------------
-- 8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3  Better to be safe than sorry
-- cdf0c19f-aa88-4f97-aee8-e5bf2325ff58  Don't bite off more than you can chew
-- 3b770021-1929-437e-a104-b81c8dd7c559  Don't put all your eggs in one basket
-- 021ea3fc-8d29-4883-b3db-71b09a438b95  Barking up the wrong tree
-- b3d754eb-9070-4800-ad4f-a118a6fe81bf  Don't throw stones at glass houses
-- -----------------------------------------------------------------------------

-- =============================================================================
-- A) Prose + tags (per id)
-- =============================================================================

-- 8047a8c4 — Better to be safe than sorry
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Better safe than sorry” recommends precautions, backups, and conservative choices when the cost of a bad outcome outweighs the cost of extra care. People use it to justify seat belts, redundancy, and double-checking—not to forbid all risk, but to prefer regret-minimizing defaults when stakes are high.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverb; parallel cautions appear in many cultures. Exact first English wording and date are uncertain; the sentiment is stable in modern advice literature.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Proverbial in British and American English from the 19th century onward in domestic, workplace, and safety discourse; precise first attestation varies by collection.'
  ),
  etymology = COALESCE(
    etymology,
    'The contrast is emotional forecasting: “sorry” names later regret; “safe” names present inconvenience accepted to avoid it.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Used where hazards are asymmetric—small preventive cost versus large rare harm—and where social norms favor visible prudence.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim encodes loss aversion under uncertainty: when downside is heavy or irreversible, extra caution is rational even if it slows progress.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Applies to backups, phased rollouts, travel insurance, and compliance—anywhere cheap safeguards reduce tail risk.'
  ),
  updated_at = now()
WHERE id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'caution', 'risk', 'safety']
    )
  )
)
WHERE id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid
  AND deleted_at IS NULL;

-- cdf0c19f — Don't bite off more than you can chew
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Don’t bite off more than you can chew” tells someone not to take on commitments, workloads, or boastful claims beyond what they can actually finish or defend. The idiom is informal American English; speakers use it about jobs, debt, volunteering, and public promises where overreach creates failure or bad faith.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'American English idiom; the eating metaphor is 19th–20th-century colloquial usage. No single coinage date is established.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Common in 20th-century American speech and print; extended from literal eating imagery to workload and obligation.'
  ),
  etymology = COALESCE(
    etymology,
    'Chewing maps to manageable units; an oversized bite chokes progress. The image is physical and immediate.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Flourished alongside industrial and office cultures that prize throughput; also used in personal finance and civic life.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The warning targets optimistic scope: capacity is finite, and reputational harm follows visible failure to deliver.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful in sprint planning, WIP limits, and saying no to marginal projects when calendars are already full.'
  ),
  updated_at = now()
WHERE id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'commitment', 'capacity', 'American English']
    )
  )
)
WHERE id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid
  AND deleted_at IS NULL;

-- 3b770021 — Don't put all your eggs in one basket (may already have Phase 3 prose)
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Don’t put all your eggs in one basket” advises spreading exposure across alternatives so a single failure does not wipe out everything at stake. People apply it to investing, suppliers, skills, and reputation—where concentration raises tail risk even when each bet looks sound in isolation.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Proverbial across European languages; similar images appear in Cervantes. English forms spread in the 18th–19th centuries without a single authoritative author.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Circulated in English advice and proverb collections from the 1700s onward; later tied informally to diversification language in finance.'
  ),
  etymology = COALESCE(
    etymology,
    'Eggs in one basket concentrate breakage risk: one shock ruins the whole load; the basket is any single channel for hope, capital, or dependency.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Predates modern portfolio theory but matches its intuition: uncorrelated baskets reduce correlated ruin.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim targets idiosyncratic risk from concentration; it does not guarantee returns—only that one basket cannot destroy everything at once.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Used for multi-vendor strategy, cross-training, geographic redundancy, and splitting operational dependencies.'
  ),
  updated_at = now()
WHERE id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'risk', 'diversification', 'planning']
    )
  )
)
WHERE id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
  AND deleted_at IS NULL;

-- 021ea3fc — Barking up the wrong tree
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'To be “barking up the wrong tree” is to pursue a mistaken explanation, suspect, or line of inquiry—like a hunting dog at the wrong tree. The idiom is informal American English; speakers use it when blame, investigation, or effort is misdirected away from the real cause or culprit.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'American English; 19th-century hunting and frontier imagery. Exact first citation is uncertain; meaning stabilized in the 20th century.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Attested in American colloquial use from the late 19th century; spread through print and broadcast speech.'
  ),
  etymology = COALESCE(
    etymology,
    'Tree and bark map the spatial error: noise and energy go to the wrong landmark; prey or truth is elsewhere.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Common in detective stories, politics, and workplace blame games where the obvious suspect is not the real actor.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The phrase diagnoses misallocation of attention: effort can be sincere and still useless if the model of the problem is wrong.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful after bad incident response, flawed A/B test readouts, or debugging when symptoms point away from root cause.'
  ),
  updated_at = now()
WHERE id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'idiom', 'error', 'American English']
    )
  )
)
WHERE id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid
  AND deleted_at IS NULL;

-- b3d754eb — Don't throw stones at glass houses
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“People who live in glass houses shouldn’t throw stones” cautions against harsh criticism of others when you are similarly vulnerable—a hypocrisy check before attack. Shorter forms (“don’t throw stones…”) keep the same logic: examine your own exposure before condemning someone else’s choices.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverb; related glass-house imagery appears in European sources. Widespread wording crystallized in modern English; precise first date is uncertain.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Common in British and American moral instruction from the 18th century onward; later a staple of editorial and domestic argument.'
  ),
  etymology = COALESCE(
    etymology,
    'Glass houses are transparent vulnerability: stones are accusations or force; breaking glass maps to reciprocal harm.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Invoked in political, religious, and family disputes where reputational fragility is symmetric.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim is about standing to criticize: shared frailty weakens moral high ground unless acknowledged.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Applies to public commentary, HR disputes, and online pile-ons where accusers face similar scrutiny.'
  ),
  updated_at = now()
WHERE id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'ethics', 'criticism', 'reciprocity']
    )
  )
)
WHERE id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid
  AND deleted_at IS NULL;

-- =============================================================================
-- B) Timeline (2 broad periods each; idempotent)
-- =============================================================================

-- 8047a8c4
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, '1850-01-01', '1949-12-31', 'common',
  'Proverbial in Victorian and early American advice literature; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1850-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, '1950-01-01', NULL, 'very_common',
  'Standard in safety culture, parenting, and informal risk talk in the late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01' AND t.time_period_end IS NULL
);

-- cdf0c19f
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, '1900-01-01', '1969-12-31', 'common',
  'American colloquial idiom in print and speech; exact first attestation varies.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, '1970-01-01', NULL, 'very_common',
  'Workplace and self-help discourse; extended to software scope and personal finance.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1970-01-01'
);

-- 3b770021
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, '1750-01-01', '1949-12-31', 'common',
  'Proverbial in English and American advice; predates formal portfolio theory.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1750-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, '1950-01-01', NULL, 'very_common',
  'Finance, operations, and career advice in the late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- 021ea3fc
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, '1880-01-01', '1949-12-31', 'uncommon',
  'American colloquialism; hunting imagery; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1880-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, '1950-01-01', NULL, 'very_common',
  'Investigation, debugging, and blame narratives in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- b3d754eb
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid, '1750-01-01', '1899-12-31', 'common',
  'Moral proverb in English didactic literature; glass-house imagery circulated in several European languages.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1750-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid, '1900-01-01', NULL, 'very_common',
  'Editorial pages, politics, and family argument in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- =============================================================================
-- C) Official usage examples (skip if official already exists)
-- =============================================================================

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid,
  'We added a redundant server—better safe than sorry before the holiday traffic spike.',
  'Engineering',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid,
  'She declined three committees this year—she would not bite off more than she could chew.',
  'Workplace',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '3b770021-1929-437e-a104-b81c8dd7c559'::uuid,
  'He split retirement savings across index funds and bonds—he was not putting all his eggs in one basket.',
  'Investing',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid,
  'The auditor was barking up the wrong tree; the leak was in billing, not engineering.',
  'Investigation',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid,
  'Before mocking their delay, remember our own missed deadlines—people in glass houses shouldn''t throw stones.',
  'Workplace ethics',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

-- =============================================================================
-- D) Internal related_adages (each id: ≥2 edges to others in cluster; NOT EXISTS)
--    Five PARTIAL ids only — no link to FULL canonical chickens row here.
-- =============================================================================

-- 8047 → barking, eggs, bite (opposing)
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, 'similar',
  'Pausing before blame and pausing before risk both reduce rash damage—different failure modes.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid
    AND r.related_adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, 'similar',
  'Both reduce downside through foresight: precautions versus spreading exposure.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid
    AND r.related_adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, 'opposing',
  '“Safe” stresses downside avoidance; “bite off” stresses capacity limits—both curb harm, from caution versus scope.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid
    AND r.related_adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid AND r.relationship_type = 'opposing'
);

-- cdf0 → safe (opposing), barking, eggs
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, 'opposing',
  'See paired note on “Better safe than sorry.”', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid
    AND r.related_adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, 'similar',
  'Overcommitment and misdirected blame both waste capacity on the wrong problem.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid
    AND r.related_adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, 'similar',
  'Taking on too much and staking too narrowly are both failure modes in planning.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid
    AND r.related_adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND r.relationship_type = 'similar'
);

-- eggs → safe, bite, glass (no duplicate chickens row)
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, 'similar',
  'Diversification and precaution both reduce catastrophic single points of failure.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
    AND r.related_adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, 'similar',
  'Scope limits and portfolio shape are often decided together under stress.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
    AND r.related_adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid, 'similar',
  'Both highlight vulnerability: concentrated bets and transparent exposure to critique.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
    AND r.related_adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid AND r.relationship_type = 'similar'
);

-- barking → bite, eggs, safe
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid, 'similar',
  'Wrong target and oversized scope both misallocate effort.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid
    AND r.related_adage_id = 'cdf0c19f-aa88-4f97-aee8-e5bf2325ff58'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, 'similar',
  'Misdirected focus can leave real concentration risk unexamined.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid
    AND r.related_adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, 'similar',
  'Hasty blame and hasty action are different errors; both benefit from slowing down.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid
    AND r.related_adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid AND r.relationship_type = 'similar'
);

-- glass → safe, barking, eggs
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid, '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid, 'similar',
  'Both counsel restraint when vulnerability is symmetric or poorly understood.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid
    AND r.related_adage_id = '8047a8c4-c7e6-4b0e-a78c-a2affb53ccf3'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid, '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid, 'similar',
  'Misplaced blame and hypocritical attack both break cooperative diagnosis.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid
    AND r.related_adage_id = '021ea3fc-8d29-4883-b3db-71b09a438b95'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid, '3b770021-1929-437e-a104-b81c8dd7c559'::uuid, 'similar',
  'Concentrated exposure before criticizing others’ risk-taking.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b3d754eb-9070-4800-ad4f-a118a6fe81bf'::uuid
    AND r.related_adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND r.relationship_type = 'similar'
);
