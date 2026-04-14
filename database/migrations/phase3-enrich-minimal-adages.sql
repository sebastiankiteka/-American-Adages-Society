-- =============================================================================
-- Phase 3 — Enrich MINIMAL adages only (audit: status = minimal)
-- =============================================================================
-- Does NOT touch FULL (4) or PARTIAL (78) entries — updates are scoped by id below.
-- Reference template: /archive/0d588e53-a308-420c-9088-2319635562e0
--
-- Reruns: Uses COALESCE(column, '…') so NULLs are filled once; if you need to
-- replace generated text, set the column to NULL first or edit manually.
--
-- Optional: one official usage example per adage (skipped if one already exists).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5657e461-22cd-43f6-ba48-48df9d5f508a — A stitch in time saves nine
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; the sewing metaphor is traditional in British and American English. Exact first attestation is uncertain.'),
  first_known_usage = COALESCE(first_known_usage, 'Proverbial in English by the early modern period; widely printed in collections of sayings in the 18th and 19th centuries.'),
  etymology = COALESCE(etymology, 'The image is literal needlework: one stitch closes a small tear before the fabric unravels. The number nine exaggerates the later cost of neglect (repairs multiply) rather than naming a precise ratio.'),
  historical_context = COALESCE(historical_context, 'The saying circulated as practical household wisdom and was later adopted in business and engineering talk about maintenance and defect prevention.'),
  interpretation = COALESCE(interpretation, 'The underlying rule is that marginal prevention reduces expected loss: deferral raises the cost and scope of repair.'),
  modern_practicality = COALESCE(modern_practicality, 'Typical domains include physical maintenance, software defect triage, household repairs, and conflict resolution before escalation.'),
  updated_at = now()
WHERE id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','wisdom','prevention','repair']))
) WHERE id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 3b770021-1929-437e-a104-b81c8dd7c559 — Don't put all your eggs in one basket
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'Proverbial across European languages; a similar image appears in Cervantes (Don Quixote, Part I). English forms became common in the 18th–19th centuries. Not tied to a single author.'),
  first_known_usage = COALESCE(first_known_usage, 'Circulated in English-language proverb collections and advice literature from the 1700s onward; modern use is often financial.'),
  etymology = COALESCE(etymology, 'Eggs in one basket concentrate breakage risk: one jolt ruins the whole load. The basket is any single channel for hope, money, or reputation.'),
  historical_context = COALESCE(historical_context, 'Used in agricultural and commercial contexts before modern portfolio theory; the same logic applies to reputation and career bets.'),
  interpretation = COALESCE(interpretation, 'Risk is tied to concentration: one catastrophic draw on a single asset or outcome can dominate outcomes unless exposure is spread.'),
  modern_practicality = COALESCE(modern_practicality, 'Common applications include portfolio allocation, supplier redundancy, skill breadth in careers, and splitting operational dependencies.'),
  updated_at = now()
WHERE id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','risk','diversification','planning']))
) WHERE id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 4385ddee-7a6e-4742-8dcc-9bfb7e133135 — Every dog has its day
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; an early form appears in Chaucer (The Knight''s Tale, 14th c.); Shakespeare uses the idea in Hamlet. Exact wording and date of the modern proverb are uncertain.'),
  first_known_usage = COALESCE(first_known_usage, 'Familiar in Early Modern English; later fixed as a general proverb about luck and turns of fortune.'),
  etymology = COALESCE(etymology, '“Dog” here means any person of low or ordinary station; “day” is a moment of success or public notice, not necessarily lasting power.'),
  historical_context = COALESCE(historical_context, 'Used to temper arrogance of the powerful and to encourage patience among the overlooked; class and luck undertones are common in older uses.'),
  interpretation = COALESCE(interpretation, 'The maxim asserts that status and luck are not fixed: advantage today does not exhaust the possibility of reversal or recognition later.'),
  modern_practicality = COALESCE(modern_practicality, 'Typical uses include commentary on careers, elections, athletics, and any domain where outcomes reverse over time.'),
  updated_at = now()
WHERE id = '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','fortune','patience','equality']))
) WHERE id = '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 374f564a-19ff-4f9e-aac9-a821c0fc9078 — Fortune favors the bold
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'The thought is classical; a famous Latin form is audentes Fortuna iuvat (Virgil, Aeneid). English wording varies; “fortune favors the brave/bold” is proverbial.'),
  first_known_usage = COALESCE(first_known_usage, 'Latin literary and moral tradition; widespread in English as a motto and proverb from the early modern period onward.'),
  etymology = COALESCE(etymology, '“Fortune” personifies chance or outcome; “bold” names initiative and exposure to risk—not recklessness, in careful use.'),
  historical_context = COALESCE(historical_context, 'Used in military, exploration, and civic contexts to praise decisive action; critics pair it with prudence proverbs for balance.'),
  interpretation = COALESCE(interpretation, 'The principle is that initiative and exposure to risk are often prerequisites for access to opportunity; passivity avoids loss but can forfeit upside.'),
  modern_practicality = COALESCE(modern_practicality, 'Illustrative contexts include pitching ideas, seeking funding, competitive bidding, and other settings where delay forfeits position.'),
  updated_at = now()
WHERE id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','courage','risk','action']))
) WHERE id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 3d41c368-506a-4272-9175-66b50914db3b — Grinding my gears
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'American informal idiom; the sense derives from the noise of misaligned or stressed gears in machinery, especially in automotive contexts.'),
  first_known_usage = COALESCE(first_known_usage, 'Late 20th-century American English; frequency increased through television, film, and online discourse.'),
  etymology = COALESCE(etymology, 'The expression transfers mechanical friction and noise to social irritation: a recurring stimulus that wears on the listener.'),
  historical_context = COALESCE(historical_context, 'Standard in informal American English; uncommon in formal prose or academic registers.'),
  interpretation = COALESCE(interpretation, 'The saying denotes persistent, low-grade annoyance rather than a single severe offense; tone may be humorous or plainly irritable.'),
  modern_practicality = COALESCE(modern_practicality, 'Typical use: informal complaints about notifications, meetings, habits, or workflow friction in workplaces and daily life.'),
  updated_at = now()
WHERE id = '3d41c368-506a-4272-9175-66b50914db3b'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','idiom','frustration','American English']))
) WHERE id = '3d41c368-506a-4272-9175-66b50914db3b'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 1ea2091f-bf55-4325-bfa2-0885ed05480b — If it ain't broke, don't fix it
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'American colloquial English; exact origin is uncertain. Widely attributed to informal maintenance and engineering culture in the mid–late 20th century.'),
  first_known_usage = COALESCE(first_known_usage, 'Documented in American speech and print from the 1970s onward; became a standard slogan in IT and management.'),
  etymology = COALESCE(etymology, '“Broke” = broken, non-functional. The structure is a paired prohibition: stability is the default; change needs a warrant.'),
  historical_context = COALESCE(historical_context, 'Popular where systems are complex and side effects of change are costly—software, policy, and machinery.'),
  interpretation = COALESCE(interpretation, 'The maxim privileges stability when performance is adequate: change carries hazard, so intervention requires justification. It does not oppose necessary repair or safety work.'),
  modern_practicality = COALESCE(modern_practicality, 'Often cited in software maintenance, legacy systems, and policy review when proposed changes lack demonstrated benefit.'),
  updated_at = now()
WHERE id = '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','pragmatism','change','systems']))
) WHERE id = '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 68af3dbb-d333-4cef-ab1a-404465ed7dad — It's a piece of cake
-- -----------------------------------------------------------------------------
UPDATE adages SET
  etymology = COALESCE(etymology, '“Piece of cake” = something easy, possibly from prize cakes at fairs or from 1930s American slang linking sweets to effortless rewards; exact etymology is debated.'),
  historical_context = COALESCE(historical_context, 'Firmly established in 20th-century American English; parallels exist (“easy as pie”) with different foods.'),
  interpretation = COALESCE(interpretation, 'The phrase asserts minimal difficulty relative to the speaker''s skill or preparation; it carries a subjective baseline and can minimize others'' effort.'),
  modern_practicality = COALESCE(modern_practicality, 'Appropriate in informal reassurance; unsuitable where task difficulty is disputed or where sensitivity to skill gaps matters.'),
  updated_at = now()
WHERE id = '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','idiom','ease','American English']))
) WHERE id = '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- f5494365-1d8d-4345-a1f7-eedff200bf32 — Look before you leap
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; aligned with Aesopic fables about rash animals. Proverbial across Europe; exact first English wording is uncertain.'),
  first_known_usage = COALESCE(first_known_usage, 'Recorded in English proverb collections from the early modern period; long used as moral and practical advice.'),
  etymology = COALESCE(etymology, 'Literal leap = jump into danger or commitment; “look” = survey, gather information, assess landing.'),
  historical_context = COALESCE(historical_context, 'Used in moral instruction, law, and commerce to stress deliberation before contract or travel.'),
  interpretation = COALESCE(interpretation, 'The principle is due diligence before commitment: irreversible or costly steps should follow information gathering, not impulse.'),
  modern_practicality = COALESCE(modern_practicality, 'Examples include reviewing contracts, verifying assumptions before investment, and assessing risk before public pledges.'),
  updated_at = now()
WHERE id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','caution','planning','decisions']))
) WHERE id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a — Measure twice, cut once
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English-language workshop proverb; strongly associated with carpentry and tailoring. Exact first citation is uncertain.'),
  first_known_usage = COALESCE(first_known_usage, 'Common in trade advice from the 19th century onward; still standard in maker culture.'),
  etymology = COALESCE(etymology, 'Wood and fabric are costly to undo; measurement error is irreversible. “Twice” is a minimum, not a literal cap.'),
  historical_context = COALESCE(historical_context, 'Embodies craft apprenticeship norms: planning time is cheaper than material waste.'),
  interpretation = COALESCE(interpretation, 'Verification should precede irreversible action: the cost of error rises sharply after the decisive step.'),
  modern_practicality = COALESCE(modern_practicality, 'Applied in trades, manufacturing, surgery planning, software releases, and other settings with costly rollback.'),
  updated_at = now()
WHERE id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','precision','craft','planning']))
) WHERE id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- ac828be2-f404-4888-a519-8ca5828b7c9c — Necessity is the mother of invention
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; ideas of necessity driving ingenuity appear in classical philosophy (e.g. Plato, Republic). The familiar English wording became proverbial; exact phrasing and author are debated.'),
  first_known_usage = COALESCE(first_known_usage, 'English forms appear by the early modern period; widespread in scientific and industrial discourse by the 19th century.'),
  etymology = COALESCE(etymology, '“Mother” = source or catalyst; “necessity” = constraint, scarcity, or urgent need that cannot be postponed.'),
  historical_context = COALESCE(historical_context, 'Invoked for wartime innovation, disaster response, and bootstrap entrepreneurship, where constraints appear before formal budgets.'),

  interpretation = COALESCE(interpretation, 'Need can accelerate problem-solving by narrowing options and raising willingness to accept novel methods; it does not ensure benign or safe outcomes.'),
  modern_practicality = COALESCE(modern_practicality, 'Examples include crisis tooling, field expedients, disaster response, and rapid prototyping under deadline.'),
  updated_at = now()
WHERE id = 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','innovation','constraint','ingenuity']))
) WHERE id = 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- d4a99df8-66a9-4d4a-9d2c-74967f19f42a — Nothing ventured, nothing gained
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; related forms exist in several languages. Often associated with Chaucer (Troilus and Criseyde) in spirit; modern wording is proverbial rather than a single quotation.'),
  first_known_usage = COALESCE(first_known_usage, 'Common in English from the early modern period in moral and commercial contexts.'),
  etymology = COALESCE(etymology, '“Venture” = stake, exposure, or outbound effort; “gain” = profit, learning, or position—returns require risk or effort.'),
  historical_context = COALESCE(historical_context, 'Balances caution proverbs: it answers “look before you leap” with the cost of never leaping—missed opportunity.'),
  interpretation = COALESCE(interpretation, 'Expected return generally requires exposure: avoiding all stake avoids loss but also forgoes gain.'),
  modern_practicality = COALESCE(modern_practicality, 'Used when discussing portfolios, career experiments, grants, auditions, and other domains with staged risk-taking.'),
  updated_at = now()
WHERE id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','risk','opportunity','effort']))
) WHERE id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- a7204fa2-7ad8-4ef2-a588-040109f11f56 — Once in a blue moon
-- -----------------------------------------------------------------------------
UPDATE adages SET
  etymology = COALESCE(etymology, '“Blue moon” has been used for rare moons and, in modern popular usage, sometimes the second full moon in a calendar month; the phrase “once in a blue moon” means very seldom, not an astronomical schedule.'),
  historical_context = COALESCE(historical_context, 'Fixed as an idiom of rarity in modern English; folk etymologies abound—treat astronomical details cautiously in casual speech.'),
  interpretation = COALESCE(interpretation, 'The idiom marks events as occurring on a very low frequency; speaker stance may be disappointment or relief depending on context.'),
  modern_practicality = COALESCE(modern_practicality, 'Used in scheduling, service-level discussion, and informal estimates of rarity.'),
  updated_at = now()
WHERE id = 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','idiom','rarity','time']))
) WHERE id = 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 081da24c-5f1b-4e0e-91e8-7752d5d1c7b7 — Penny wise and pound foolish
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; “penny” and “pound” reflect British currency. Similar warnings appear in many cultures; exact first English wording is uncertain.'),
  first_known_usage = COALESCE(first_known_usage, 'Established in English by the 17th century in moral and economic advice.'),
  etymology = COALESCE(etymology, 'Contrasts units of money to contrast scales of attention: vigilance on trifles paired with blindness to large losses.'),
  historical_context = COALESCE(historical_context, 'Used to critique false economy in households, firms, and policy—saving visible pennies while wasting invisible pounds.'),
  interpretation = COALESCE(interpretation, 'The error is misallocating attention: small visible savings can mask large hidden losses when the full cost distribution is ignored.'),
  modern_practicality = COALESCE(modern_practicality, 'Examples include underfunding compliance, deferring safety work, and chasing short-term KPIs at the expense of tail risks.'),
  updated_at = now()
WHERE id = '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','economics','judgment','bias']))
) WHERE id = '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 606df382-af67-4917-80e9-d23a675c6f17 — Speak softly and carry a big stick
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'Associated with Theodore Roosevelt (U.S., early 20th century); he described the idea as a West African proverb in a 1903 speech—actual African source texts vary, and the “proverb” label is partly rhetorical.'),
  first_known_usage = COALESCE(first_known_usage, 'Prominent in American political discourse after Roosevelt; earlier parallel images exist in military and diplomatic writing.'),
  etymology = COALESCE(etymology, 'The maxim pairs conciliatory speech with a credible threat of enforcement: diplomacy is coupled with demonstrated capacity to act if negotiation fails.'),
  historical_context = COALESCE(historical_context, 'Interpretation varies by context: some treat it as a doctrine of deterrence; others criticize it as justification for coercion. Audience and era shape reading.'),
  interpretation = COALESCE(interpretation, 'The underlying idea is that persuasion works best when backed by verifiable capability; repeated empty threats reduce credibility.'),
  modern_practicality = COALESCE(modern_practicality, 'Referenced in international relations, labor negotiation, security policy, and management when discussing escalation paths and deterrent posture.'),
  updated_at = now()
WHERE id = '606df382-af67-4917-80e9-d23a675c6f17'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','diplomacy','power','negotiation']))
) WHERE id = '606df382-af67-4917-80e9-d23a675c6f17'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- e6e43f21-25b0-478b-8505-45034347ca46 — Still waters run deep
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; variants appear in European languages. Literary uses from the early modern period onward; proverbial status solidified in the 18th–19th centuries.'),
  first_known_usage = COALESCE(first_known_usage, 'Common in English letters and essays by the 1800s as character description.'),
  etymology = COALESCE(etymology, 'Surface calm over depth of water maps to quiet demeanor over strong intellect or emotion; “run” suggests current beneath stillness.'),
  historical_context = COALESCE(historical_context, 'Applied to reserved individuals—sometimes admiring depth, sometimes suspicious secrecy, depending on tone.'),
  interpretation = COALESCE(interpretation, 'Quiet demeanor does not imply lack of intellect or emotion; surface behavior is an unreliable proxy for inner state.'),
  modern_practicality = COALESCE(modern_practicality, 'Often raised in hiring interviews, performance reviews, and cross-cultural settings where reserved communication styles are common.'),
  updated_at = now()
WHERE id = 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','character','perception','depth']))
) WHERE id = 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 520564b6-5b5a-4116-a7dc-e717ec1f762c — The proof is in the pudding
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; the older form is often given as “the proof of the pudding is in the eating.” Modern shortening is colloquial.'),
  first_known_usage = COALESCE(first_known_usage, '“Pudding” here is often read as a dish whose quality is known only by tasting—usage in English proverb collections from the 17th century onward.'),
  etymology = COALESCE(etymology, '“Proof” = test or demonstration (older sense), not mathematical proof. Pudding = outcome you must experience to judge.'),
  historical_context = COALESCE(historical_context, 'Used against purely theoretical claims in craft, cookery, policy, and science—empirical check wins.'),
  interpretation = COALESCE(interpretation, 'Outcomes trump prior claims: evaluation should track observed performance rather than ex ante assertions alone.'),
  modern_practicality = COALESCE(modern_practicality, 'Typical uses include trial periods, pilot deployments, product demos, and empirical validation before scale-up.'),
  updated_at = now()
WHERE id = '520564b6-5b5a-4116-a7dc-e717ec1f762c'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','evidence','practice','evaluation']))
) WHERE id = '520564b6-5b5a-4116-a7dc-e717ec1f762c'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 80129a50-7c8b-4754-bdd7-793ef53509fb — The squeaky wheel gets the grease
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'American English proverb; widely attested in the 20th century in business and popular advice. Exact origin is uncertain.'),
  first_known_usage = COALESCE(first_known_usage, 'Common in American print from the early–mid 20th century as a metaphor for attention allocation.'),
  etymology = COALESCE(etymology, 'Cart and machinery wheels that squeak receive lubrication; noise maps to visible demand or complaint.'),
  historical_context = COALESCE(historical_context, 'Used to explain triage and queue-jumping; also criticized when loud voices crowd out quiet need.'),
  interpretation = COALESCE(interpretation, 'Attention and resources often follow salient demand; low-visibility needs may go unmet even when severity is high.'),
  modern_practicality = COALESCE(modern_practicality, 'Design implications include triage rules, proactive outreach to quiet users, and safeguards against loudest-voice bias in queues.'),
  updated_at = now()
WHERE id = '80129a50-7c8b-4754-bdd7-793ef53509fb'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','advocacy','attention','equity']))
) WHERE id = '80129a50-7c8b-4754-bdd7-793ef53509fb'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 9d8e41e5-0508-422c-ae84-8922003fa8fd — Time is money
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'Closely associated with Benjamin Franklin''s Poor Richard''s Almanack (18th century), though similar sentiments are older. Franklin popularized the pairing in American English.'),
  first_known_usage = COALESCE(first_known_usage, '18th-century American aphoristic tradition; later standard in business and productivity writing.'),
  etymology = COALESCE(etymology, 'Maps duration to currency: delay has opportunity cost; attention is a scarce budget.'),
  historical_context = COALESCE(historical_context, 'Aligned with early industrial time discipline and later with hourly billing and throughput metrics.'),
  interpretation = COALESCE(interpretation, 'Time has opportunity cost: foregone use of an hour can be valued against alternative productive or restorative uses.'),
  modern_practicality = COALESCE(modern_practicality, 'Applied in billing models, project estimation, meeting load analysis, and productivity discussion; rest and non-market time involve separate norms.'),
  updated_at = now()
WHERE id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','time','economics','productivity']))
) WHERE id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 4a1c5d67-a816-45a8-80c7-857ce561ae4d — Where there's a will, there's a way
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'English proverb; related forms exist in other European languages. Exact origin is uncertain; widespread in 19th-century moral literature.'),
  first_known_usage = COALESCE(first_known_usage, 'Proverbial in English by the 1800s as encouragement and exhortation.'),
  etymology = COALESCE(etymology, '“Will” = resolve or intention; “way” = path or method. The rhyme fixes the memorability.'),
  historical_context = COALESCE(historical_context, 'Invoked in education, temperance, and national narratives of perseverance; critics note it can ignore structural barriers.'),
  interpretation = COALESCE(interpretation, 'Resolve increases persistence in problem-solving; it does not remove material or structural constraints by itself.'),
  modern_practicality = COALESCE(modern_practicality, 'Often paired with planning and resource assessment so motivation is not confused with guaranteed feasibility.'),
  updated_at = now()
WHERE id = '4a1c5d67-a816-45a8-80c7-857ce561ae4d'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','determination','agency','perseverance']))
) WHERE id = '4a1c5d67-a816-45a8-80c7-857ce561ae4d'::uuid AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 16199dce-c70f-4665-bccb-5598bc5244a2 — You reap what you sow
-- -----------------------------------------------------------------------------
UPDATE adages SET
  origin = COALESCE(origin, 'Biblical phrasing echoes agricultural law-of-consequence (e.g. Galatians 6:7 in Christian scripture). The proverb exists in many cultures independent of that text; English use blends religious and secular registers.'),
  first_known_usage = COALESCE(first_known_usage, 'English proverbial and homiletic use for centuries; modern secular use is common in ethics and management.'),
  etymology = COALESCE(etymology, 'Agricultural metaphor: harvest matches seed—species, season, and care. Extended to moral and social outcomes.'),
  historical_context = COALESCE(historical_context, 'Used for individual conduct, intergenerational justice, and institutional culture (“culture is what you tolerate”).'),
  interpretation = COALESCE(interpretation, 'The core claim is correspondence between conduct and later consequence, whether read as moral law or as loose correlation under noise.'),
  modern_practicality = COALESCE(modern_practicality, 'Used in discussions of habits, organizational culture, technical debt, and long-run reputation where feedback loops are slow.'),
  updated_at = now()
WHERE id = '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid
  AND deleted_at IS NULL;

UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY['archive','consequence','ethics','accountability']))
) WHERE id = '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid AND deleted_at IS NULL;

-- =============================================================================
-- Optional: one official usage example per adage (idempotent)
-- =============================================================================

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid,
  'We fixed the small leak now—a stitch in time saves nine on a roof.',
  'Home maintenance',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '5657e461-22cd-43f6-ba48-48df9d5f508a'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '3b770021-1929-437e-a104-b81c8dd7c559'::uuid,
  'She split her savings across funds and cash—she was not putting all her eggs in one basket.',
  'Personal finance',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '3b770021-1929-437e-a104-b81c8dd7c559'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid,
  'The rookie scored twice—every dog has its day.',
  'Sports',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '4385ddee-7a6e-4742-8dcc-9bfb7e133135'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid,
  'They bid aggressively because fortune favors the bold—knowing the downside.',
  'Business',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '374f564a-19ff-4f9e-aac9-a821c0fc9078'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '3d41c368-506a-4272-9175-66b50914db3b'::uuid,
  'That notification sound every minute is really grinding my gears.',
  'Informal complaint',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '3d41c368-506a-4272-9175-66b50914db3b'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid,
  'The legacy server is stable—if it ain''t broke, don''t fix it until we have a migration plan.',
  'IT operations',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '1ea2091f-bf55-4325-bfa2-0885ed05480b'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid,
  'The certification exam? It was a piece of cake after the practice tests.',
  'Education',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '68af3dbb-d333-4cef-ab1a-404465ed7dad'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid,
  'Read the contract before you sign—look before you leap.',
  'Legal / consumer',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'f5494365-1d8d-4345-a1f7-eedff200bf32'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid,
  'She checked the measurements twice—measure twice, cut once—before sawing the beam.',
  'Woodworking',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'f3ba7b90-ddf2-45b1-b1b4-9a9d92285f0a'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid,
  'The outage forced a workaround overnight—necessity is the mother of invention.',
  'Engineering',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'ac828be2-f404-4888-a519-8ca5828b7c9c'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid,
  'He finally pitched investors—nothing ventured, nothing gained.',
  'Career',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'd4a99df8-66a9-4d4a-9d2c-74967f19f42a'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid,
  'A total eclipse here happens once in a blue moon.',
  'Astronomy / casual',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'a7204fa2-7ad8-4ef2-a588-040109f11f56'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid,
  'They saved on safety training but paid millions in fines—penny wise and pound foolish.',
  'Risk management',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '081da24c-5f1b-4e0e-91e8-7752d5d1c7b7'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '606df382-af67-4917-80e9-d23a675c6f17'::uuid,
  'The envoy negotiated quietly while the fleet stayed in port—speak softly and carry a big stick.',
  'Diplomacy (illustrative)',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '606df382-af67-4917-80e9-d23a675c6f17'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid,
  'He barely spoke in the meeting, but his questions cut to the core—still waters run deep.',
  'Workplace',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = 'e6e43f21-25b0-478b-8505-45034347ca46'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '520564b6-5b5a-4116-a7dc-e717ec1f762c'::uuid,
  'We will know after the pilot: the proof is in the pudding.',
  'Product development',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '520564b6-5b5a-4116-a7dc-e717ec1f762c'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '80129a50-7c8b-4754-bdd7-793ef53509fb'::uuid,
  'Only the loudest tickets got escalated—the squeaky wheel gets the grease.',
  'Service operations',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '80129a50-7c8b-4754-bdd7-793ef53509fb'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid,
  'Billable hours lost to rework: time is money on this contract.',
  'Consulting',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '9d8e41e5-0508-422c-ae84-8922003fa8fd'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '4a1c5d67-a816-45a8-80c7-857ce561ae4d'::uuid,
  'They routed supplies through the mountains—where there''s a will, there''s a way.',
  'Logistics / resolve',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '4a1c5d67-a816-45a8-80c7-857ce561ae4d'::uuid AND e.deleted_at IS NULL
);

INSERT INTO adage_usage_examples (adage_id, example_text, context, source_type, created_at)
SELECT '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid,
  'The team shipped fast for a year, then spent two years fixing debt—you reap what you sow.',
  'Software development',
  'official',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM adage_usage_examples e
  WHERE e.adage_id = '16199dce-c70f-4665-bccb-5598bc5244a2'::uuid AND e.deleted_at IS NULL
);
