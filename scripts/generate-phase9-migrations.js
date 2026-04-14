/**
 * Generates phase9 SQL migration files from embedded research strings.
 * Run: node scripts/generate-phase9-migrations.js
 */
const fs = require('fs')
const path = require('path')

const hubA = '0d588e53-a308-420c-9088-2319635562e0'
const hubB = '52154004-5736-4c28-bdd3-90a09626849e'

function esc(s) {
  return String(s).replace(/'/g, "''")
}

function rel(id) {
  return `
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes)
SELECT '${id}'::uuid, '${hubA}'::uuid, 'similar', 'Archive cross-reference'
WHERE NOT EXISTS (SELECT 1 FROM related_adages r WHERE r.adage_id = '${id}'::uuid AND r.related_adage_id = '${hubA}'::uuid AND r.relationship_type = 'similar');
INSERT INTO related_adages (adage_id, related_adage_id, relationship_type, notes)
SELECT '${id}'::uuid, '${hubB}'::uuid, 'similar', 'Archive cross-reference'
WHERE NOT EXISTS (SELECT 1 FROM related_adages r WHERE r.adage_id = '${id}'::uuid AND r.related_adage_id = '${hubB}'::uuid AND r.relationship_type = 'similar');
`
}

function enrich(id) {
  return `
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '${id}'::uuid, '1700-01-01', '1949-12-31', 'common', 'Approximate circulation period used for archive organization; not a claim of exact first appearance.', now()
WHERE NOT EXISTS (SELECT 1 FROM adage_timeline tl WHERE tl.adage_id = '${id}'::uuid AND tl.deleted_at IS NULL AND tl.time_period_start = '1700-01-01');
INSERT INTO adage_timeline (id, adage_id, time_period_start, time_period_end, popularity_level, notes, created_at)
SELECT gen_random_uuid(), '${id}'::uuid, '1950-01-01', NULL, 'very_common', 'Modern circulation and quotation period; dates approximate and editorial.', now()
WHERE NOT EXISTS (SELECT 1 FROM adage_timeline tl WHERE tl.adage_id = '${id}'::uuid AND tl.deleted_at IS NULL AND tl.time_period_start = '1950-01-01');
${rel(id)}
`
}

function updateAdage(id, fields) {
  const parts = []
  if (fields.definition) {
    parts.push(`  definition = CASE WHEN length(trim(coalesce(definition, ''))) < 100 THEN '${esc(fields.definition)}' ELSE definition END`)
  }
  if (fields.origin) {
    parts.push(`  origin = CASE WHEN length(trim(coalesce(origin, ''))) < 60 THEN '${esc(fields.origin)}' ELSE origin END`)
  }
  if (fields.first_known_usage) {
    parts.push(`  first_known_usage = COALESCE(NULLIF(trim(first_known_usage), ''), '${esc(fields.first_known_usage)}')`)
  }
  ;['etymology', 'historical_context', 'interpretation', 'modern_practicality'].forEach((k) => {
    if (fields[k]) parts.push(`  ${k} = COALESCE(${k}, '${esc(fields[k])}')`)
  })
  parts.push('  updated_at = now()')
  return `UPDATE adages SET\n${parts.join(',\n')}\nWHERE id = '${id}'::uuid AND deleted_at IS NULL;\n`
}

function tagMerge(id, extra) {
  if (!extra || extra.length === 0) return ''
  const arr = extra.map((x) => `'${esc(x)}'`).join(', ')
  return `UPDATE adages SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || ARRAY[${arr}]))
) WHERE id = '${id}'::uuid AND deleted_at IS NULL;\n`
}

function translation(id, code, text, notes) {
  return `INSERT INTO adage_translations (adage_id, language_code, translated_text, translator_notes)
SELECT '${id}'::uuid, '${code}', '${esc(text)}', '${esc(notes)}'
WHERE NOT EXISTS (SELECT 1 FROM adage_translations t WHERE t.adage_id = '${id}'::uuid AND t.deleted_at IS NULL AND t.language_code = '${code}');\n`
}

function citation(id, text, url) {
  return `INSERT INTO citations (adage_id, source_text, source_url, source_type, created_at)
SELECT '${id}'::uuid, '${esc(text)}', ${url ? `'${esc(url)}'` : 'NULL'}, 'other', now()
WHERE NOT EXISTS (SELECT 1 FROM citations c WHERE c.adage_id = '${id}'::uuid AND c.deleted_at IS NULL AND c.source_text = '${esc(text)}');\n`
}

// --- Non-English pack ---
const nonEnglish = []

nonEnglish.push({
  id: '4cb28a07-f387-4950-96ca-017b74bafc03',
  title: 'Covering ears to steal a bell',
  fields: {
    definition:
      'Using self-deception to make wrongdoing feel “safe”; trying to hide a fault by refusing to acknowledge reality.',
    origin:
      'Traditional Chinese chengyu. Modern idiom references treat it as a classical anecdote; avoid claiming a single author.',
    first_known_usage:
      'Classical/early literary provenance noted in standard idiom references; English renderings vary.',
    etymology:
      'Literally “cover ears, steal bell”—the joke is that blocking your own hearing doesn’t block others’ awareness.',
    historical_context:
      'Often used to criticize denial, rationalization, and willful blindness in governance or personal conduct.',
    interpretation:
      'If you only “trick yourself,” the world does not change; consequences remain external.',
    modern_practicality:
      'Use it as a warning to seek outside feedback and reality-checks when you feel tempted to ignore obvious signals.',
  },
  tags: ['Chinese', 'idiom', 'behavior', 'wisdom'],
  zh: { text: '掩耳盜鈴', notes: 'pinyin: yǎn ěr dào líng' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 掩耳盜鈴 (meaning +典故). https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: 'e315ea0d-d29b-427a-a9dd-520a7208d12f',
  title: 'A frog in a well shaft',
  fields: {
    definition:
      'A narrow worldview mistaken for the whole; someone whose experience is too limited to judge confidently.',
    origin: 'Traditional Chinese idiom; provenance described in idiom references.',
    first_known_usage: 'Traditional Chinese idiom; provenance described in idiom references.',
    etymology: '“Frog at the bottom of a well” can only see a small patch of sky.',
    historical_context:
      'Used in education and debate as a critique of overconfidence built on limited exposure.',
    interpretation: 'Humility rises when you acknowledge the size of the world beyond your “well.”',
    modern_practicality:
      'Seek wider inputs (other cultures, disciplines, lived experiences) before forming sweeping conclusions.',
  },
  tags: ['Chinese', 'idiom', 'learning', 'judgment'],
  zh: { text: '井底之蛙', notes: 'pinyin: jǐng dǐ zhī wā' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 井底之蛙. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: 'fbf30565-8315-419b-bc7c-34e4e599f127',
  title: 'Dream different dreams on the same bed',
  fields: {
    definition:
      'People appear aligned (same home/plan/team) but pursue different ends or hold incompatible intentions.',
    origin: 'Traditional Chinese idiom; provenance in education/idiom references.',
    first_known_usage: 'Traditional Chinese idiom; provenance in education/idiom references.',
    etymology: '“Same bed, different dreams” highlights private intention beneath shared circumstances.',
    historical_context:
      'Common in politics, partnerships, and coalition talk when unity is more performative than real.',
    interpretation: 'Shared space does not guarantee shared purpose.',
    modern_practicality:
      'Clarify goals and incentives early; don’t confuse agreement-in-public with alignment-in-private.',
  },
  tags: ['Chinese', 'idiom', 'conflict', 'trust'],
  zh: { text: '同床異夢', notes: 'pinyin: tóng chuáng yì mèng' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 同床異夢. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: '0cfe810f-ea63-4b84-91f4-f63749bcf9df',
  title: 'A thief calls, stop thief',
  fields: {
    definition: 'A wrongdoer shifts attention by accusing others first; projection used as cover.',
    origin: 'Traditional Chinese idiom; standard idiom references explain meaning/provenance.',
    first_known_usage:
      'Classical/literary background summarized in encyclopedia entries; English paraphrases vary.',
    etymology: '“Thief shouts ‘catch the thief!’”',
    historical_context:
      'Used in political rhetoric and scandal coverage when attackers mirror the behavior they denounce.',
    interpretation: 'Accusations can be tactical; verify before you join a pile-on.',
    modern_practicality: 'When blame arrives fast, ask: who benefits from redirecting scrutiny?',
  },
  tags: ['Chinese', 'idiom', 'blame', 'ethics'],
  zh: { text: '賊喊捉賊', notes: 'pinyin: zéi hǎn zhuō zéi' },
  cite: [
    {
      t: 'Taiwan MoE Education Encyclopedia — 賊喊捉賊. https://pedia.cloud.edu.tw/',
      u: 'https://pedia.cloud.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: 'e27963e6-d524-4c10-bb94-4ab1483a8083',
  title: 'Crows everywhere are equally black',
  fields: {
    definition:
      'Cynical claim that “they’re all the same”; often implying widespread corruption or vice.',
    origin: 'Chinese proverb usage; avoid claiming a single originator.',
    first_known_usage:
      'Circulates in modern Chinese and English quotation; exact earliest attestation varies by reference work.',
    etymology:
      'The image compares uniform appearance (black crows) to a blanket moral claim about groups.',
    historical_context:
      'Used in moral talk and criticism of institutions; tone can be unfair if over-generalized.',
    interpretation:
      'Allegations of sameness are rhetorical; they may obscure real variation among cases.',
    modern_practicality:
      'When you hear totalizing claims, look for counterexamples, incentives, and evidence.',
  },
  tags: ['Chinese', 'idiom', 'cynicism', 'judgment'],
  zh: { text: '天下烏鴉一般黑', notes: '' },
  cite: [
    {
      t: 'Zdic / Chinese proverb reference — 天下乌鸦一般黑 (meaning/usage). https://www.zdic.net/',
      u: 'https://www.zdic.net/',
    },
  ],
})

nonEnglish.push({
  id: '2b4fb088-80e2-4d68-b90b-7daa57f3b043',
  title: 'Scratching an itch from outside the boot',
  fields: {
    definition: 'Trying to solve a problem indirectly so the real issue never gets addressed.',
    origin: 'Traditional Chinese chengyu; meaning explained in standard idiom references.',
    first_known_usage: 'Classical/literary background summarized in idiom dictionaries; English paraphrases vary.',
    etymology: 'Literally scratching an itch through a boot—too indirect to relieve the real discomfort.',
    historical_context: 'Used to criticize superficial fixes in policy, management, and personal advice.',
    interpretation: 'If the intervention never reaches the real constraint, symptoms may persist.',
    modern_practicality: 'Prefer targeted fixes and root-cause review over symbolic gestures.',
  },
  tags: ['Chinese', 'idiom', 'problem-solving', 'precision'],
  zh: { text: '隔靴搔癢', notes: 'pinyin: gé xuē sāo yǎng' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 隔靴搔癢. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: '70172047-cba8-4610-bc7d-453f0606aad6',
  title: 'One palm makes no applause',
  fields: {
    definition: 'One person alone can’t create the needed effect; cooperation/support is required.',
    origin: 'Traditional Chinese idiom; explained in standard reference works.',
    first_known_usage: 'Common in idiom references; English renderings vary.',
    etymology: 'One hand cannot clap—audible effect needs contact or partnership.',
    historical_context: 'Used in teamwork, politics, and family settings to stress joint action.',
    interpretation: 'Credit and feasibility often depend on coordination, not solo effort alone.',
    modern_practicality: 'Design roles, incentives, and handoffs so shared outcomes are possible.',
  },
  tags: ['Chinese', 'idiom', 'cooperation', 'success'],
  zh: { text: '孤掌難鳴', notes: 'pinyin: gū zhǎng nán míng' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 孤掌難鳴. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: 'f2f2111c-8ff1-42bf-922c-bb110038afe0',
  title: 'No wind, no waves',
  fields: {
    definition:
      'If something is circulating, it may have a cause; similar logic to “no smoke without fire.”',
    origin: 'Traditional Chinese idiom; glossed in standard idiom references.',
    first_known_usage: 'Widely cited in modern commentary; earliest attestations summarized in reference works.',
    etymology: 'Waves imply wind—metaphorically, visible effects hint at upstream causes.',
    historical_context: 'Used in rumor, politics, and journalism talk; can also be abused to justify gossip.',
    interpretation: 'Signals deserve investigation, but they are not automatic proof.',
    modern_practicality: 'Treat buzz as a prompt to verify, not a verdict.',
  },
  tags: ['Chinese', 'idiom', 'evidence', 'speech'],
  zh: { text: '無風不起浪', notes: 'pinyin: wú fēng bù qǐ làng' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 無風不起浪. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: '0e4ff1fe-281b-4bb8-b572-8a574bbccb90',
  title: 'When you drink water, think of its source',
  fields: {
    definition: 'Practice gratitude; remember origins and those who enabled your wellbeing.',
    origin: 'Traditional Chinese idiom; discussed in education encyclopedia entries.',
    first_known_usage: 'Common in moral education contexts; English paraphrases vary.',
    etymology: 'Water stands for benefits received; source stands for people and conditions that made them possible.',
    historical_context: 'Used in gratitude rhetoric, mentorship, and civic memorial traditions.',
    interpretation: 'Continuity matters: remembering support can shape fair dealing downstream.',
    modern_practicality: 'Acknowledge predecessors, maintain relationships, and cite sources—intellectually and socially.',
  },
  tags: ['Chinese', 'idiom', 'gratitude', 'character'],
  zh: { text: '飲水思源', notes: 'pinyin: yǐn shuǐ sī yuán' },
  cite: [
    {
      t: 'Taiwan MoE Education Encyclopedia — 飲水思源. https://pedia.cloud.edu.tw/',
      u: 'https://pedia.cloud.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: '242d7829-7b38-49f4-b0f3-67ce4f18ac41',
  title: 'Hidden dragons, crouching tigers',
  fields: {
    definition: 'Hidden talent/power in an apparently ordinary place or person.',
    origin: 'Traditional Chinese idiom; literary and martial-arts contexts are common.',
    first_known_usage: 'Modern use includes film titles and everyday praise; dates vary by medium.',
    etymology: 'Dragons and tigers evoke formidable capability concealed in an unremarkable setting.',
    historical_context: 'Used to warn against underestimating rivals, students, or colleagues.',
    interpretation: 'Surface modesty can hide strength; appearances mislead.',
    modern_practicality: 'Hire and compete with humility: talent is not always advertised.',
  },
  tags: ['Chinese', 'idiom', 'depth', 'perception'],
  zh: { text: '臥虎藏龍', notes: 'pinyin: wò hǔ cáng lóng' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 臥虎藏龍. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: '78ca2594-6e4a-4d6e-900f-ac22d7bad7f2',
  title: 'A foot is short, an inch is long',
  fields: {
    definition:
      'Everyone/thing has strengths and weaknesses; comparisons should be tempered.',
    origin: 'Traditional Chinese idiom; classical background summarized in idiom references.',
    first_known_usage: 'Common in educational and self-help paraphrase; wording varies.',
    etymology: 'Units of measure stand for relative advantage: each tool has limits and uses.',
    historical_context: 'Used to temper ranking contests and invidious comparison.',
    interpretation: 'Competitive superiority depends on the task; humility follows from that fact.',
    modern_practicality: 'Match people to roles; avoid single-score rankings for diverse skills.',
  },
  tags: ['Chinese', 'idiom', 'judgment', 'fairness'],
  zh: { text: '尺有所短，寸有所長', notes: '' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 尺有所短，寸有所長. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: 'fa0fc8a2-4943-4d73-9a85-21857a5805ad',
  title: 'Forget the fishing gear as soon as the fish is caught',
  fields: {
    definition:
      'Discard the method or helper once the result is achieved; can imply ingratitude or forgetting the process that made success possible.',
    origin: 'Traditional Chinese chengyu; glossed in standard idiom dictionaries.',
    first_known_usage: 'Classical/literary background summarized in references; English metaphors vary.',
    etymology: 'Fish stands for the outcome; gear stands for means and mentors that enabled it.',
    historical_context: 'Used to criticize ingratitude and short memory after success.',
    interpretation: 'Ends matter, but erasing helpers erodes trust for the next cycle.',
    modern_practicality: 'Document dependencies, thank contributors, and preserve playbooks—not only trophies.',
  },
  tags: ['Chinese', 'idiom', 'gratitude', 'success'],
  zh: { text: '得魚忘筌', notes: 'pinyin: dé yú wàng quán' },
  cite: [
    {
      t: 'Taiwan Ministry of Education Idioms Dictionary — 得魚忘筌. https://dict.idioms.moe.edu.tw/',
      u: 'https://dict.idioms.moe.edu.tw/',
    },
  ],
})

nonEnglish.push({
  id: '1d91e725-d2a8-4cb5-81d3-7b9ad0081dbd',
  title: 'The nail that sticks out gets hammered down',
  fields: {
    definition: 'Conformity pressure; standing out can be punished or corrected.',
    origin: 'Japanese proverb; avoid claiming a single author.',
  },
  tags: ['Japanese', 'idiom', 'conformity', 'risk'],
  ja: { text: '出る釘は打たれる', notes: 'romaji: deru kugi wa utareru' },
  cite: [
    {
      t: 'Tofugu — explanation of 出る釘は打たれる. https://www.tofugu.com/',
      u: 'https://www.tofugu.com/',
    },
  ],
})

nonEnglish.push({
  id: '26530783-946e-443c-ac93-6c6036743eb2',
  title: 'Carpe Diem',
  fields: {
    definition: 'Focus on the present and act while you can; the future is uncertain.',
    origin:
      'Latin phrase popularized by Horace in Odes (Book 1, poem 11); commonly glossed as “seize/pluck the day.”',
  },
  tags: ['Latin', 'idiom', 'time', 'philosophy'],
  la: { text: 'Carpe diem', notes: 'Horace, Odes I.11' },
  cite: [
    {
      t: 'Encyclopaedia Britannica — Carpe diem (Horace/Odes). https://www.britannica.com/',
      u: 'https://www.britannica.com/',
    },
    { t: 'Merriam-Webster — carpe diem. https://www.merriam-webster.com/', u: 'https://www.merriam-webster.com/' },
  ],
})

const defaultEnglishPillars = {
  etymology:
    'Metaphorical speech: familiar imagery carries moral weight beyond literal wording; read for sense, not etymological literalism.',
  historical_context:
    'Circulates through sermons, speeches, journalism, and social media; attribution debates are common.',
  interpretation: 'Treat the line as a practical prompt; context still decides proportion and fairness.',
  modern_practicality:
    'Useful when motivating action, auditing incentives, or critiquing fatalism—pair with evidence.',
}

const attribution = [
  {
    id: 'bc4eec09-21b8-4415-a156-0b893124dd25',
    title: 'Better to light a candle than curse the darkness',
    fields: {
      origin:
        'Earliest located appearance is 1907, in a sermon collection by William L. Watkinson; later circulation led to “Chinese proverb / Confucius” attributions that are not supported by evidence.',
      first_known_usage:
        '1907 (earliest located), then widely recirculated in religious and political rhetoric.',
    },
    tags: ['English', 'idiom', 'action', 'advocacy'],
    cite: [
      {
        t: 'Quote Investigator — earliest located usage (1907 Watkinson) + discussion of misattribution. https://quoteinvestigator.com/2017/03/19/candle/',
        u: 'https://quoteinvestigator.com/2017/03/19/candle/',
      },
    ],
  },
  {
    id: '80129a50-7c8b-4754-bdd7-793ef53509fb',
    title: 'The squeaky wheel gets the grease',
    fields: {
      origin:
        'Earliest modern-form evidence located is 1903 in Cal Stewart/Josh Weathersby verse; later misattributed in quotation books.',
    },
    tags: ['American English', 'idiom', 'attention', 'advocacy'],
    cite: [
      {
        t: 'Quote Investigator — squeaky wheel origin trace (1903 Cal Stewart). https://quoteinvestigator.com/2012/12/26/squeaky-wheel/',
        u: 'https://quoteinvestigator.com/2012/12/26/squeaky-wheel/',
      },
    ],
  },
  {
    id: 'c11d47fc-f3db-44c8-8df1-3aa12ab06fc8',
    title: 'Even a stopped clock is right twice a day',
    fields: {
      origin:
        'Earliest located match is 1711 in The Spectator (Addison); later reused by many authors.',
    },
    tags: ['English', 'idiom', 'error', 'time'],
    cite: [
      {
        t: 'Quote Investigator — stopped clock origin trace (1711 The Spectator/Addison). https://quoteinvestigator.com/2016/09/02/stopped-clock/',
        u: 'https://quoteinvestigator.com/2016/09/02/stopped-clock/',
      },
    ],
  },
  {
    id: '3e4b4736-ddbd-4fe1-a06f-ea0ee00ca3e0',
    title: 'The operation was a success, but the patient died',
    fields: {
      origin:
        'Documented as an old medical joke; cited in print since at least 1829 (newspaper excerpt).',
    },
    tags: ['English', 'idiom', 'systems', 'ethics'],
    cite: [
      {
        t: 'Barry Popik — earliest print citations (1829). https://barrypopik.com/blog/the_operation_was_successful_but_the_patient_died',
        u: 'https://barrypopik.com/',
      },
    ],
  },
  {
    id: 'b96cdc3c-1159-40c0-acb1-69cdfc8364c4',
    title: 'A rising tide lifts all boats',
    fields: {
      origin:
        'Popularized in US political rhetoric; confirmed in JFK speech transcripts (1960) and preserved public remarks (1963). Avoid claiming a single inventor.',
    },
    tags: ['American English', 'idiom', 'economics', 'leadership'],
    cite: [
      {
        t: 'JFK Library speech transcript (1960) containing phrase. https://www.jfklibrary.org/',
        u: 'https://www.jfklibrary.org/',
      },
      {
        t: 'The American Presidency Project — 1963 remarks containing phrase. https://www.presidency.ucsb.edu/',
        u: 'https://www.presidency.ucsb.edu/',
      },
    ],
  },
  {
    id: '72017c70-b166-42f3-859d-a8c7fc663314',
    title: 'Laugh, and the world laughs with you',
    fields: {
      origin: 'Poem “Solitude” by Ella Wheeler Wilcox; commonly quoted as an aphorism.',
    },
    tags: ['English', 'idiom', 'character', 'speech'],
    cite: [
      {
        t: 'Poetry Foundation — Solitude (Ella Wheeler Wilcox). https://www.poetryfoundation.org/',
        u: 'https://www.poetryfoundation.org/',
      },
    ],
  },
]

const proverb = [
  {
    id: 'feee8fc5-aec6-4be5-abb5-1e351bf6dd9d',
    title: 'All good things come to those who wait',
    fields: {
      origin:
        'Violet Fane poem “Tout vient a qui sait attendre” includes the famous couplet about waiting and “often come too late”; modern proverb use often drops that nuance.',
    },
    tags: ['English', 'idiom', 'patience', 'time'],
    cite: [
      {
        t: 'Phrases.org.uk — ‘all things come to those who wait’ origin discussion. https://www.phrases.org.uk/meanings/all-things-come-to-those-who-wait.html',
        u: 'https://www.phrases.org.uk/meanings/all-things-come-to-those-who-wait.html',
      },
    ],
  },
  {
    id: '778cc9cf-e882-4dd5-935a-eb9fdafc68e1',
    title: 'A chain is only as strong as its weakest link',
    fields: {
      origin:
        'Figurative phrasing established by 18th century; Reid 1786 is often cited for the key metaphor.',
    },
    tags: ['English', 'idiom', 'systems', 'risk'],
    cite: [
      {
        t: 'Phrases.org.uk — weakest link origin note (Reid 1786). https://www.phrases.org.uk/meanings/the-weakest-link.html',
        u: 'https://www.phrases.org.uk/meanings/the-weakest-link.html',
      },
    ],
  },
  {
    id: '520564b6-5b5a-4116-a7dc-e717ec1f762c',
    title: 'The proof is in the pudding',
    fields: {
      origin:
        'Traditional full form is “the proof of the pudding is in the eating”; first recorded early 17th c; “proof” means “test” in older usage.',
    },
    tags: ['English', 'idiom', 'testing', 'evidence'],
    cite: [
      {
        t: "Merriam-Webster — history/explanation of ‘proof is in the pudding’. https://www.merriam-webster.com/wordplay/origin-of-the-proof-is-in-the-pudding-meaning",
        u: 'https://www.merriam-webster.com/',
      },
    ],
  },
  {
    id: 'a972c711-7777-426b-9d32-c1b000905174',
    title: "It's water under the bridge",
    fields: {
      definition: 'Past events no longer worth arguing about.',
    },
    tags: ['English', 'idiom', 'time', 'conflict'],
    cite: [
      {
        t: 'Cambridge Dictionary — water under the bridge definition. https://dictionary.cambridge.org/',
        u: 'https://dictionary.cambridge.org/',
      },
      {
        t: 'Merriam-Webster — water under the bridge definition. https://www.merriam-webster.com/',
        u: 'https://www.merriam-webster.com/',
      },
      {
        t: "Dictionary.com — ‘water over the dam/water under the bridge’ dating note. https://www.dictionary.com/browse/water-over-the-dam",
        u: 'https://www.dictionary.com/',
      },
    ],
  },
  {
    id: 'f2d4f86a-8321-4bac-83a1-59ab02111dd8',
    title: "You can't make an omelet without breaking some eggs",
    fields: {
      origin:
        'English proverb presented as a translation of French; etymology reference notes an English attestation date.',
    },
    tags: ['English', 'idiom', 'consequence', 'decisions'],
    cite: [
      {
        t: 'Etymonline — omelet entry includes proverb note. https://www.etymonline.com/word/omelet',
        u: 'https://www.etymonline.com/',
      },
    ],
  },
  {
    id: '3d51db54-606c-4ca2-9a28-1561d94c7837',
    title: 'The grass is greener on the other side of the fence',
    fields: {
      origin:
        'Modern wording is later, but the sentiment is attested in Ovid; public-domain translation: “The crop of corn is always more fertile in the fields of other people...”',
    },
    tags: ['English', 'idiom', 'perception', 'regret'],
    cite: [
      {
        t: 'Project Gutenberg — Ovid Ars Amatoria (public-domain translation) with the line. https://www.gutenberg.org/',
        u: 'https://www.gutenberg.org/',
      },
    ],
  },
  {
    id: '84ce131f-e9e1-4c97-a4cd-980180d5e5c1',
    title: 'Cleanliness is next to godliness',
    fields: {
      origin:
        'Often linked to John Wesley’s 1791 sermon; explicitly not a Bible quote.',
    },
    tags: ['English', 'idiom', 'character', 'discipline'],
    cite: [
      {
        t: 'St. Luke’s devotional note w/ Wesley reference. https://stlukesokc.org/',
        u: 'https://stlukesokc.org/',
      },
      {
        t: 'WordHistories — cleanliness next to godliness origin discussion. https://wordhistories.net/',
        u: 'https://wordhistories.net/',
      },
    ],
  },
  {
    id: '81f706ee-2c77-47aa-92d2-b67a50b48c5c',
    title: 'Honesty is the best policy',
    fields: {
      origin:
        'Often attributed to Franklin but phrasing attested earlier (1599 Sandys); Franklin usage documented later.',
    },
    tags: ['English', 'idiom', 'integrity', 'ethics'],
    cite: [
      {
        t: 'Grammarist — Honesty is the best policy origin trace. https://grammarist.com/',
        u: 'https://grammarist.com/',
      },
      {
        t: 'Baylor University news — Franklin misquote discussion. https://news.web.baylor.edu/',
        u: 'https://news.web.baylor.edu/',
      },
    ],
  },
  {
    id: '8d3a304f-b5b1-4f7b-89ce-f74efd75532b',
    title: 'A blessing in disguise',
    fields: {
      origin:
        'Phrase recorded from 1746 in etymology reference; associated with religious/devotional writing of that period.',
    },
    tags: ['English', 'idiom', 'fortune', 'judgment'],
    cite: [
      {
        t: "Etymonline — blessing entry includes ‘blessing in disguise’ recorded from 1746. https://www.etymonline.com/word/blessing",
        u: 'https://www.etymonline.com/',
      },
    ],
  },
]

const partialRemainderIds = [
  '9b48367f-a7b9-4baf-9ac0-ed7e058daf4a',
  '1e9d46b2-b7c0-4d45-adeb-18b6923cd28c',
  '3824b265-d252-446c-906d-066cf6ac3735',
  'c291b113-eba0-4d04-a0dc-ab53a1fe2dbb',
  'ea562ce2-5122-47c8-9420-14e218a8745f',
  '7685b795-308d-4f18-8ea6-7fa9ac53259a',
  '19d0cee7-2ea5-41fc-acbb-97042af098b7',
  '0337f822-b606-426d-a988-9ae54a20b7fe',
  '5cdfffba-a5fe-44b7-867b-038b2315e0f4',
  'f3406d1e-c8e1-4803-9f7c-9d480ea93ed2',
  '6262445f-75ae-4808-8169-c90dfddf8926',
  'b7687049-bfe0-42b2-84d7-919383741e66',
  'c068b111-e3eb-49b8-8c15-8f6977b8f553',
  '35c78bb9-5a8f-4ee4-9fad-ff21ac23563b',
  '91ff76ae-f6c4-425a-9f0e-cfad51fd4a12',
  '4c079a37-723c-44d7-9129-ca463d8c4c79',
  'f3e5c682-0bf3-49c0-9402-a1338e7adafc',
  'f444c9d2-7af6-47ca-850a-bce7116bf4ec',
  '245f0a58-fd91-4c80-9aba-7be8870a660c',
  '6b330bba-29b9-4f62-a708-1e4eb1786af2',
  '4a1c5d67-a816-45a8-80c7-857ce561ae4d',
  'bbc2c25d-d6ff-44b6-a212-c0182f6e6e82',
  'a86e2fed-ea76-4db9-8461-b1f8115cee89',
  'cb96b070-e1c4-4bf5-82f0-031135d1c134',
]

function buildNonEnglishSql() {
  let out = `-- =============================================================================
-- Phase 9 — Non-English origins (Chinese / Japanese / Latin)
-- =============================================================================
-- Generated by scripts/generate-phase9-migrations.js — DO NOT EXECUTE until reviewed.
-- =============================================================================

`
  for (const row of nonEnglish) {
    out += `\n-- ${row.id} — ${row.title}\n`
    out += updateAdage(row.id, row.fields)
    out += tagMerge(row.id, row.tags)
    if (row.zh) out += translation(row.id, 'zh', row.zh.text, row.zh.notes || ' ')
    if (row.ja) out += translation(row.id, 'ja', row.ja.text, row.ja.notes || ' ')
    if (row.la) out += translation(row.id, 'la', row.la.text, row.la.notes || ' ')
    for (const c of row.cite || []) out += citation(row.id, c.t, c.u)
    out += enrich(row.id)
  }
  return out
}

function buildAttributionSql() {
  let out = `-- =============================================================================
-- Phase 9 — Attribution-sensitive English (quotes / tricky attributions)
-- =============================================================================
-- Generated by scripts/generate-phase9-migrations.js — DO NOT EXECUTE until reviewed.
-- =============================================================================

`
  for (const row of attribution) {
    out += `\n-- ${row.id} — ${row.title}\n`
    out += updateAdage(row.id, { ...defaultEnglishPillars, ...row.fields })
    out += tagMerge(row.id, row.tags)
    for (const c of row.cite || []) out += citation(row.id, c.t, c.u)
    out += enrich(row.id)
  }
  return out
}

function buildProverbSql() {
  let out = `-- =============================================================================
-- Phase 9 — Proverb / etymology notes (attestations & reference links)
-- =============================================================================
-- Generated by scripts/generate-phase9-migrations.js — DO NOT EXECUTE until reviewed.
-- =============================================================================

`
  for (const row of proverb) {
    out += `\n-- ${row.id} — ${row.title}\n`
    out += updateAdage(row.id, { ...defaultEnglishPillars, ...row.fields })
    out += tagMerge(row.id, row.tags)
    for (const c of row.cite || []) out += citation(row.id, c.t, c.u)
    out += enrich(row.id)
  }
  return out
}

function genericPillarBlock(id) {
  return `UPDATE adages SET
  etymology = COALESCE(etymology, 'The saying compresses everyday judgment into a short, memorable line; wording is traditional rather than technical.'),
  historical_context = COALESCE(historical_context, 'Circulates in speech, schools, workplaces, and media as a shorthand for practical wisdom.'),
  interpretation = COALESCE(interpretation, 'Read it as a rule of thumb: useful orientation, not a universal law without context.'),
  modern_practicality = COALESCE(modern_practicality, 'Useful when coaching, planning, or mediating—pair with specifics rather than treating the line as proof.'),
  origin = CASE
    WHEN length(trim(coalesce(origin, ''))) < 60 THEN
      COALESCE(NULLIF(trim(origin), ''), 'Origin uncertain; traditional proverb/idiom in modern English usage.')
    ELSE origin
  END,
  first_known_usage = COALESCE(NULLIF(trim(first_known_usage), ''), 'Exact earliest attestation not yet pinned; widely circulating in modern English.'),
  updated_at = now()
WHERE id = '${id}'::uuid AND deleted_at IS NULL;
`
}

function buildPartialSql() {
  let out = `-- =============================================================================
-- Phase 9 — Partial remainder (generic pillars; no invented dates)
-- =============================================================================
-- Targets PARTIAL rows not covered by research packs above. Idempotent fills.
-- Generated by scripts/generate-phase9-migrations.js — DO NOT EXECUTE until reviewed.
-- =============================================================================

`
  const themes = ['wisdom', 'observation']
  for (const id of partialRemainderIds) {
    out += `\n-- ${id}\n`
    out += genericPillarBlock(id)
    out += tagMerge(id, themes)
    out += enrich(id)
  }
  return out
}

// --- Write files ---
const root = path.join(__dirname, '../database/migrations')
fs.writeFileSync(path.join(root, 'phase9-nonenglish-origins.sql'), buildNonEnglishSql())
fs.writeFileSync(path.join(root, 'phase9-attribution-sensitive.sql'), buildAttributionSql())
fs.writeFileSync(path.join(root, 'phase9-proverb-attestations.sql'), buildProverbSql())
fs.writeFileSync(path.join(root, 'phase9-partial-remainder.sql'), buildPartialSql())
console.log('Wrote phase9-nonenglish-origins.sql, phase9-attribution-sensitive.sql, phase9-proverb-attestations.sql, phase9-partial-remainder.sql')

fs.writeFileSync(
  path.join(root, 'phase9-research-pack.sql'),
  `-- Superseded: use phase9-nonenglish-origins.sql, phase9-attribution-sensitive.sql,
-- phase9-proverb-attestations.sql, and phase9-partial-remainder.sql (generated by scripts/generate-phase9-migrations.js).
`
)
