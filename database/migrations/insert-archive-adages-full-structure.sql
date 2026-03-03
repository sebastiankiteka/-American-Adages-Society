-- =============================================================================
-- Insert archive adages with full structure matching the site schema.
--
-- Schema mapping (site uses these column names):
--   adage          = proverb text (not "adage_text")
--   definition     = short explanation
--   origin         = source / citation
--   first_known_usage = timeline (e.g. "Medieval proverb", "Classical Chinese")
--   tags           = ARRAY['archive', 'English'] or ARRAY['archive', 'Chinese']
--   created_at, updated_at = now()
--
-- Safe to run multiple times: only inserts when adage text is not already present.
-- If "column published_at does not exist": remove published_at from the INSERT
--   list above and remove the last ", now()" from the SELECT list below.
-- If gen_random_uuid() is unavailable: replace with uuid_generate_v4().
-- =============================================================================

INSERT INTO adages (
  id,
  adage,
  definition,
  origin,
  first_known_usage,
  tags,
  created_at,
  updated_at,
  created_by,
  published_at
)
SELECT
  gen_random_uuid(),
  v.adage,
  v.definition,
  v.source_origin,
  v.timeline,
  v.tags,
  now(),
  now(),
  (SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1),
  now()
FROM (
  VALUES
    -- English adages
    ('The operation was a success, but the patient died', 'A situation that is technically or formally successful but fails in its real purpose or has a disastrous outcome. Often used ironically about bureaucracy or misplaced priorities.', 'Western idiom; 20th-century medical and bureaucratic irony.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Honesty is the best policy', 'Being truthful is the most reliable and morally sound approach in the long run, even when lying might seem easier.', 'Attributed to Benjamin Franklin and others; Western tradition.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('The grass is greener on the other side of the fence', 'Other people''s situations often seem better than our own, usually because we focus on what we lack rather than what we have.', 'English proverb; metaphor of grazing livestock.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Don''t bite the hand that feeds you', 'Do not harm or show ingratitude toward someone who supports or provides for you.', 'Western proverb; recorded in English by the 18th century.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Don''t judge a book by its cover', 'Do not form an opinion about someone or something based only on outward appearance.', 'Western proverb; became common in 20th-century American English.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Don''t throw stones at glass houses', 'Do not criticize others for faults when you have similar or worse faults yourself.', 'English proverb; "people in glass houses" variant dates to 17th century.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Rome wasn''t built in a day', 'Important achievements take time and sustained effort; do not expect instant results.', 'French medieval saying; adopted into English.', 'Medieval proverb', ARRAY['archive', 'English']::text[]),
    ('Actions speak louder than words', 'What people do matters more than what they say; behavior reveals true intentions and character.', 'English proverb, 17th century; appears in many languages.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Who let the cat out of the bag', 'To reveal a secret or disclose something that was meant to be hidden.', 'Likely from selling a pig in a bag with a cat substituted; 18th-century English.', 'Early modern idiom', ARRAY['archive', 'English']::text[]),
    ('It''s water under the bridge', 'Something is in the past and no longer worth worrying about or holding a grudge over.', 'American and British English; image of water flowing onward.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('You can''t make an omelet without breaking some eggs', 'Achieving something worthwhile often requires accepting collateral damage or making sacrifices.', 'French form older; attributed to various figures.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('The straw that broke the camel''s back', 'The final small burden or irritation that causes a system, person, or situation to finally give way.', 'From the fable of overloading a camel; "last straw" is common.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('That''s just the tip of the iceberg', 'What is visible or known is only a small part of a much larger (often hidden) situation or problem.', 'Early 20th century; from the fact that most of an iceberg lies underwater.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Better to be safe than sorry', 'It is wiser to take precautions than to risk harm or regret by acting carelessly.', 'English proverb; caution emphasized across cultures.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Don''t bite off more than you can chew', 'Do not take on more work, responsibility, or commitment than you can handle.', 'American idiom; image of taking too large a mouthful.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Barking up the wrong tree', 'Pursuing a mistaken course of action or blaming or looking in the wrong place.', 'From hunting with dogs that tree the wrong animal; American 19th century.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('It''s a piece of cake', 'Something is very easy to do.', '20th-century American slang; possibly from prize or treat easily won.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('A blessing in disguise', 'Something that seems bad at first but turns out to be beneficial.', '18th-century English; misfortune hiding good fortune in many traditions.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Breaking the ice', 'Doing or saying something to relieve tension or shyness and make people feel more comfortable.', 'From literal breaking of ice for ships; used socially by 17th century.', 'Early modern idiom', ARRAY['archive', 'English']::text[]),
    ('Kill two birds with one stone', 'Achieve two goals with a single action or effort.', 'Earliest in English in 17th century; similar sayings in other languages.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Steal my thunder', 'To take credit for someone else''s idea or to upstage them, especially by doing something they had planned.', 'From playwright John Dennis (early 18th century), whose thunder effect was copied.', 'Early modern idiom', ARRAY['archive', 'English']::text[]),
    ('Cry over spilled milk', 'To waste time or emotion regretting something that has already happened and cannot be changed.', '17th-century English; "no use crying over spilled milk."', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Speak of the devil', 'Used when someone you have just been talking about appears unexpectedly.', 'Short for "Speak of the devil and he shall appear"; English proverb.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Once in a blue moon', 'Very rarely; almost never.', 'A "blue moon" is sometimes a second full moon in a calendar month.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Yanking my chain', 'Teasing me, fooling me, or deliberately trying to annoy or provoke me.', 'American slang; from pulling a chain to control or irritate.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Grinding my gears', 'Really annoying or frustrating me.', 'American slang; from the sound of grinding gears in a vehicle.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('I caught you red-handed', 'I discovered you in the act of doing something wrong, with clear evidence.', 'From literal blood on hands; "red hand" in Scottish and English law.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Two peas in a pod', 'Two people or things that are very similar in appearance, behavior, or character.', 'The pod holds two peas that look alike; phrase dates to 16th century.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Go the extra mile', 'To make more effort than is strictly required; to do more than expected.', 'From the Bible (Matthew 5:41): if compelled to go one mile, go two.', 'Ancient / Biblical', ARRAY['archive', 'English']::text[]),
    ('Fighting demons', 'Struggling with inner troubles, addictions, or painful memories.', 'Modern idiom; "demons" means personal psychological or moral struggles.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('The sky''s the limit', 'There is no fixed limit to what can be achieved; anything is possible.', '20th-century American English; originally from aviation and ambition.', 'Modern idiom', ARRAY['archive', 'English']::text[]),
    ('Birds of a feather flock together', 'People who are similar in character or interests tend to associate with each other.', 'Old English proverb; observation about birds is ancient.', 'Ancient proverb', ARRAY['archive', 'English']::text[]),
    ('All good things come to those who wait', 'Patience is rewarded; if you wait calmly, good outcomes will come.', 'Proverb with variants in many languages.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Carpe Diem', 'Seize the day; make the most of the present moment rather than delaying or wasting it.', 'Latin phrase from the poet Horace (Odes 1.11); widely used in English.', 'Classical (Latin)', ARRAY['archive', 'English']::text[]),
    ('Cleanliness is next to godliness', 'Being clean and orderly is a virtue close to moral or spiritual goodness.', 'Attributed to John Wesley and earlier sources.', 'Early modern proverb', ARRAY['archive', 'English']::text[]),
    ('Don''t count your chickens before they are hatched', 'Do not rely on good results before they have actually happened; avoid premature optimism.', 'From Aesop''s fable of the milkmaid and her pail.', 'Ancient proverb (Aesop)', ARRAY['archive', 'English']::text[]),
    ('Don''t put your eggs all in one basket', 'Do not risk everything on a single venture; diversify to reduce risk.', 'Proverb in many languages; Miguel de Cervantes used similar image.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Don''t shoot the messenger', 'Do not blame or punish the person who brings bad news; they are not responsible for it.', 'From messengers sometimes killed for bearing bad tidings.', 'Ancient proverb', ARRAY['archive', 'English']::text[]),
    ('A drowning man will clutch at a straw', 'Someone in desperate trouble will try anything, no matter how unlikely to help.', 'Proverbial; "clutch at straws" is the common form.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('A journey of a thousand miles begins with a single step', 'Every great undertaking starts with one small action; begin rather than waiting for perfect conditions.', 'From Laozi (Lao Tzu), Tao Te Ching; widely quoted in English.', 'Classical (Laozi)', ARRAY['archive', 'English']::text[]),
    ('Give a man a fish, feed him for a day; teach a man to fish and feed him for a lifetime', 'Providing someone with a skill is more valuable than giving them a one-time handout.', 'Often attributed to Chinese or biblical sources; exact origin debated.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    -- Chinese-origin adages (English text)
    ('When you drink water, think of its source', 'Remember and be grateful for where good things come from; do not forget your roots or benefactors.', 'Chinese proverb (饮水思源).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('Hidden dragons, crouching tigers', 'Talented or dangerous people who remain out of sight until they choose to act.', 'Chinese idiom 卧虎藏龙 (crouching tiger, hidden dragon).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('One spoken word can never be taken back', 'Once you say something, you cannot undo it; words have lasting consequences.', 'Universal idea; similar sayings in many cultures.', 'Ancient proverb', ARRAY['archive', 'English']::text[]),
    ('All things are difficult before they are easy', 'Mastery requires practice; what seems hard at first becomes easier with time and effort.', 'Proverbial in many traditions.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('A foot is short, an inch is long', 'Whether something is "enough" depends on context; small things can matter when they are what you need.', 'Chinese proverb (尺有所短，寸有所长).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('Covering ears to steal a bell', 'Foolishly thinking that hiding evidence from yourself will hide it from others; self-deception.', 'Chinese fable (掩耳盗铃).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('Forget the fishing gear as soon as the fish is caught', 'To forget the help or means that led to success once the goal is achieved; ingratitude or short memory.', 'Chinese proverb (得鱼忘荃).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('One palm makes no applause', 'Some goals require cooperation; one person alone cannot achieve everything.', 'From the idea that clapping needs two hands.', 'Traditional proverb', ARRAY['archive', 'English']::text[]),
    ('Scratching an itch from outside the boot', 'Trying to solve a problem in a useless or superficial way that cannot possibly work.', 'Chinese saying (隔靴搔痒).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('A frog in a well shaft', 'Someone with a very limited view of the world who does not realize how much lies beyond their experience.', 'Chinese idiom 井底之蛙.', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('Crows everywhere are equally black', 'Evil or wrongdoing is the same everywhere; do not expect different behavior from the same kind of thing.', 'Chinese proverb (天下乌鸦一般黑).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('Dream different dreams on the same bed', 'People who share a situation can have completely different goals or views; outward unity can hide inner divergence.', 'Chinese saying (同床异梦).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('No wind, no waves', 'Without a cause, there is no effect; trouble or change does not come from nowhere.', 'Chinese proverb (无风不起浪).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('A thief calls, "stop thief"', 'A guilty party tries to deflect blame by accusing others or drawing attention away from themselves.', 'Chinese saying (贼喊捉贼).', 'Classical Chinese proverb', ARRAY['archive', 'Chinese']::text[]),
    ('Laugh, and the world laughs with you. Weep, and you weep alone.', 'In good times people join you; in sorrow you are often left to face it by yourself.', 'From the poem "Solitude" by Ella Wheeler Wilcox (1883).', 'Modern (19th century)', ARRAY['archive', 'English']::text[])
) AS v(adage, definition, source_origin, timeline, tags)
WHERE NOT EXISTS (
  SELECT 1 FROM adages a WHERE a.adage = v.adage AND a.deleted_at IS NULL
);
