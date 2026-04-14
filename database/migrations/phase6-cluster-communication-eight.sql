-- =============================================================================
-- Phase 6 (preview) — Cluster: communication, evidence, and judgment
-- =============================================================================
-- Eight PARTIAL targets only (current audit). Does not touch FULL rows.
-- Reference template: /archive/0d588e53-a308-420c-9088-2319635562e0
--
-- Full bar: etymology + historical_context + interpretation + modern_practicality
--   + first_known_usage + def>=100 + orig>=50 + tag_count>=2
--   + (variants + translations + usage_ex + timeline) >= 3
--
-- Patterns: CASE on short def/origin; COALESCE for NULL prose; DISTINCT tag merge;
--   timeline + official usage + related_adages for enrichment; NOT EXISTS guards.
-- DO NOT EXECUTE until reviewed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Cluster (8)
-- -----------------------------------------------------------------------------
-- acf9f378-f31b-471d-991d-f3a47f3966d7  Don't shoot the messenger
-- b349cce7-ec3a-4de5-a703-613ee48aa918  Don't judge a book by its cover
-- b0d22b33-eb6e-4450-b052-942b49e7c29f  Actions speak louder than words
-- d97cc19e-7332-415c-a5ee-34d1349a04c3  Speak of the devil
-- fac9e30a-d66a-441a-aec9-46e8bf87b4ed  Who let the cat out of the bag
-- 4d9e7f75-72c6-42df-924a-b5465e0889fb  One spoken word can never be taken back
-- 8f260ae7-1547-4131-b8e1-dade009bd2ca  I caught you red-handed
-- 0844affc-31b8-4947-b17d-d9387becbada  Steal my thunder
-- -----------------------------------------------------------------------------

-- =============================================================================
-- A) Prose + tags
-- =============================================================================

-- acf9f378 — Don't shoot the messenger
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Don’t shoot the messenger” means you should not punish or blame someone who only delivers unwelcome news; fault lies with the facts or the author of the message, not the bearer. It appears in workplace, politics, and family talk when people want to keep channels of honest reporting open.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English idiom with classical echoes (Greek tragedy often cited in spirit). Modern wording is proverbial; exact first English date is uncertain.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Common in British and American English from the early modern period in moral and political discourse; fixed as an idiom by the 19th century in general use.'
  ),
  etymology = COALESCE(
    etymology,
    '“Messenger” is the literal courier; “shoot” maps to retaliation—violence or harsh sanction against the informant rather than the problem.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Used wherever hierarchy tempts people to silence subordinates who report bad news—armies, firms, and governments.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim separates epistemic role from moral responsibility: hearing truth is prerequisite to fixing causes; attacking reporters erodes trust and hides defects.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Applies to incident reviews, whistleblowing policy, and feedback culture—rewarding signal, not shooting the channel.'
  ),
  updated_at = now()
WHERE id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'communication', 'blame', 'ethics']
    )
  )
)
WHERE id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid AND deleted_at IS NULL;

-- b349cce7 — Don't judge a book by its cover
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Don’t judge a book by its cover” warns against inferring inner quality—character, skill, or worth—from outward appearance, packaging, or first impression. People extend it from books to people, products, and arguments; it counsels humility and second looks without denying that signals sometimes matter.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'American English proverb; widespread in 20th-century popular morality. Earlier European parallels exist; the book-and-cover image became standard in modern English.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Proverbial in 20th-century American print and speech; earlier forms warned against judging by looks without the exact metaphor.'
  ),
  etymology = COALESCE(
    etymology,
    'The cover is metonym for surface cues; the book stands for substance that requires opening or time to assess.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Invoked in education, hiring, and consumer culture where branding and bias skew first impressions.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The principle is epistemic modesty: visible traits correlate imperfectly with latent traits; updating beats snap judgment when stakes are high.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful in interviews, UX critique, and cross-cultural contact—anywhere stereotypes compress variance.'
  ),
  updated_at = now()
WHERE id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'perception', 'bias', 'fairness']
    )
  )
)
WHERE id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid AND deleted_at IS NULL;

-- b0d22b33 — Actions speak louder than words
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Actions speak louder than words” claims that what someone does reveals priorities and character more reliably than what they say. People use it to call out hypocrisy, praise consistent behavior, or argue that commitments should be tested by conduct rather than promises alone.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverb; related sentiments appear in many languages. Modern wording stabilized in British and American English by the 18th–19th centuries without a single attributed author.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Recorded in English proverb collections from the 1700s onward; widespread in moral instruction and later in management aphorisms.'
  ),
  etymology = COALESCE(
    etymology,
    '“Louder” maps audibility to salience: deeds outweigh speech in what observers infer about intent and follow-through.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Used in sermons, parenting, and civic rhetoric where rhetoric and performance diverge from practice.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim encodes a theory of credibility: repeated action is costly to fake; words are cheap without aligned behavior.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Applies to OKRs, relationship repair, and public leadership—anywhere talk must be checked against track record.'
  ),
  updated_at = now()
WHERE id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'integrity', 'behavior', 'trust']
    )
  )
)
WHERE id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND deleted_at IS NULL;

-- d97cc19e — Speak of the devil
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Speak of the devil” is said when someone appears just as they were being mentioned—often with humorous surprise. The longer form “speak of the devil and he shall appear” is older in spirit; modern short form is casual English for coincidence of arrival and topic.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English proverb shortening older “speak of the devil and he doth appear”; folk etymologies abound; precise first attestation varies by source.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'The shortened idiom is standard in 20th-century British and American conversation; longer forms appear earlier in proverb literature.'
  ),
  etymology = COALESCE(
    etymology,
    '“Devil” here is playful, not theological: the named person maps to the proverbial devil who arrives when named.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Common in informal speech, sitcom dialogue, and office banter; register is casual.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The phrase marks timing coincidence and social acknowledgment—sometimes affectionate, sometimes awkward—without claiming the supernatural.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Useful as a light conversational bridge when someone walks in mid-gossip; tone should match relationship and power dynamics.'
  ),
  updated_at = now()
WHERE id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'idiom', 'conversation', 'English']
    )
  )
)
WHERE id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND deleted_at IS NULL;

-- fac9e30a — Who let the cat out of the bag
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      '“Who let the cat out of the bag?” asks who revealed a secret that was supposed to stay hidden—often a plan, price, or surprise. The idiom is informal English; tone can be joking or annoyed depending on stakes and trust.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'English idiom; folk etymologies link it to markets and trick sales, but the true origin is uncertain. Modern sense is fixed: premature disclosure.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Attested in British and American English from the 18th century onward in colloquial and literary use.'
  ),
  etymology = COALESCE(
    etymology,
    'Cat and bag create a contained secret; release maps to loss of control over who knows what, when.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Flourishes in gossip, product launches, and politics—any domain with embargoed information.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The question assigns responsibility for information leakage; it often precedes repair talk about process and confidentiality.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Relevant to NDAs, coordinated announcements, and team surprises—pair with clarity on who may speak when.'
  ),
  updated_at = now()
WHERE id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'secrecy', 'disclosure', 'idiom']
    )
  )
)
WHERE id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND deleted_at IS NULL;

-- 4d9e7f75 — One spoken word can never be taken back
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'This saying stresses that speech, once heard, cannot be fully retracted: apologies may follow, but memory and harm can linger. It appears in many cultural traditions; English uses it to warn against insults, threats, and rash promises in anger or haste.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Cross-cultural proverb; English wording varies. No single author or date can be asserted; the moral is stable in homiletic and literary traditions worldwide.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Parallels appear in ancient Mediterranean and Asian wisdom literature; modern English forms circulate in advice and self-help from the 19th century onward.'
  ),
  etymology = COALESCE(
    etymology,
    '“Spoken word” is irreversible in the social sense: utterance crosses a boundary that unsaying cannot erase.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Invoked in oratory, marriage counseling, and diplomacy—anywhere language can bind or burn.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The maxim pairs with norms of repair: not that speech is never forgivable, but that undoing is imperfect—so proportion and pause matter.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Applies to email tone, public statements, and recorded media where replay amplifies harm.'
  ),
  updated_at = now()
WHERE id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'speech', 'reputation', 'repair']
    )
  )
)
WHERE id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid AND deleted_at IS NULL;

-- 8f260ae7 — I caught you red-handed
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'To catch someone “red-handed” is to catch them in the act of wrongdoing—often with physical or documentary evidence so denial is implausible. The phrase is common in British and American English; register is informal to neutral in accusations and humor alike.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Scottish legal and literary usage helped popularize the image of blood-stained hands; modern metaphor extends to theft and cheating without literal gore.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Attested in Scottish English from the 15th century in legal contexts; generalized in British and American idiom by the 19th century.'
  ),
  etymology = COALESCE(
    etymology,
    'Red hands map evidence of violence or theft onto visible guilt; color stands for caught-in-the-act certainty.'
  ),
  historical_context = COALESCE(
    historical_context,
    'Used in criminal narratives, parenting, and workplace investigations where timing and proof matter.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The idiom marks a high-certainty epistemic state: observation collapses excuse space that might remain with hearsay.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Parallels digital forensics and logs—where metadata can “catch” behavior as decisively as a witness.'
  ),
  updated_at = now()
WHERE id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'evidence', 'idiom', 'justice']
    )
  )
)
WHERE id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid AND deleted_at IS NULL;

-- 0844affc — Steal my thunder
UPDATE adages SET
  definition = CASE
    WHEN length(trim(coalesce(definition, ''))) < 100 THEN
      'To “steal someone’s thunder” is to take credit, attention, or the dramatic effect of their idea—often by announcing it first or overshadowing their moment. The idiom is informal English; it combines envy of priority with complaint about lost spotlight.'
    ELSE definition
  END,
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 50 THEN
      'Often linked to an early 18th-century theatrical anecdote involving John Dennis and a borrowed thunder effect; the tale is commonly repeated as traditional lore and is not definitively proven in primary sources—treat it as attribution tradition, not established fact.'
    ELSE origin
  END,
  first_known_usage = COALESCE(
    first_known_usage,
    'Fixed as idiom in British English by the 19th century; American English adopts the same metaphor for priority and credit.'
  ),
  etymology = COALESCE(
    etymology,
    'Thunder is dramatic effect; theft maps appropriation of someone else’s rhetorical or inventive “weather.”'
  ),
  historical_context = COALESCE(
    historical_context,
    'Common in arts, academia, and startups where novelty and timing confer reputation.'
  ),
  interpretation = COALESCE(
    interpretation,
    'The grievance is about attribution and sequence: ideas are partly social goods, but credit norms still allocate esteem.'
  ),
  modern_practicality = COALESCE(
    modern_practicality,
    'Relevant to conference talks, launches, and collaborative repos—clarify roles and acknowledgment to reduce thunder-stealing friction.'
  ),
  updated_at = now()
WHERE id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive', 'credit', 'rhetoric', 'competition']
    )
  )
)
WHERE id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid AND deleted_at IS NULL;

-- =============================================================================
-- B) Timeline (2 periods each)
-- =============================================================================

-- acf9f378
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, '1600-01-01', '1899-12-31', 'common',
  'Messenger imagery in English moral and political discourse; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, '1900-01-01', NULL, 'very_common',
  'Management, journalism, and online moderation in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01' AND t.time_period_end IS NULL
);

-- b349cce7
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, '1920-01-01', '1969-12-31', 'common',
  'American proverb in print and film; exact first boom in mass media is approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1920-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, '1970-01-01', NULL, 'ubiquitous',
  'Anti-bias education and everyday fairness talk in late 20th–21st centuries.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1970-01-01'
);

-- b0d22b33
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, '1700-01-01', '1899-12-31', 'common',
  'English proverb collections and moral instruction; wording stable.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1700-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, '1900-01-01', NULL, 'ubiquitous',
  'Leadership, parenting, and civic discourse in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- d97cc19e
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, '1800-01-01', '1949-12-31', 'common',
  'Longer proverb forms in English; shortened idiom crystallized later; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1800-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, '1950-01-01', NULL, 'very_common',
  'Informal conversation and media dialogue in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- fac9e30a
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, '1750-01-01', '1949-12-31', 'common',
  'British and American colloquial idiom; origin stories debated.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1750-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, '1950-01-01', NULL, 'very_common',
  'Gossip, PR, and internet culture in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1950-01-01'
);

-- 4d9e7f75
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, '1600-01-01', '1899-12-31', 'common',
  'Homiletic and literary parallels across cultures; English wording varies.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1600-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, '1900-01-01', NULL, 'very_common',
  'Self-help, ethics, and digital communication advice in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- 8f260ae7
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, '1500-01-01', '1799-12-31', 'uncommon',
  'Scottish legal and literary usage; dates approximate.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1500-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, '1800-01-01', NULL, 'very_common',
  'Crime fiction, journalism, and everyday accusation in modern English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1800-01-01'
);

-- 0844affc
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '0844affc-31b8-4947-b17d-d9387becbada'::uuid, '1700-01-01', '1899-12-31', 'uncommon',
  'Theatrical anecdote tradition; popular retelling from 18th century onward.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1700-01-01'
);
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '0844affc-31b8-4947-b17d-d9387becbada'::uuid, '1900-01-01', NULL, 'common',
  'Creative fields and office politics in 20th–21st century English.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_timeline t WHERE t.adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid AND t.deleted_at IS NULL
    AND t.time_period_start = '1900-01-01'
);

-- =============================================================================
-- C) Official usage (skip if official row exists)
-- =============================================================================

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid,
  'The outage was not her fault—don''t shoot the messenger when she brings the postmortem.',
  'Workplace',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid,
  'The cover looked dull, but the book was brilliant—don''t judge a book by its cover.',
  'Reading',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid,
  'They promised reform for years; actions speak louder than words.',
  'Politics',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid,
  'We were just talking about you—speak of the devil.',
  'Conversation',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid,
  'The price leaked early—who let the cat out of the bag?',
  'Business',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid,
  'He apologized, but one spoken word can never be taken back—the team remembered the insult.',
  'Relationships',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid,
  'They had him on camera with the files—I caught you red-handed.',
  'Security',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '0844affc-31b8-4947-b17d-d9387becbada'::uuid,
  'She demoed my slide deck under her name—she totally stole my thunder.',
  'Workplace',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid
    AND e.source_type = 'official' AND e.deleted_at IS NULL AND e.hidden_at IS NULL
);

-- =============================================================================
-- D) related_adages — each id has ≥3 outgoing edges within cluster
-- =============================================================================

-- messenger → book, actions, spoken word
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, 'similar',
  'Both concern what we infer from surfaces versus roles: harming bearers of news misjudges the message channel.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid
    AND r.related_adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, 'similar',
  'Harsh reaction to news conflicts with judging people by what they do over time.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid
    AND r.related_adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, 'similar',
  'Punishing messengers worsens the harm of words that cannot be unsaid.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid
    AND r.related_adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid AND r.relationship_type = 'similar'
);

-- book → actions (opposing), red-handed (opposing), speak of devil
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, 'opposing',
  'Covers tempt snap judgment; deeds test what appearances hide.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid
    AND r.related_adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, 'opposing',
  'Surface politeness versus caught-in-the-act evidence forces updating priors.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid
    AND r.related_adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, 'similar',
  'First impressions and surprise arrivals both reorder social attention suddenly.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid
    AND r.related_adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND r.relationship_type = 'similar'
);

-- actions → messenger, steal thunder (opposing), cat out of bag
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, 'similar',
  'Deeds and safe reporting channels both reveal what talk obscures.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid
    AND r.related_adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, '0844affc-31b8-4947-b17d-d9387becbada'::uuid, 'opposing',
  'Real contribution versus grabbing credit for spotlight.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid
    AND r.related_adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, 'similar',
  'What people do with information—disclose or perform—tests character more than slogans.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid
    AND r.related_adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND r.relationship_type = 'similar'
);

-- speak of devil → cat (paired), spoken word, steal thunder
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, 'commonly_paired',
  'Both hinge on timing of revelation and surprise in conversation.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid
    AND r.related_adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND r.relationship_type = 'commonly_paired'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, 'similar',
  'Arrival and utterance both create social facts that are hard to rewind.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid
    AND r.related_adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, '0844affc-31b8-4947-b17d-d9387becbada'::uuid, 'similar',
  'Surprise entrance and stolen spotlight both reorder who holds the conversational floor.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid
    AND r.related_adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid AND r.relationship_type = 'similar'
);

-- cat → devil (paired), spoken word, red-handed
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, 'commonly_paired',
  'See paired note on “Speak of the devil.”', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid
    AND r.related_adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND r.relationship_type = 'commonly_paired'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, 'similar',
  'Leaked secrets and irreversible words both damage trust asymmetrically.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid
    AND r.related_adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, 'similar',
  'Disclosure and caught-in-the-act evidence both collapse plausible deniability.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid
    AND r.related_adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid AND r.relationship_type = 'similar'
);

-- spoken word → messenger, cat, speak of devil
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, 'similar',
  'Harmful speech and punishing truth-tellers both break communication norms.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid
    AND r.related_adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, 'similar',
  'Irreversible words and premature disclosure both shift what groups can plausibly claim.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid
    AND r.related_adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid, 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, 'similar',
  'Named arrival and spoken harm both create memorable social facts.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '4d9e7f75-72c6-42df-924a-b5465e0889fb'::uuid
    AND r.related_adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND r.relationship_type = 'similar'
);

-- red-handed → book (opposing), actions, cat
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid, 'opposing',
  'Appearance-based judgment versus decisive proof of wrongdoing.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid
    AND r.related_adage_id = 'b349cce7-ec3a-4de5-a703-613ee48aa918'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, 'similar',
  'Caught acts are the loudest “actions” in a dispute.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid
    AND r.related_adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid, 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid, 'similar',
  'Evidence and leaks both strip deniability—different mechanisms, similar credibility shift.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '8f260ae7-1547-4131-b8e1-dade009bd2ca'::uuid
    AND r.related_adage_id = 'fac9e30a-d66a-441a-aec9-46e8bf87b4ed'::uuid AND r.relationship_type = 'similar'
);

-- steal thunder → actions (opposing), messenger, speak of devil
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '0844affc-31b8-4947-b17d-d9387becbada'::uuid, 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid, 'opposing',
  'Credit theft competes with the norm that deeds should earn recognition.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid
    AND r.related_adage_id = 'b0d22b33-eb6e-4450-b052-942b49e7c29f'::uuid AND r.relationship_type = 'opposing'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '0844affc-31b8-4947-b17d-d9387becbada'::uuid, 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid, 'similar',
  'Both concern who gets heard: stealing thunder silences rightful voice; shooting messenger silences signal.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid
    AND r.related_adage_id = 'acf9f378-f31b-471d-991d-f3a47f3966d7'::uuid AND r.relationship_type = 'similar'
);
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes, created_at)
SELECT '0844affc-31b8-4947-b17d-d9387becbada'::uuid, 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid, 'similar',
  'Timing and attention—who appears when—shape credit and surprise.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM related_adages r WHERE r.adage_id = '0844affc-31b8-4947-b17d-d9387becbada'::uuid
    AND r.related_adage_id = 'd97cc19e-7332-415c-a5ee-34d1349a04c3'::uuid AND r.relationship_type = 'similar'
);
