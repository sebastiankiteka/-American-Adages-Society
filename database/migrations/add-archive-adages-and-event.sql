-- =============================================================================
-- Run this in Supabase SQL Editor to add all archive adages + AAS General Meeting event.
-- Each adage has a proper definition (no placeholder text). Safe to run multiple times.
--
-- If you get "column published_at does not exist": remove ", published_at" from the
-- adages INSERT and remove ", NOW()" from the SELECT list.
-- =============================================================================

-- 1) Add AAS General Meeting event (Feb 26, 2026, 2:00 PM – 3:00 PM CST)
INSERT INTO events (title, description, event_date, end_date, location, event_type, created_by)
SELECT
  'AAS General Meeting',
  E'General meeting of the American Adages Society.\n\nTime: 2:00 PM – 3:00 PM CST\nOrganization: American Adages Society (AAS)',
  '2026-02-26 20:00:00+00',
  '2026-02-26 21:00:00+00',
  'PCL, Room 5.104',
  'other',
  (SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM events
  WHERE title = 'AAS General Meeting' AND event_date = '2026-02-26 20:00:00+00' AND deleted_at IS NULL
);

-- 2) Add archive adages with full definitions (only those not already present)
INSERT INTO adages (adage, definition, origin, tags, created_by, published_at)
SELECT v.adage, v.definition, v.origin, ARRAY['archive']::text[], admin.id, NOW()
FROM (SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL LIMIT 1) AS admin(id),
(VALUES
  ('The operation was a success, but the patient died', 'A situation that is technically or formally successful but fails in its real purpose or has a disastrous outcome. Often used ironically about bureaucracy or misplaced priorities.', '20th-century medical and bureaucratic irony; widely used in American English.'),
  ('Honesty is the best policy', 'Being truthful is the most reliable and morally sound approach in the long run, even when lying might seem easier.', 'Attributed to various sources including Benjamin Franklin; the idea appears across cultures.'),
  ('The grass is greener on the other side of the fence', 'Other people''s situations often seem better than our own, usually because we focus on what we lack rather than what we have.', 'English proverb; the metaphor of grazing livestock dates back centuries.'),
  ('Don''t bite the hand that feeds you', 'Do not harm or show ingratitude toward someone who supports or provides for you.', 'From the idea of a dog biting its owner; recorded in English by the 18th century.'),
  ('Don''t judge a book by its cover', 'Do not form an opinion about someone or something based only on outward appearance.', 'The phrase became common in 20th-century American English; the metaphor is older.'),
  ('Don''t throw stones at glass houses', 'Do not criticize others for faults when you have similar or worse faults yourself.', 'Often shortened to "people in glass houses"; English proverb with variants dating to the 17th century.'),
  ('Rome wasn''t built in a day', 'Important achievements take time and sustained effort; do not expect instant results.', 'French medieval saying (Rome ne fut pas faite toute en un jour); adopted into English.'),
  ('Actions speak louder than words', 'What people do matters more than what they say; behavior reveals true intentions and character.', 'English proverb, 17th century; appears in various forms in many languages.'),
  ('Who let the cat out of the bag', 'To reveal a secret or disclose something that was meant to be hidden.', 'Likely from the trick of selling a pig in a bag when a cat was substituted; 18th-century English.'),
  ('It''s water under the bridge', 'Something is in the past and no longer worth worrying about or holding a grudge over.', 'American and British English; the image of water flowing onward is widespread.'),
  ('You can''t make an omelet without breaking some eggs', 'Achieving something worthwhile often requires accepting collateral damage or making sacrifices.', 'Attributed to various figures; the French form (On ne saurait faire une omelette sans casser des œufs) is older.'),
  ('The straw that broke the camel''s back', 'The final small burden or irritation that causes a system, person, or situation to finally give way.', 'From the fable of overloading a camel; "last straw" is a common shortening.'),
  ('That''s just the tip of the iceberg', 'What is visible or known is only a small part of a much larger (often hidden) situation or problem.', 'Early 20th century; from the fact that most of an iceberg lies underwater.'),
  ('Better to be safe than sorry', 'It is wiser to take precautions than to risk harm or regret by acting carelessly.', 'English proverb; caution and prudence are emphasized across cultures.'),
  ('Don''t bite off more than you can chew', 'Do not take on more work, responsibility, or commitment than you can handle.', 'American idiom; the image of taking too large a mouthful is universal.'),
  ('Barking up the wrong tree', 'Pursuing a mistaken course of action or blaming or looking in the wrong place.', 'From hunting with dogs that tree the wrong animal; American 19th-century origin.'),
  ('It''s a piece of cake', 'Something is very easy to do.', '20th-century American slang; possibly from the idea of a prize or treat that is easily won.'),
  ('A blessing in disguise', 'Something that seems bad at first but turns out to be beneficial.', '18th-century English; the idea that misfortune can hide good fortune appears in many traditions.'),
  ('Breaking the ice', 'Doing or saying something to relieve tension or shyness and make people feel more comfortable.', 'From the literal breaking of ice to allow ships to pass; used socially by the 17th century.'),
  ('Kill two birds with one stone', 'Achieve two goals with a single action or effort.', 'Earliest in English in the 17th century; similar sayings exist in other languages.'),
  ('Steal my thunder', 'To take credit for someone else''s idea or to upstage them, especially by doing something they had planned.', 'From the playwright John Dennis (early 18th century), whose thunder effect was copied.'),
  ('Cry over spilled milk', 'To waste time or emotion regretting something that has already happened and cannot be changed.', '17th-century English; "no use crying over spilled milk" is the full form.'),
  ('Speak of the devil', 'Used when someone you have just been talking about appears unexpectedly.', 'Short for "Speak of the devil and he shall appear"; English proverb.'),
  ('Once in a blue moon', 'Very rarely; almost never.', 'A "blue moon" is sometimes defined as a second full moon in a calendar month; the phrase means "very seldom."'),
  ('Yanking my chain', 'Teasing me, fooling me, or deliberately trying to annoy or provoke me.', 'American slang; from the idea of pulling a chain to control or irritate someone.'),
  ('Grinding my gears', 'Really annoying or frustrating me.', 'American slang; from the unpleasant sound of grinding gears in a vehicle.'),
  ('I caught you red-handed', 'I discovered you in the act of doing something wrong, with clear evidence.', 'From the literal blood on hands after a killing; "red hand" appears in Scottish and English law.'),
  ('Two peas in a pod', 'Two people or things that are very similar in appearance, behavior, or character.', 'The pod holds two peas that look alike; the phrase dates to the 16th century.'),
  ('Go the extra mile', 'To make more effort than is strictly required; to do more than expected.', 'From the Bible (Matthew 5:41): if compelled to go one mile, go two.'),
  ('Fighting demons', 'Struggling with inner troubles, addictions, or painful memories.', 'Modern idiom; "demons" here means personal psychological or moral struggles.'),
  ('The sky''s the limit', 'There is no fixed limit to what can be achieved; anything is possible.', '20th-century American English; originally from aviation and ambition.'),
  ('Birds of a feather flock together', 'People who are similar in character or interests tend to associate with each other.', 'Old English proverb; the observation about birds is ancient.'),
  ('All good things come to those who wait', 'Patience is rewarded; if you wait calmly, good outcomes will come.', 'Proverb with variants in many languages; "good things come to those who wait" is common.'),
  ('Carpe Diem', 'Seize the day; make the most of the present moment rather than delaying or wasting it.', 'Latin phrase from the poet Horace (Odes 1.11); widely used in English.'),
  ('Cleanliness is next to godliness', 'Being clean and orderly is a virtue close to moral or spiritual goodness.', 'Attributed to John Wesley and earlier sources; the link between physical and moral purity is old.'),
  ('Don''t count your chickens before they are hatched', 'Do not rely on good results before they have actually happened; avoid premature optimism.', 'From Aesop''s fable of the milkmaid and her pail; the eggs must hatch first.'),
  ('Don''t put your eggs all in one basket', 'Do not risk everything on a single venture; diversify to reduce risk.', 'Proverb found in many languages; Miguel de Cervantes used a similar image.'),
  ('Don''t shoot the messenger', 'Do not blame or punish the person who brings bad news; they are not responsible for it.', 'From the idea that messengers were sometimes killed for bearing bad tidings; ancient idea.'),
  ('A drowning man will clutch at a straw', 'Someone in desperate trouble will try anything, no matter how unlikely to help.', 'Proverbial; "clutch at straws" is the common shortened form.'),
  ('A journey of a thousand miles begins with a single step', 'Every great undertaking starts with one small action; begin rather than waiting for perfect conditions.', 'From Laozi (Lao Tzu), Tao Te Ching; widely quoted in English.'),
  ('Give a man a fish, feed him for a day; teach a man to fish and feed him for a lifetime', 'Providing someone with a skill is more valuable than giving them a one-time handout.', 'Proverb often attributed to Chinese or biblical sources; exact origin is debated.'),
  ('When you drink water, think of its source', 'Remember and be grateful for where good things come from; do not forget your roots or benefactors.', 'Chinese proverb (饮水思源); emphasizes gratitude and origin.'),
  ('Hidden dragons, crouching tigers', 'Talented or dangerous people who remain out of sight until they choose to act.', 'From Chinese idiom 卧虎藏龙 (crouching tiger, hidden dragon); used in martial-arts and literary contexts.'),
  ('One spoken word can never be taken back', 'Once you say something, you cannot undo it; words have lasting consequences.', 'Universal idea; similar sayings exist in many cultures about the irreversibility of speech.'),
  ('All things are difficult before they are easy', 'Mastery requires practice; what seems hard at first becomes easier with time and effort.', 'Proverbial idea in many traditions; persistence and learning are key.'),
  ('A foot is short, an inch is long', 'Whether something is "enough" depends on context; small things can matter when they are what you need.', 'Chinese proverb (尺有所短，寸有所长); relative value and context.'),
  ('Covering ears to steal a bell', 'Foolishly thinking that hiding evidence from yourself will hide it from others; self-deception.', 'From the Chinese fable of the man who covered his ears while stealing a bell (掩耳盗铃).'),
  ('Forget the fishing gear as soon as the fish is caught', 'To forget the help or means that led to success once the goal is achieved; ingratitude or short memory.', 'Chinese proverb (得鱼忘荃); often used about forgetting one''s roots or helpers.'),
  ('One palm makes no applause', 'Some goals require cooperation; one person alone cannot achieve everything.', 'From the idea that clapping needs two hands; cooperation and teamwork.'),
  ('Scratching an itch from outside the boot', 'Trying to solve a problem in a useless or superficial way that cannot possibly work.', 'Chinese saying (隔靴搔痒); the solution does not reach the real problem.'),
  ('A frog in a well shaft', 'Someone with a very limited view of the world who does not realize how much lies beyond their experience.', 'From the Chinese idiom 井底之蛙; the frog sees only the small circle of sky above the well.'),
  ('Crows everywhere are equally black', 'Evil or wrongdoing is the same everywhere; do not expect different behavior from the same kind of thing.', 'Chinese proverb (天下乌鸦一般黑); universal nature of certain traits.'),
  ('Dream different dreams on the same bed', 'People who share a situation can have completely different goals or views; outward unity can hide inner divergence.', 'Chinese saying (同床异梦); often used of partners or allies who are not truly aligned.'),
  ('No wind, no waves', 'Without a cause, there is no effect; trouble or change does not come from nowhere.', 'Chinese proverb (无风不起浪); every effect has a source.'),
  ('A thief calls, "stop thief"', 'A guilty party tries to deflect blame by accusing others or drawing attention away from themselves.', 'Chinese saying (贼喊捉贼); hypocrisy and deflection.'),
  ('Laugh, and the world laughs with you. Weep, and you weep alone.', 'In good times people join you; in sorrow you are often left to face it by yourself.', 'From the poem "Solitude" by Ella Wheeler Wilcox (1883); often misattributed to others.')
) AS v(adage, definition, origin)
WHERE NOT EXISTS (SELECT 1 FROM adages a WHERE a.adage = v.adage AND a.deleted_at IS NULL);
