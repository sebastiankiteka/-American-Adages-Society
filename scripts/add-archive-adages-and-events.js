/**
 * Add archive adages (exact list) and AAS General Meeting event.
 * Run with: node scripts/add-archive-adages-and-events.js
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) envVars[match[1].trim()] = match[2].trim()
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Adages with full definitions and origins (matches add-archive-adages-and-event.sql)
const ADAGE_ENTRIES = [
  { adage: 'The operation was a success, but the patient died', definition: 'A situation that is technically or formally successful but fails in its real purpose or has a disastrous outcome. Often used ironically about bureaucracy or misplaced priorities.', origin: '20th-century medical and bureaucratic irony; widely used in American English.' },
  { adage: 'Honesty is the best policy', definition: 'Being truthful is the most reliable and morally sound approach in the long run, even when lying might seem easier.', origin: 'Attributed to various sources including Benjamin Franklin; the idea appears across cultures.' },
  { adage: 'The grass is greener on the other side of the fence', definition: 'Other people\'s situations often seem better than our own, usually because we focus on what we lack rather than what we have.', origin: 'English proverb; the metaphor of grazing livestock dates back centuries.' },
  { adage: "Don't bite the hand that feeds you", definition: 'Do not harm or show ingratitude toward someone who supports or provides for you.', origin: 'From the idea of a dog biting its owner; recorded in English by the 18th century.' },
  { adage: "Don't judge a book by its cover", definition: 'Do not form an opinion about someone or something based only on outward appearance.', origin: 'The phrase became common in 20th-century American English; the metaphor is older.' },
  { adage: "Don't throw stones at glass houses", definition: 'Do not criticize others for faults when you have similar or worse faults yourself.', origin: 'Often shortened to "people in glass houses"; English proverb with variants dating to the 17th century.' },
  { adage: "Rome wasn't built in a day", definition: 'Important achievements take time and sustained effort; do not expect instant results.', origin: 'French medieval saying (Rome ne fut pas faite toute en un jour); adopted into English.' },
  { adage: 'Actions speak louder than words', definition: 'What people do matters more than what they say; behavior reveals true intentions and character.', origin: 'English proverb, 17th century; appears in various forms in many languages.' },
  { adage: 'Who let the cat out of the bag', definition: 'To reveal a secret or disclose something that was meant to be hidden.', origin: 'Likely from the trick of selling a pig in a bag when a cat was substituted; 18th-century English.' },
  { adage: "It's water under the bridge", definition: 'Something is in the past and no longer worth worrying about or holding a grudge over.', origin: 'American and British English; the image of water flowing onward is widespread.' },
  { adage: "You can't make an omelet without breaking some eggs", definition: 'Achieving something worthwhile often requires accepting collateral damage or making sacrifices.', origin: 'Attributed to various figures; the French form (On ne saurait faire une omelette sans casser des œufs) is older.' },
  { adage: "The straw that broke the camel's back", definition: 'The final small burden or irritation that causes a system, person, or situation to finally give way.', origin: 'From the fable of overloading a camel; "last straw" is a common shortening.' },
  { adage: "That's just the tip of the iceberg", definition: 'What is visible or known is only a small part of a much larger (often hidden) situation or problem.', origin: 'Early 20th century; from the fact that most of an iceberg lies underwater.' },
  { adage: 'Better to be safe than sorry', definition: 'It is wiser to take precautions than to risk harm or regret by acting carelessly.', origin: 'English proverb; caution and prudence are emphasized across cultures.' },
  { adage: "Don't bite off more than you can chew", definition: 'Do not take on more work, responsibility, or commitment than you can handle.', origin: 'American idiom; the image of taking too large a mouthful is universal.' },
  { adage: 'Barking up the wrong tree', definition: 'Pursuing a mistaken course of action or blaming or looking in the wrong place.', origin: 'From hunting with dogs that tree the wrong animal; American 19th-century origin.' },
  { adage: "It's a piece of cake", definition: 'Something is very easy to do.', origin: '20th-century American slang; possibly from the idea of a prize or treat that is easily won.' },
  { adage: 'A blessing in disguise', definition: 'Something that seems bad at first but turns out to be beneficial.', origin: '18th-century English; the idea that misfortune can hide good fortune appears in many traditions.' },
  { adage: 'Breaking the ice', definition: 'Doing or saying something to relieve tension or shyness and make people feel more comfortable.', origin: 'From the literal breaking of ice to allow ships to pass; used socially by the 17th century.' },
  { adage: 'Kill two birds with one stone', definition: 'Achieve two goals with a single action or effort.', origin: 'Earliest in English in the 17th century; similar sayings exist in other languages.' },
  { adage: 'Steal my thunder', definition: 'To take credit for someone else\'s idea or to upstage them, especially by doing something they had planned.', origin: 'From the playwright John Dennis (early 18th century), whose thunder effect was copied.' },
  { adage: 'Cry over spilled milk', definition: 'To waste time or emotion regretting something that has already happened and cannot be changed.', origin: '17th-century English; "no use crying over spilled milk" is the full form.' },
  { adage: 'Speak of the devil', definition: 'Used when someone you have just been talking about appears unexpectedly.', origin: 'Short for "Speak of the devil and he shall appear"; English proverb.' },
  { adage: 'Once in a blue moon', definition: 'Very rarely; almost never.', origin: 'A "blue moon" is sometimes defined as a second full moon in a calendar month; the phrase means "very seldom."' },
  { adage: 'Yanking my chain', definition: 'Teasing me, fooling me, or deliberately trying to annoy or provoke me.', origin: 'American slang; from the idea of pulling a chain to control or irritate someone.' },
  { adage: 'Grinding my gears', definition: 'Really annoying or frustrating me.', origin: 'American slang; from the unpleasant sound of grinding gears in a vehicle.' },
  { adage: 'I caught you red-handed', definition: 'I discovered you in the act of doing something wrong, with clear evidence.', origin: 'From the literal blood on hands after a killing; "red hand" appears in Scottish and English law.' },
  { adage: 'Two peas in a pod', definition: 'Two people or things that are very similar in appearance, behavior, or character.', origin: 'The pod holds two peas that look alike; the phrase dates to the 16th century.' },
  { adage: 'Go the extra mile', definition: 'To make more effort than is strictly required; to do more than expected.', origin: 'From the Bible (Matthew 5:41): if compelled to go one mile, go two.' },
  { adage: 'Fighting demons', definition: 'Struggling with inner troubles, addictions, or painful memories.', origin: 'Modern idiom; "demons" here means personal psychological or moral struggles.' },
  { adage: "The sky's the limit", definition: 'There is no fixed limit to what can be achieved; anything is possible.', origin: '20th-century American English; originally from aviation and ambition.' },
  { adage: 'Birds of a feather flock together', definition: 'People who are similar in character or interests tend to associate with each other.', origin: 'Old English proverb; the observation about birds is ancient.' },
  { adage: 'All good things come to those who wait', definition: 'Patience is rewarded; if you wait calmly, good outcomes will come.', origin: 'Proverb with variants in many languages; "good things come to those who wait" is common.' },
  { adage: 'Carpe Diem', definition: 'Seize the day; make the most of the present moment rather than delaying or wasting it.', origin: 'Latin phrase from the poet Horace (Odes 1.11); widely used in English.' },
  { adage: 'Cleanliness is next to godliness', definition: 'Being clean and orderly is a virtue close to moral or spiritual goodness.', origin: 'Attributed to John Wesley and earlier sources; the link between physical and moral purity is old.' },
  { adage: "Don't count your chickens before they are hatched", definition: 'Do not rely on good results before they have actually happened; avoid premature optimism.', origin: 'From Aesop\'s fable of the milkmaid and her pail; the eggs must hatch first.' },
  { adage: "Don't put your eggs all in one basket", definition: 'Do not risk everything on a single venture; diversify to reduce risk.', origin: 'Proverb found in many languages; Miguel de Cervantes used a similar image.' },
  { adage: "Don't shoot the messenger", definition: 'Do not blame or punish the person who brings bad news; they are not responsible for it.', origin: 'From the idea that messengers were sometimes killed for bearing bad tidings; ancient idea.' },
  { adage: 'A drowning man will clutch at a straw', definition: 'Someone in desperate trouble will try anything, no matter how unlikely to help.', origin: 'Proverbial; "clutch at straws" is the common shortened form.' },
  { adage: 'A journey of a thousand miles begins with a single step', definition: 'Every great undertaking starts with one small action; begin rather than waiting for perfect conditions.', origin: 'From Laozi (Lao Tzu), Tao Te Ching; widely quoted in English.' },
  { adage: 'Give a man a fish, feed him for a day; teach a man to fish and feed him for a lifetime', definition: 'Providing someone with a skill is more valuable than giving them a one-time handout.', origin: 'Proverb often attributed to Chinese or biblical sources; exact origin is debated.' },
  { adage: 'When you drink water, think of its source', definition: 'Remember and be grateful for where good things come from; do not forget your roots or benefactors.', origin: 'Chinese proverb (饮水思源); emphasizes gratitude and origin.' },
  { adage: 'Hidden dragons, crouching tigers', definition: 'Talented or dangerous people who remain out of sight until they choose to act.', origin: 'From Chinese idiom 卧虎藏龙 (crouching tiger, hidden dragon); used in martial-arts and literary contexts.' },
  { adage: 'One spoken word can never be taken back', definition: 'Once you say something, you cannot undo it; words have lasting consequences.', origin: 'Universal idea; similar sayings exist in many cultures about the irreversibility of speech.' },
  { adage: 'All things are difficult before they are easy', definition: 'Mastery requires practice; what seems hard at first becomes easier with time and effort.', origin: 'Proverbial idea in many traditions; persistence and learning are key.' },
  { adage: 'A foot is short, an inch is long', definition: 'Whether something is "enough" depends on context; small things can matter when they are what you need.', origin: 'Chinese proverb (尺有所短，寸有所长); relative value and context.' },
  { adage: 'Covering ears to steal a bell', definition: 'Foolishly thinking that hiding evidence from yourself will hide it from others; self-deception.', origin: 'From the Chinese fable of the man who covered his ears while stealing a bell (掩耳盗铃).' },
  { adage: 'Forget the fishing gear as soon as the fish is caught', definition: 'To forget the help or means that led to success once the goal is achieved; ingratitude or short memory.', origin: 'Chinese proverb (得鱼忘荃); often used about forgetting one\'s roots or helpers.' },
  { adage: 'One palm makes no applause', definition: 'Some goals require cooperation; one person alone cannot achieve everything.', origin: 'From the idea that clapping needs two hands; cooperation and teamwork.' },
  { adage: 'Scratching an itch from outside the boot', definition: 'Trying to solve a problem in a useless or superficial way that cannot possibly work.', origin: 'Chinese saying (隔靴搔痒); the solution does not reach the real problem.' },
  { adage: 'A frog in a well shaft', definition: 'Someone with a very limited view of the world who does not realize how much lies beyond their experience.', origin: 'From the Chinese idiom 井底之蛙; the frog sees only the small circle of sky above the well.' },
  { adage: 'Crows everywhere are equally black', definition: 'Evil or wrongdoing is the same everywhere; do not expect different behavior from the same kind of thing.', origin: 'Chinese proverb (天下乌鸦一般黑); universal nature of certain traits.' },
  { adage: 'Dream different dreams on the same bed', definition: 'People who share a situation can have completely different goals or views; outward unity can hide inner divergence.', origin: 'Chinese saying (同床异梦); often used of partners or allies who are not truly aligned.' },
  { adage: 'No wind, no waves', definition: 'Without a cause, there is no effect; trouble or change does not come from nowhere.', origin: 'Chinese proverb (无风不起浪); every effect has a source.' },
  { adage: 'A thief calls, "stop thief"', definition: 'A guilty party tries to deflect blame by accusing others or drawing attention away from themselves.', origin: 'Chinese saying (贼喊捉贼); hypocrisy and deflection.' },
  { adage: 'Laugh, and the world laughs with you. Weep, and you weep alone.', definition: 'In good times people join you; in sorrow you are often left to face it by yourself.', origin: 'From the poem "Solitude" by Ella Wheeler Wilcox (1883); often misattributed to others.' },
]

async function getAdminUser() {
  const { data: admins, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .is('deleted_at', null)
    .limit(1)
  if (error || !admins || admins.length === 0) return null
  return admins[0].id
}

async function addAdages(adminId) {
  let added = 0
  let skipped = 0
  for (const entry of ADAGE_ENTRIES) {
    const { data: existing } = await supabase
      .from('adages')
      .select('id')
      .eq('adage', entry.adage)
      .is('deleted_at', null)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const payload = {
      adage: entry.adage,
      definition: entry.definition,
      origin: entry.origin || null,
      etymology: null,
      historical_context: null,
      interpretation: null,
      modern_practicality: null,
      first_known_usage: null,
      first_known_usage_date: null,
      first_known_usage_uncertain: false,
      tags: ['archive'],
      type: 'adage',
      advisory: true,
      created_by: adminId,
      published_at: new Date().toISOString(),
    }
    const { data: adage, error } = await supabase
      .from('adages')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error(`❌ Failed to add adage: "${entry.adage.slice(0, 50)}..."`, error.message)
      continue
    }
    added++
  }
  return { added, skipped }
}

async function addEvent(adminId) {
  const title = 'AAS General Meeting'
  const eventDate = '2026-02-26T20:00:00.000Z' // 2:00 PM CST
  const endDate = '2026-02-26T21:00:00.000Z'   // 3:00 PM CST
  const description = `General meeting of the American Adages Society.

Time: 2:00 PM – 3:00 PM CST
Organization: American Adages Society (AAS)`
  const location = 'PCL, Room 5.104'

  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('title', title)
    .eq('event_date', eventDate)
    .is('deleted_at', null)
    .maybeSingle()

  if (existing) {
    console.log('⚠️  AAS General Meeting event already exists for this date. Skipping.')
    return existing.id
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      event_date: eventDate,
      end_date: endDate,
      location,
      event_type: 'other',
      created_by: adminId,
    })
    .select('id')
    .single()

  if (error) {
    console.error('❌ Failed to add event:', error.message)
    return null
  }
  console.log('✅ Added event: AAS General Meeting (February 26, 2026, 2:00 PM – 3:00 PM CST)')
  return event.id
}

async function main() {
  console.log('🚀 Adding archive adages and AAS General Meeting event...\n')
  const adminId = await getAdminUser()
  if (!adminId) console.warn('⚠️  No admin user found; created_by may be null for inserts that allow it.')

  const { added, skipped } = await addAdages(adminId)
  console.log(`\n📝 Adages: ${added} added, ${skipped} already present (exact match).`)

  await addEvent(adminId)

  console.log('\n✅ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
