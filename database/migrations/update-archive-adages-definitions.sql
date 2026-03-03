-- =============================================================================
-- UPDATE archive adages: definition, origin, first_known_usage (timeline).
--
-- HOW TO USE:
-- 1. Edit the definition, origin, or first_known_usage in any UPDATE below.
-- 2. Run this entire file in Supabase → SQL Editor (or run only the UPDATEs
--    you changed).
-- 3. Each UPDATE matches one adage by its exact text; updated_at is set to now().
--
-- To update a single adage: copy one UPDATE block into the SQL Editor and run it.
-- =============================================================================

-- 1
UPDATE adages SET definition = 'A situation that is technically or formally successful but fails in its real purpose or has a disastrous outcome. Often used ironically about bureaucracy or misplaced priorities.', origin = 'Western idiom; 20th-century medical and bureaucratic irony.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'The operation was a success, but the patient died' AND deleted_at IS NULL;

-- 2
UPDATE adages SET definition = 'Being truthful is the most reliable and morally sound approach in the long run, even when lying might seem easier.', origin = 'Attributed to Benjamin Franklin and others; Western tradition.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Honesty is the best policy' AND deleted_at IS NULL;

-- 3
UPDATE adages SET definition = 'Other people''s situations often seem better than our own, usually because we focus on what we lack rather than what we have.', origin = 'English proverb; metaphor of grazing livestock.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'The grass is greener on the other side of the fence' AND deleted_at IS NULL;

-- 4
UPDATE adages SET definition = 'Do not harm or show ingratitude toward someone who supports or provides for you.', origin = 'Western proverb; recorded in English by the 18th century.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Don''t bite the hand that feeds you' AND deleted_at IS NULL;

-- 5
UPDATE adages SET definition = 'Do not form an opinion about someone or something based only on outward appearance.', origin = 'Western proverb; became common in 20th-century American English.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Don''t judge a book by its cover' AND deleted_at IS NULL;

-- 6
UPDATE adages SET definition = 'Do not criticize others for faults when you have similar or worse faults yourself.', origin = 'English proverb; "people in glass houses" variant dates to 17th century.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Don''t throw stones at glass houses' AND deleted_at IS NULL;

-- 7
UPDATE adages SET definition = 'Important achievements take time and sustained effort; do not expect instant results.', origin = 'French medieval saying; adopted into English.', first_known_usage = 'Medieval proverb', updated_at = now() WHERE adage = 'Rome wasn''t built in a day' AND deleted_at IS NULL;

-- 8
UPDATE adages SET definition = 'What people do matters more than what they say; behavior reveals true intentions and character.', origin = 'English proverb, 17th century; appears in many languages.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Actions speak louder than words' AND deleted_at IS NULL;

-- 9
UPDATE adages SET definition = 'To reveal a secret or disclose something that was meant to be hidden.', origin = 'Likely from selling a pig in a bag with a cat substituted; 18th-century English.', first_known_usage = 'Early modern idiom', updated_at = now() WHERE adage = 'Who let the cat out of the bag' AND deleted_at IS NULL;

-- 10
UPDATE adages SET definition = 'Something is in the past and no longer worth worrying about or holding a grudge over.', origin = 'American and British English; image of water flowing onward.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'It''s water under the bridge' AND deleted_at IS NULL;

-- 11
UPDATE adages SET definition = 'Achieving something worthwhile often requires accepting collateral damage or making sacrifices.', origin = 'French form older; attributed to various figures.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'You can''t make an omelet without breaking some eggs' AND deleted_at IS NULL;

-- 12
UPDATE adages SET definition = 'The final small burden or irritation that causes a system, person, or situation to finally give way.', origin = 'From the fable of overloading a camel; "last straw" is common.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'The straw that broke the camel''s back' AND deleted_at IS NULL;

-- 13
UPDATE adages SET definition = 'What is visible or known is only a small part of a much larger (often hidden) situation or problem.', origin = 'Early 20th century; from the fact that most of an iceberg lies underwater.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'That''s just the tip of the iceberg' AND deleted_at IS NULL;

-- 14
UPDATE adages SET definition = 'It is wiser to take precautions than to risk harm or regret by acting carelessly.', origin = 'English proverb; caution emphasized across cultures.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'Better to be safe than sorry' AND deleted_at IS NULL;

-- 15
UPDATE adages SET definition = 'Do not take on more work, responsibility, or commitment than you can handle.', origin = 'American idiom; image of taking too large a mouthful.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Don''t bite off more than you can chew' AND deleted_at IS NULL;

-- 16
UPDATE adages SET definition = 'Pursuing a mistaken course of action or blaming or looking in the wrong place.', origin = 'From hunting with dogs that tree the wrong animal; American 19th century.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Barking up the wrong tree' AND deleted_at IS NULL;

-- 17
UPDATE adages SET definition = 'Something is very easy to do.', origin = '20th-century American slang; possibly from prize or treat easily won.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'It''s a piece of cake' AND deleted_at IS NULL;

-- 18
UPDATE adages SET definition = 'Something that seems bad at first but turns out to be beneficial.', origin = '18th-century English; misfortune hiding good fortune in many traditions.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'A blessing in disguise' AND deleted_at IS NULL;

-- 19
UPDATE adages SET definition = 'Doing or saying something to relieve tension or shyness and make people feel more comfortable.', origin = 'From literal breaking of ice for ships; used socially by 17th century.', first_known_usage = 'Early modern idiom', updated_at = now() WHERE adage = 'Breaking the ice' AND deleted_at IS NULL;

-- 20
UPDATE adages SET definition = 'Achieve two goals with a single action or effort.', origin = 'Earliest in English in 17th century; similar sayings in other languages.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Kill two birds with one stone' AND deleted_at IS NULL;

-- 21
UPDATE adages SET definition = 'To take credit for someone else''s idea or to upstage them, especially by doing something they had planned.', origin = 'From playwright John Dennis (early 18th century), whose thunder effect was copied.', first_known_usage = 'Early modern idiom', updated_at = now() WHERE adage = 'Steal my thunder' AND deleted_at IS NULL;

-- 22
UPDATE adages SET definition = 'To waste time or emotion regretting something that has already happened and cannot be changed.', origin = '17th-century English; "no use crying over spilled milk."', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Cry over spilled milk' AND deleted_at IS NULL;

-- 23
UPDATE adages SET definition = 'Used when someone you have just been talking about appears unexpectedly.', origin = 'Short for "Speak of the devil and he shall appear"; English proverb.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'Speak of the devil' AND deleted_at IS NULL;

-- 24
UPDATE adages SET definition = 'Very rarely; almost never.', origin = 'A "blue moon" is sometimes a second full moon in a calendar month.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Once in a blue moon' AND deleted_at IS NULL;

-- 25
UPDATE adages SET definition = 'Teasing me, fooling me, or deliberately trying to annoy or provoke me.', origin = 'American slang; from pulling a chain to control or irritate.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Yanking my chain' AND deleted_at IS NULL;

-- 26
UPDATE adages SET definition = 'Really annoying or frustrating me.', origin = 'American slang; from the sound of grinding gears in a vehicle.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Grinding my gears' AND deleted_at IS NULL;

-- 27
UPDATE adages SET definition = 'I discovered you in the act of doing something wrong, with clear evidence.', origin = 'From literal blood on hands; "red hand" in Scottish and English law.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'I caught you red-handed' AND deleted_at IS NULL;

-- 28
UPDATE adages SET definition = 'Two people or things that are very similar in appearance, behavior, or character.', origin = 'The pod holds two peas that look alike; phrase dates to 16th century.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'Two peas in a pod' AND deleted_at IS NULL;

-- 29
UPDATE adages SET definition = 'To make more effort than is strictly required; to do more than expected.', origin = 'From the Bible (Matthew 5:41): if compelled to go one mile, go two.', first_known_usage = 'Ancient / Biblical', updated_at = now() WHERE adage = 'Go the extra mile' AND deleted_at IS NULL;

-- 30
UPDATE adages SET definition = 'Struggling with inner troubles, addictions, or painful memories.', origin = 'Modern idiom; "demons" means personal psychological or moral struggles.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'Fighting demons' AND deleted_at IS NULL;

-- 31
UPDATE adages SET definition = 'There is no fixed limit to what can be achieved; anything is possible.', origin = '20th-century American English; originally from aviation and ambition.', first_known_usage = 'Modern idiom', updated_at = now() WHERE adage = 'The sky''s the limit' AND deleted_at IS NULL;

-- 32
UPDATE adages SET definition = 'People who are similar in character or interests tend to associate with each other.', origin = 'Old English proverb; observation about birds is ancient.', first_known_usage = 'Ancient proverb', updated_at = now() WHERE adage = 'Birds of a feather flock together' AND deleted_at IS NULL;

-- 33
UPDATE adages SET definition = 'Patience is rewarded; if you wait calmly, good outcomes will come.', origin = 'Proverb with variants in many languages.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'All good things come to those who wait' AND deleted_at IS NULL;

-- 34
UPDATE adages SET definition = 'Seize the day; make the most of the present moment rather than delaying or wasting it.', origin = 'Latin phrase from the poet Horace (Odes 1.11); widely used in English.', first_known_usage = 'Classical (Latin)', updated_at = now() WHERE adage = 'Carpe Diem' AND deleted_at IS NULL;

-- 35
UPDATE adages SET definition = 'Being clean and orderly is a virtue close to moral or spiritual goodness.', origin = 'Attributed to John Wesley and earlier sources.', first_known_usage = 'Early modern proverb', updated_at = now() WHERE adage = 'Cleanliness is next to godliness' AND deleted_at IS NULL;

-- 36
UPDATE adages SET definition = 'Do not rely on good results before they have actually happened; avoid premature optimism.', origin = 'From Aesop''s fable of the milkmaid and her pail.', first_known_usage = 'Ancient proverb (Aesop)', updated_at = now() WHERE adage = 'Don''t count your chickens before they are hatched' AND deleted_at IS NULL;

-- 37
UPDATE adages SET definition = 'Do not risk everything on a single venture; diversify to reduce risk.', origin = 'Proverb in many languages; Miguel de Cervantes used similar image.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'Don''t put your eggs all in one basket' AND deleted_at IS NULL;

-- 38
UPDATE adages SET definition = 'Do not blame or punish the person who brings bad news; they are not responsible for it.', origin = 'From messengers sometimes killed for bearing bad tidings.', first_known_usage = 'Ancient proverb', updated_at = now() WHERE adage = 'Don''t shoot the messenger' AND deleted_at IS NULL;

-- 39
UPDATE adages SET definition = 'Someone in desperate trouble will try anything, no matter how unlikely to help.', origin = 'Proverbial; "clutch at straws" is the common form.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'A drowning man will clutch at a straw' AND deleted_at IS NULL;

-- 40
UPDATE adages SET definition = 'Every great undertaking starts with one small action; begin rather than waiting for perfect conditions.', origin = 'From Laozi (Lao Tzu), Tao Te Ching; widely quoted in English.', first_known_usage = 'Classical (Laozi)', updated_at = now() WHERE adage = 'A journey of a thousand miles begins with a single step' AND deleted_at IS NULL;

-- 41
UPDATE adages SET definition = 'Providing someone with a skill is more valuable than giving them a one-time handout.', origin = 'Often attributed to Chinese or biblical sources; exact origin debated.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'Give a man a fish, feed him for a day; teach a man to fish and feed him for a lifetime' AND deleted_at IS NULL;

-- 42
UPDATE adages SET definition = 'Remember and be grateful for where good things come from; do not forget your roots or benefactors.', origin = 'Chinese proverb (饮水思源).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'When you drink water, think of its source' AND deleted_at IS NULL;

-- 43
UPDATE adages SET definition = 'Talented or dangerous people who remain out of sight until they choose to act.', origin = 'Chinese idiom 卧虎藏龙 (crouching tiger, hidden dragon).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'Hidden dragons, crouching tigers' AND deleted_at IS NULL;

-- 44
UPDATE adages SET definition = 'Once you say something, you cannot undo it; words have lasting consequences.', origin = 'Universal idea; similar sayings in many cultures.', first_known_usage = 'Ancient proverb', updated_at = now() WHERE adage = 'One spoken word can never be taken back' AND deleted_at IS NULL;

-- 45
UPDATE adages SET definition = 'Mastery requires practice; what seems hard at first becomes easier with time and effort.', origin = 'Proverbial in many traditions.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'All things are difficult before they are easy' AND deleted_at IS NULL;

-- 46
UPDATE adages SET definition = 'Whether something is "enough" depends on context; small things can matter when they are what you need.', origin = 'Chinese proverb (尺有所短，寸有所长).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'A foot is short, an inch is long' AND deleted_at IS NULL;

-- 47
UPDATE adages SET definition = 'Foolishly thinking that hiding evidence from yourself will hide it from others; self-deception.', origin = 'Chinese fable (掩耳盗铃).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'Covering ears to steal a bell' AND deleted_at IS NULL;

-- 48
UPDATE adages SET definition = 'To forget the help or means that led to success once the goal is achieved; ingratitude or short memory.', origin = 'Chinese proverb (得鱼忘荃).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'Forget the fishing gear as soon as the fish is caught' AND deleted_at IS NULL;

-- 49
UPDATE adages SET definition = 'Some goals require cooperation; one person alone cannot achieve everything.', origin = 'From the idea that clapping needs two hands.', first_known_usage = 'Traditional proverb', updated_at = now() WHERE adage = 'One palm makes no applause' AND deleted_at IS NULL;

-- 50
UPDATE adages SET definition = 'Trying to solve a problem in a useless or superficial way that cannot possibly work.', origin = 'Chinese saying (隔靴搔痒).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'Scratching an itch from outside the boot' AND deleted_at IS NULL;

-- 51
UPDATE adages SET definition = 'Someone with a very limited view of the world who does not realize how much lies beyond their experience.', origin = 'Chinese idiom 井底之蛙.', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'A frog in a well shaft' AND deleted_at IS NULL;

-- 52
UPDATE adages SET definition = 'Evil or wrongdoing is the same everywhere; do not expect different behavior from the same kind of thing.', origin = 'Chinese proverb (天下乌鸦一般黑).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'Crows everywhere are equally black' AND deleted_at IS NULL;

-- 53
UPDATE adages SET definition = 'People who share a situation can have completely different goals or views; outward unity can hide inner divergence.', origin = 'Chinese saying (同床异梦).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'Dream different dreams on the same bed' AND deleted_at IS NULL;

-- 54
UPDATE adages SET definition = 'Without a cause, there is no effect; trouble or change does not come from nowhere.', origin = 'Chinese proverb (无风不起浪).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'No wind, no waves' AND deleted_at IS NULL;

-- 55
UPDATE adages SET definition = 'A guilty party tries to deflect blame by accusing others or drawing attention away from themselves.', origin = 'Chinese saying (贼喊捉贼).', first_known_usage = 'Classical Chinese proverb', updated_at = now() WHERE adage = 'A thief calls, "stop thief"' AND deleted_at IS NULL;

-- 56
UPDATE adages SET definition = 'In good times people join you; in sorrow you are often left to face it by yourself.', origin = 'From the poem "Solitude" by Ella Wheeler Wilcox (1883).', first_known_usage = 'Modern (19th century)', updated_at = now() WHERE adage = 'Laugh, and the world laughs with you. Weep, and you weep alone.' AND deleted_at IS NULL;
