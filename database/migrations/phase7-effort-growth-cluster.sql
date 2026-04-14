-- =============================================================================
-- Phase 7+ (preview) — Effort, growth, discipline, long-term development
-- =============================================================================
-- Seven PARTIAL targets only. Reference: /archive/0d588e53-a308-420c-9088-2319635562e0
-- Full bar: etymology + historical_context + interpretation + modern_practicality
--   + first_known_usage + def>=100 + orig>=50 + tags>=2
--   + (variants + translations + usage_ex + timeline) >= 3
--
-- Patterns: CASE short def/origin; COALESCE NULL prose; tag merge; NOT EXISTS inserts.
-- DO NOT EXECUTE until reviewed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ae6b122f-2c2a-4b51-8dde-061a198fe59f  A journey of a thousand miles begins with a single step
-- 52154004-5736-4c28-bdd3-90a09626849e  Rome wasn't built in a day
-- 7281622d-431c-43e2-8801-a5604884f651  Fall seven times, stand up eight
-- d5a5ef2c-205f-4c53-9278-a637d0fbf336  A smooth sea never made a skilled sailor
-- b1bf4b6b-caa1-4197-919e-93e7f3e78e83  All things are difficult before they are easy
-- c6faff8f-6639-4923-a9ef-748cf80381c1  The best time to plant a tree was 20 years ago. The second best time is now
-- 0242255b-ed22-4b0f-babe-17af4626a481  He who has a why to live can bear almost any how
-- -----------------------------------------------------------------------------

-- =============================================================================
-- A) Prose + tags
-- =============================================================================

-- ae6b122f — A journey of a thousand miles begins with a single step
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This saying holds that enormous undertakings start with a small, concrete act—movement matters more than waiting for perfect conditions. English speakers often attribute the image to Chinese philosophical literature (the Dao De Jing tradition); wording varies in translation. It is used to encourage starting habits, projects, and reforms when the total path feels overwhelming.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Commonly attributed to Laozi and to the Dao De Jing tradition in English-language discussion; authorship of the received text is debated in scholarship. Modern English formulations are translations and paraphrases—no single contemporary English sentence should be treated as the exact original wording.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'No stable “first” English wording is established; the image spread through translations of Chinese classics and through popular philosophy and self-help in the 20th century, with phrasing varying by translator and context.'
  ),
  etymology = COALESCE(
    etymology,
    '“Thousand miles” exaggerates distance to stress cumulative scale; “single step” names the smallest unit of agency that breaks inertia.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Circulated in self-help, education, and organizational change where inertia and fear of scale block initiation.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim is about irreversibility of starting: the first step changes state from intention to process; later steps redistribute effort but cannot substitute for beginning.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful for OKRs, savings, fitness, and climate policy—domains where marginal first actions unlock feedback loops.'
  ),
  updated_at = now()
WHERE id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'discipline', 'beginnings', 'persistence']
    )
  )
)
WHERE id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND deleted_at IS NULL;

-- 52154004 — Rome wasn't built in a day
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Rome wasn’t built in a day” reminds listeners that durable institutions, skills, and relationships require sustained effort across many days—impatience misreads compounding. It is English proverbial speech; speakers use it to temper expectations for quick fixes in learning, construction, and reform.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverb using Rome as emblem of monumental civilization; exact first attestation is uncertain; medieval and early modern European parallels exist.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Recorded in English proverb collections from the early modern period onward; later common in journalism and everyday advice.'
  ),
  etymology = COALESCE(
    etymology,
    'Rome stands metonymically for any large achievement; “day” compresses time to stress that visible outcomes lag invisible work.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Invoked when reformers, students, or founders face pressure for immediate proof of success.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The saying does not oppose urgency of action; it opposes unrealistic timelines for mature capability.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Helps set roadmaps, apprenticeship curves, and infrastructure investment where shortcuts create debt.'
  ),
  updated_at = now()
WHERE id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'patience', 'time', 'expectations']
    )
  )
)
WHERE id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND deleted_at IS NULL;

-- 7281622d — Fall seven times, stand up eight
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This proverb asserts that resilience—rising after repeated failure—matters more than avoiding falls. It is widely known in English as a Japanese saying (often linked to Daruma- or martial-arts culture in popular retelling); exact historical origin is debated. Speakers use it for recovery from injury, bankruptcy, exams, and public setbacks.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Widely encountered in English as a Japanese proverb or attributed saying; the seven/eight pattern is rhetorical, not a literal tally. A single definitive Japanese source or author is not reliably fixed in general reference—avoid citing a precise origin without specialist sources.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Common in contemporary English from martial arts, business, and motivational contexts from the late 20th century onward; earlier attestations in Japanese sources are a matter for specialist reference, not a single agreed popular citation.'
  ),
  etymology = COALESCE(
    etymology,
    'Falls map to setbacks; standing maps to renewed agency; the extra stand counts persistence beyond symmetry.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Adopted in sports psychology, rehabilitation, and entrepreneurship narratives emphasizing iteration.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim shifts focus from error rate to recovery rate: systems that tolerate failure and learn can outperform brittle perfection.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Pairs with blameless postmortems, spaced repetition, and antifragile team norms.'
  ),
  updated_at = now()
WHERE id = '7281622d-431c-43e2-8801-a5604884f651'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'resilience', 'failure', 'Japanese']
    )
  )
)
WHERE id = '7281622d-431c-43e2-8801-a5604884f651'::uuid AND deleted_at IS NULL;

-- d5a5ef2c — A smooth sea never made a skilled sailor
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This proverb claims that comfort and calm do not teach the judgment and technique acquired in difficulty—rough conditions, though hazardous, forge competence. It is English nautical folk wisdom; speakers generalize it to careers, leadership, and craft where stress reveals gaps training alone cannot.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English-language proverb; nautical setting; often attributed to Roosevelt-era or earlier English sources in popular quotation sites—treat specific attributions cautiously unless documented.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Common in 20th-century British and American speech and leadership anthologies; earlier parallel sentiments exist in seamanship culture.'
  ),
  etymology = COALESCE(
    etymology,
    'Smooth sea = low challenge gradient; skilled sailor = adaptive expertise under load and uncertainty.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Resonates in military training, medicine, and aviation where simulation and real stress both matter.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The claim is not to seek harm for its own sake, but to value calibrated difficulty as a teacher when safety allows.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful when debating sheltered careers versus stretch assignments and on-call incident experience.'
  ),
  updated_at = now()
WHERE id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'adversity', 'skill', 'learning']
    )
  )
)
WHERE id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid AND deleted_at IS NULL;

-- b1bf4b6b — All things are difficult before they are easy
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This saying states that initial difficulty is normal on the path to fluency—skills, languages, and systems feel hard before they become automatic. English versions are often linked to Benjamin Franklin’s Poor Richard tradition and to parallel Asian proverbs; exact priority among sources is debated. It counsels persistence through the awkward early phase.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverbial wording associated with Franklin in popular memory; similar ideas appear in European and East Asian moral literature. No single definitive manuscript line should be asserted without citation.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Circulated in 18th–19th-century American almanacs and schoolroom morals; modern use spans coaching and UX onboarding.'
  ),
  etymology = COALESCE(
    etymology,
    '“Difficult” names high cognitive load; “easy” names automatized competence—transition is practice-dependent, not merit-dependent alone.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Invoked in literacy campaigns, apprenticeship, and any steep learning curve where dropout peaks early.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim normalizes struggle as phase, not identity—reducing shame that often aborts learning.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Supports deliberate practice design, mentorship pacing, and realistic milestone setting.'
  ),
  updated_at = now()
WHERE id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'learning', 'practice', 'patience']
    )
  )
)
WHERE id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid AND deleted_at IS NULL;

-- c6faff8f — The best time to plant a tree was 20 years ago. The second best time is now
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This saying argues that delay has a cost—optimal planting was in the past—but the constructive response is to begin now rather than indulge regret. It is widely quoted in English as a Chinese proverb; the “twenty years” is rhetorical, not a literal agronomy rule. Speakers use it for savings, forests, skills, and climate—any domain where growth rewards early commitment.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Commonly described as Chinese proverbial wisdom in English-language management writing; specific classical source is often unspecified—treat as traditional saying, not a pinpointed quotation.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Popular in late 20th-century environmental and finance advice in Anglophone countries; viral spread through speeches and social media in the 21st century.'
  ),
  etymology = COALESCE(
    etymology,
    'Tree growth maps slow compounding; “second best” reframes regret into forward agency without denying sunk time.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Adopted in reforestation pledges, retirement planning, and education—anywhere compound returns dominate.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The logic is opportunity cost of waiting: expected value of starting now usually dominates further delay when fundamentals are sound.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful for carbon projects, hiring training programs, and technical debt paydown—start suboptimal work today beats perfect planning tomorrow.'
  ),
  updated_at = now()
WHERE id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'regret', 'action', 'compounding']
    )
  )
)
WHERE id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid AND deleted_at IS NULL;

-- 0242255b — He who has a why to live can bear almost any how
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This line claims that a strong sense of purpose or meaning (“why”) increases tolerance for hardship and uncertainty (“how”)—endurance follows significance. English speakers usually associate it with Friedrich Nietzsche via later psychotherapeutic popularization (e.g. Frankl’s circle); exact German wording and translation vary. It is not a license to endure abuse without boundaries.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Widely associated in English with Friedrich Nietzsche; the underlying German and English renderings vary by translator and edition, so no one English sentence should be treated as uniquely authoritative. Viktor Frankl and others later popularized related ideas in psychology—he is fairly described as an interpreter and popularizer, not as the originator of the line.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'English paraphrases circulated through philosophy summaries and general-audience quotation; later through motivational and clinical psychology contexts. For scholarly claims, compare a specific Nietzsche translation or the German original; do not assume one English wording matches every edition.'
  ),
  etymology = COALESCE(
    etymology,
    '“Why” names telos or narrative coherence; “how” names means, suffering, and tactics—purpose trades off against perceived unbearability.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Cited in resilience training, addiction recovery, and mission-driven organizations where identity sustains effort.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim explains variance in endurance among similar objective hardship: meaning modulates perceived load; it does not remove need for material support or ethics.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Helps align roles with values, clarify north-star metrics, and design care plans that include purpose alongside safety.'
  ),
  updated_at = now()
WHERE id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'meaning', 'resilience', 'philosophy']
    )
  )
)
WHERE id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid AND deleted_at IS NULL;

-- =============================================================================
-- B) Timeline (2 broad periods each)
-- =============================================================================

-- ae6b122f
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, '1900-01-01', '1969-12-31', 'uncommon',
  'Daoist ideas in translation; niche in Western philosophy before mass self-help.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, '1970-01-01', NULL, 'very_common',
  'Global management, wellness, and productivity discourse in late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1970-01-01'
);

-- 52154004
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '52154004-5736-4c28-bdd3-90a09626849e'::uuid, '1600-01-01', '1899-12-31', 'common',
  'European proverb collections; Rome as emblem of scale; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '52154004-5736-4c28-bdd3-90a09626849e'::uuid, '1900-01-01', NULL, 'ubiquitous',
  'Journalism, parenting, and reform talk in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- 7281622d
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '7281622d-431c-43e2-8801-a5604884f651'::uuid, '1970-01-01', '1999-12-31', 'uncommon',
  'Martial-arts and export-Japanese culture in Anglophone countries; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1970-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '7281622d-431c-43e2-8801-a5604884f651'::uuid, '2000-01-01', NULL, 'very_common',
  'Business memoirs, sports psychology, and social media motivation in the 21st century.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '2000-01-01'
);

-- d5a5ef2c
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, '1850-01-01', '1949-12-31', 'uncommon',
  'English nautical and leadership folklore; attribution lines fuzzy.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1850-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, '1950-01-01', NULL, 'very_common',
  'Executive coaching and education in late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- b1bf4b6b
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, '1750-01-01', '1899-12-31', 'common',
  'American almanac and schoolroom morals; Franklin association in popular memory.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1750-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, '1900-01-01', NULL, 'very_common',
  'Coaching, UX, and pedagogy in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- c6faff8f
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, '1980-01-01', '2009-12-31', 'common',
  'Environmental and finance speeches; viral-ready phrasing; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1980-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, '2010-01-01', NULL, 'ubiquitous',
  'Climate, investing, and career advice online in the 21st century.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '2010-01-01'
);

-- 0242255b
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, '1880-01-01', '1949-12-31', 'uncommon',
  'Nietzsche reception in European letters; translation-dependent.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1880-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, '1950-01-01', NULL, 'very_common',
  'Psychology, coaching, and existential counseling in Anglophone modernity.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- =============================================================================
-- C) Official usage examples
-- =============================================================================

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid,
  'She opened a savings account with five dollars—a journey of a thousand miles begins with a single step.',
  'Personal finance',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '52154004-5736-4c28-bdd3-90a09626849e'::uuid,
  'The platform will not ship in a quarter—Rome wasn''t built in a day.',
  'Engineering',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '7281622d-431c-43e2-8801-a5604884f651'::uuid,
  'The startup folded twice; they raised again—fall seven times, stand up eight.',
  'Entrepreneurship',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid,
  'Calm quarters did not teach crisis leadership—a smooth sea never made a skilled sailor.',
  'Leadership',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid,
  'The first week of scales was clumsy—all things are difficult before they are easy.',
  'Music education',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid,
  'We missed the 2010 grant cycle, but we reseeded the lot this spring—the second best time is now.',
  'Conservation',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '0242255b-ed22-4b0f-babe-17af4626a481'::uuid,
  'Night shifts were brutal, but mission kept the team steady—he who has a why to live can bear almost any how.',
  'Healthcare',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

-- =============================================================================
-- D) related_adages — ≥3 outgoing edges per id within cluster (21 inserts)
-- =============================================================================

-- journey → Rome, fall seven, plant tree
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'similar',
  'Both temper panic about distance: begin, then persist through long horizons.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid
    AND r.related_adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, '7281622d-431c-43e2-8801-a5604884f651'::uuid, 'similar',
  'First step and repeated recovery both break paralysis in long efforts.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid
    AND r.related_adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, 'commonly_paired',
  'Starting now operationalizes the first step when regret about the past looms.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid
    AND r.related_adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid AND r.relationship_type = 'commonly_paired'
);

-- Rome → journey, smooth sea, all things difficult
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, 'similar',
  'See paired note on the thousand-mile journey.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid
    AND r.related_adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, 'similar',
  'Maturity of skill and of institutions both resist instant manufacture.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid
    AND r.related_adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, 'similar',
  'Ease arrives after the awkward phase—calendar time and practice time align.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid
    AND r.related_adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid AND r.relationship_type = 'similar'
);

-- fall seven → journey, why/how, smooth sea
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '7281622d-431c-43e2-8801-a5604884f651'::uuid, 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, 'similar',
  'Iteration after failure is a sequence of renewed first steps.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid
    AND r.related_adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '7281622d-431c-43e2-8801-a5604884f651'::uuid, '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, 'similar',
  'Purpose sustains standing up when falls accumulate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid
    AND r.related_adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '7281622d-431c-43e2-8801-a5604884f651'::uuid, 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, 'similar',
  'Rough conditions train the same grit measured by repeated recovery.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid
    AND r.related_adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid AND r.relationship_type = 'similar'
);

-- smooth sea → Rome, fall seven, all things difficult
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'similar',
  'Depth of craft, like depth of city-building, resists shortcuts.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid
    AND r.related_adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, '7281622d-431c-43e2-8801-a5604884f651'::uuid, 'similar',
  'Challenge and setback both supply the stressors that comfort avoids.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid
    AND r.related_adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, 'opposing',
  'Ease of early practice can mimic smooth seas—false confidence before difficulty arrives.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid
    AND r.related_adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid AND r.relationship_type = 'opposing'
);

-- all things difficult → journey, Rome, plant tree
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, 'similar',
  'The awkward first step is the visible start of the “difficult” phase.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid
    AND r.related_adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'similar',
  'Fluency and civic grandeur both emerge after prolonged difficulty.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid
    AND r.related_adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid, 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, 'similar',
  'Starting late still beats never; difficulty now buys ease later.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b1bf4b6b-caa1-4197-919e-93e7f3e78e83'::uuid
    AND r.related_adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid AND r.relationship_type = 'similar'
);

-- plant tree → journey, Rome, why/how
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid, 'commonly_paired',
  '“Second best now” is the operational form of taking the single step.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid
    AND r.related_adage_id = 'ae6b122f-2c2a-4b51-8dde-061a198fe59f'::uuid AND r.relationship_type = 'commonly_paired'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, '52154004-5736-4c28-bdd3-90a09626849e'::uuid, 'opposing',
  'Tension: compounding demands patience (Rome) while regret demands immediate planting—both true at different margins.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid
    AND r.related_adage_id = '52154004-5736-4c28-bdd3-90a09626849e'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, 'similar',
  'Purpose answers regret: the “why” makes starting now bearable.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid
    AND r.related_adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid AND r.relationship_type = 'similar'
);

-- why/how → fall seven, smooth sea, plant tree
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, '7281622d-431c-43e2-8801-a5604884f651'::uuid, 'similar',
  'Meaning budgeted across repeated failure and recovery.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid
    AND r.related_adage_id = '7281622d-431c-43e2-8801-a5604884f651'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid, 'similar',
  '“How” includes storm conditions; purpose increases tolerance for them.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid
    AND r.related_adage_id = 'd5a5ef2c-205f-4c53-9278-a637d0fbf336'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '0242255b-ed22-4b0f-babe-17af4626a481'::uuid, 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid, 'similar',
  'Mission clarifies why today’s planting still beats further delay.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '0242255b-ed22-4b0f-babe-17af4626a481'::uuid
    AND r.related_adage_id = 'c6faff8f-6639-4923-a9ef-748cf80381c1'::uuid AND r.relationship_type = 'similar'
);
