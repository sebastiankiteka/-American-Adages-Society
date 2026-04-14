-- =============================================================================
-- Phase 4b — Finish remaining 7 PARTIAL adages (post–Phase 4 audit)
-- =============================================================================
-- Scope: ONLY these ids. Does NOT touch the 3 already promoted to FULL:
--   stitch, speak softly, you reap — leave as-is.
--
-- Part A — Definition only (5): expand definition when length < 100; else unchanged.
-- Part B — Fuller upgrade (2): ounce of prevention + pen mightier — prose columns +
--   optional official usage if none exists (NOT EXISTS), to meet enrichment >= 3
--   with existing Phase 4 timeline rows.
--
-- Reruns: safe — short-definition CASE leaves long text untouched; COALESCE fills
--   NULLs only; usage insert is guarded.
-- DO NOT EXECUTE until reviewed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Part A — Definition-only (5)
-- -----------------------------------------------------------------------------

-- f5494365 — Look before you leap
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'To look before you leap is to gather information and weigh consequences before committing to a course you cannot cheaply undo. People use it as practical advice against impulse—in everyday speech it often softens a warning about contracts, travel, money, or public promises where mistakes are costly.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid
  AND deleted_at IS NULL;

-- 374f564a — Fortune favors the bold
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Fortune favors the bold” claims that luck or opportunity tends to reward those who act decisively and accept reasonable exposure to risk rather than postponing forever. It is used to encourage initiative in careers, entrepreneurship, and negotiation; careful use pairs it with awareness of downside, not recklessness.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid
  AND deleted_at IS NULL;

-- 9d8e41e5 — Time is money
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Time is money” frames hours and attention as scarce resources: delay and waste forgo alternative uses that could earn, learn, or restore. The saying is common in business, billing, and productivity talk; it reminds people to respect punctuality and shared time commitments and to notice opportunity cost without implying every hour has a literal dollar price.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid
  AND deleted_at IS NULL;

-- f3ba7b90 — Measure twice, cut once
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Measure twice, cut once” means verify measurements, assumptions, and plans before an irreversible step—because correcting after the cut wastes material, time, or trust. It comes from trades where wood and fabric are costly to undo, and people extend it to software releases, surgery, policy rollouts, and any decision with expensive rollback.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid
  AND deleted_at IS NULL;

-- d4a99df8 — Nothing ventured, nothing gained
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Nothing ventured, nothing gained” means you should not expect reward without accepting some risk, effort, or vulnerability to failure. Speakers use it to justify measured experiments—in investing, careers, auditions, or relationships—while listeners may still weigh it against proverbs that stress caution and proportion.'
    ELSE definition
  END,
  updated_at = now()
WHERE id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid
  AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- Part B — An ounce of prevention is worth a pound of cure (2a4eb022)
-- -----------------------------------------------------------------------------

UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This proverb compares a small, early investment in prevention (an ounce) with the heavy cost of remedy after harm (a pound of cure). In ordinary use it argues for vaccines, maintenance, safety checks, and design margins before failure—without promising that every cheap fix prevents every expensive disaster.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'The ounce-and-pound pairing is widely quoted in American English and often linked to Benjamin Franklin''s Poor Richard tradition; similar “prevention beats cure” sentiments appear in earlier English and European proverb literature, so a single definitive author is uncertain.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Common in 18th-century American almanac and advice literature; later standard in medicine, engineering, and public administration.'
  ),
  etymology = COALESCE(
    etymology,
    'Imperial units of weight create a vivid ratio: a little weight of foresight versus a large weight of repair. The contrast is rhetorical, not a literal conversion factor.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Circulated as household and civic wisdom, then in occupational health, preventive medicine, and reliability culture where small upstream actions reduce large downstream failures.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The core claim is convexity of harm: delaying cheap prevention can multiply later cost, though not every risk merits equal upfront spending—proportion and evidence still matter.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Used in public health, cybersecurity hygiene, code review, maintenance windows, and insurance—any domain where early, cheap controls trade off against rare but expensive incidents.'
  ),
  updated_at = now()
WHERE id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'prevention', 'risk', 'maintenance']
    )
  )
)
WHERE id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid
  AND deleted_at IS NULL;

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT
  '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid,
  'They funded the outreach clinic before flu season—an ounce of prevention is worth a pound of cure.',
  'Public health',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '2a4eb022-8ad7-4ad7-bb5c-c049ce94501c'::uuid
    AND e.source_type = 'official'
    AND e.deleted_at IS NULL
    AND e.hidden_at IS NULL
);

-- -----------------------------------------------------------------------------
-- Part B — The pen is mightier than the sword (1dd26dc6)
-- -----------------------------------------------------------------------------

UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'The saying holds that writing, argument, law, and public persuasion can outweigh raw force over the long run: narratives, treaties, and reputations outlast many battles. People invoke it to praise journalism, diplomacy, or advocacy, while remembering that coercion and safety still matter when words alone fail.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'The familiar wording is associated with Edward Bulwer-Lytton''s 1839 play Richelieu; comparable ideas—that counsel and letters can defeat arms—appear in earlier European thought, so the line popularized a long-standing theme rather than inventing it.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'The line became proverbial in English after 1839 through quotation, essays, and later political speech; exact stage history varies by edition and performance.'
  ),
  etymology = COALESCE(
    etymology,
    '“Pen” and “sword” are metonyms: instruments of inscription and violence stand for persuasion and coercion. The contrast is not literal—pens do not stop bayonets in a melee—but claims comparative influence over time.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Widely cited in debates over press freedom, civil rights, and anti-colonial writing where pamphlets and law challenged armed authority; also used in education to stress literacy and civic voice.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim elevates symbolic and institutional power (law, narrative, legitimacy) alongside material force; it does not deny danger where speech is suppressed or where arms decide short-run outcomes.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Applies to editorial strategy, whistleblowing, contracts, and online mobilization—anywhere durable agreement or legitimacy matters; pair with security planning where threats are physical.'
  ),
  updated_at = now()
WHERE id = '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'writing', 'persuasion', 'conflict']
    )
  )
)
WHERE id = '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid
  AND deleted_at IS NULL;

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT
  '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid,
  'Investigations and editorials moved public opinion before the vote—another case where the pen is mightier than the sword.',
  'Politics and media',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '1dd26dc6-5afb-4372-81ac-e625de26eac6'::uuid
    AND e.source_type = 'official'
    AND e.deleted_at IS NULL
    AND e.hidden_at IS NULL
);
