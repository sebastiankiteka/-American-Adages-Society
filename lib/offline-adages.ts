import { Adage } from '@/lib/db-types'

export type OfflineAdageDetail = Adage & {
  score: number
  save_count: number
  userVote: null
  featured_reason: string | null
  featured_from: string | null
  featured_dates: { featured_from: string; featured_until?: string | null; reason?: string | null }[]
  variants: {
    id: string
    adage_id: string
    variant_text: string
    notes?: string
    created_at: string
    updated_at: string
  }[]
  translations: {
    id: string
    adage_id: string
    language_code: string
    translated_text: string
    translator_notes?: string
    created_at: string
    updated_at: string
  }[]
  related: {
    id: string
    adage_id: string
    related_adage_id: string
    relationship_type?: string
    related_adage?: Pick<Adage, 'id' | 'adage' | 'definition'>
  }[]
  usageExamples: {
    id: string
    adage_id: string
    example_text: string
    context?: string
    source_type?: string
    created_at: string
  }[]
  timeline: {
    id: string
    adage_id: string
    time_period_start: string
    time_period_end?: string | null
    popularity_level?: string
    primary_location?: string
    geographic_changes?: string
    notes?: string
    sources?: string[]
    created_at: string
  }[]
  comments: unknown[]
  commendations: unknown[]
  citations: unknown[]
}

const NOW = '2026-01-15T12:00:00.000Z'
const FEATURED_FROM = '2026-01-06T00:00:00.000Z'

function base(
  partial: Omit<Adage, 'first_known_usage_uncertain' | 'featured' | 'views_count' | 'created_at' | 'updated_at'> &
    Partial<Pick<Adage, 'first_known_usage_uncertain' | 'featured' | 'views_count' | 'created_at' | 'updated_at'>>
): Adage {
  return {
    first_known_usage_uncertain: false,
    featured: false,
    views_count: 0,
    created_at: NOW,
    updated_at: NOW,
    ...partial,
  }
}

/** Bundled archive content for offline / pre-Supabase deploys */
export const OFFLINE_ADAGES: OfflineAdageDetail[] = [
  {
    ...base({
      id: 'offline-1',
      adage: 'A penny saved is a penny earned',
      definition:
        'Saving money is as valuable as earning it. This emphasizes the importance of frugality and careful financial management.',
      origin: 'Attributed to Benjamin Franklin, 1737',
      etymology:
        'This phrase first appeared in Benjamin Franklin\'s "Poor Richard\'s Almanack" in 1737. Franklin was known for his practical wisdom about money and thrift.',
      historical_context:
        'During the 18th century, when this adage was popularized, economic stability was crucial for survival. Franklin\'s advice reflected the values of the emerging American middle class, emphasizing self-reliance and careful resource management.',
      interpretation:
        'The adage suggests that money not spent is equivalent to money earned, highlighting the value of restraint and planning. It encourages a mindset where saving is seen as an active form of earning.',
      modern_practicality:
        'In today\'s consumer-driven economy, this adage remains relevant for personal finance, encouraging people to view saving as a positive action rather than deprivation. It\'s particularly valuable for budgeting and long-term financial planning.',
      first_known_usage: 'Poor Richard\'s Almanack, 1737',
      first_known_usage_date: '1737-01-01',
      geographic_spread: 'United States; English-speaking world',
      tags: ['finance', 'wisdom', 'frugality'],
      views_count: 128,
    }),
    score: 12,
    save_count: 4,
    userVote: null,
    featured_reason: null,
    featured_from: null,
    featured_dates: [],
    variants: [
      {
        id: 'v1-1',
        adage_id: 'offline-1',
        variant_text: 'A penny saved is two pence clear',
        notes: 'Earlier Franklin-adjacent form',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    translations: [
      {
        id: 't1-1',
        adage_id: 'offline-1',
        language_code: 'es',
        translated_text: 'Un centavo ahorrado es un centavo ganado',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    related: [],
    usageExamples: [
      {
        id: 'u1-1',
        adage_id: 'offline-1',
        example_text: 'Skip the impulse buy—a penny saved is a penny earned.',
        context: 'Personal finance tip',
        source_type: 'official',
        created_at: NOW,
      },
    ],
    timeline: [
      {
        id: 'tl1-1',
        adage_id: 'offline-1',
        time_period_start: '1737-01-01',
        time_period_end: '1900-12-31',
        popularity_level: 'common',
        primary_location: 'Colonial and early United States',
        notes: 'Popularized through Franklin\'s almanacs',
        sources: ['Poor Richard\'s Almanack'],
        created_at: NOW,
      },
      {
        id: 'tl1-2',
        adage_id: 'offline-1',
        time_period_start: '1900-01-01',
        time_period_end: null,
        popularity_level: 'very_common',
        primary_location: 'English-speaking world',
        notes: 'Standard schoolroom and household proverb',
        sources: ['Modern usage'],
        created_at: NOW,
      },
    ],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-2',
      adage: 'Actions speak louder than words',
      definition:
        'What people do is more important than what they say. Deeds demonstrate true intentions and character.',
      origin: 'English proverb, 17th century',
      etymology:
        'Traced to various early modern English sources; the concept emphasizes observable behavior over verbal promises.',
      historical_context:
        'The phrase gained prominence when trust and reliability were essential for social cohesion. It reflects a practical approach to evaluating character and commitment.',
      interpretation:
        'Behavior is a more reliable indicator of character and intentions than verbal expressions. Look beyond rhetoric to assess true commitment.',
      modern_practicality:
        'Crucial for evaluating leadership, relationships, and organizational culture—judge people and institutions by actions rather than marketing or promises.',
      first_known_usage: 'English, 17th century',
      first_known_usage_date: '1628-01-01',
      first_known_usage_uncertain: true,
      geographic_spread: 'English-speaking world; parallels in many languages',
      tags: ['character', 'behavior', 'wisdom', 'leadership'],
      featured: true,
      views_count: 256,
    }),
    score: 24,
    save_count: 11,
    userVote: null,
    featured_reason: 'Weekly featured adage — offline showcase',
    featured_from: FEATURED_FROM,
    featured_dates: [
      {
        featured_from: FEATURED_FROM,
        featured_until: null,
        reason: 'Weekly featured adage — offline showcase',
      },
    ],
    variants: [],
    translations: [
      {
        id: 't2-1',
        adage_id: 'offline-2',
        language_code: 'es',
        translated_text: 'Las acciones hablan más que las palabras',
        created_at: NOW,
        updated_at: NOW,
      },
      {
        id: 't2-2',
        adage_id: 'offline-2',
        language_code: 'fr',
        translated_text: 'Les actes parlent plus fort que les mots',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    related: [],
    usageExamples: [
      {
        id: 'u2-1',
        adage_id: 'offline-2',
        example_text:
          'The board promised transparency, but closed meetings continue—actions speak louder than words.',
        context: 'Organizational culture',
        source_type: 'official',
        created_at: NOW,
      },
    ],
    timeline: [
      {
        id: 'tl2-1',
        adage_id: 'offline-2',
        time_period_start: '1600-01-01',
        time_period_end: null,
        popularity_level: 'very_common',
        primary_location: 'English-speaking world',
        notes: 'Enduring proverb of character judgment',
        sources: ['Early modern English usage'],
        created_at: NOW,
      },
    ],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-3',
      adage: 'Better late than never',
      definition:
        'It is better to do something late than to never do it at all. Encourages completion even when delayed.',
      origin: 'Geoffrey Chaucer, "The Canterbury Tales", 14th century',
      etymology:
        'Appears in Chaucer as "better than never is late"; Latin precedent "potius sero quam numquam".',
      historical_context:
        'Reflects a pragmatic approach to completion and redemption—delayed action is preferable to inaction.',
      interpretation:
        'Promotes the value of completion and persistence, even when timing is imperfect.',
      modern_practicality:
        'Encourages finishing tasks, apologizing, or making amends even if delayed—useful against perfectionism and procrastination.',
      first_known_usage: 'Chaucer / Latin antecedents',
      first_known_usage_date: '1387-01-01',
      first_known_usage_uncertain: true,
      tags: ['timing', 'completion', 'encouragement', 'persistence'],
      views_count: 94,
    }),
    score: 8,
    save_count: 3,
    userVote: null,
    featured_reason: null,
    featured_from: null,
    featured_dates: [],
    variants: [],
    translations: [],
    related: [],
    usageExamples: [],
    timeline: [],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-4',
      adage: "Don't count your chickens before they hatch",
      definition:
        "Don't make plans based on something that hasn't happened yet. Warns against premature assumptions.",
      origin: "Aesop's Fables, ancient Greece",
      etymology:
        'From Aesop\'s fable "The Milkmaid and Her Pail" (c. 600 BCE)—assuming outcomes before they occur.',
      historical_context:
        'Retold across cultures; agricultural wisdom about the uncertainty of farming applied to life and commerce.',
      interpretation:
        'Cautions against premature celebration or planning based on uncertain outcomes.',
      modern_practicality:
        'Valuable for financial planning, career decisions, and project management—favor realistic expectations.',
      first_known_usage: 'Aesop tradition; English from 16th century',
      first_known_usage_date: '1570-01-01',
      first_known_usage_uncertain: true,
      tags: ['caution', 'planning', 'wisdom'],
      views_count: 77,
    }),
    score: 6,
    save_count: 2,
    userVote: null,
    featured_reason: null,
    featured_from: null,
    featured_dates: [],
    variants: [
      {
        id: 'v4-1',
        adage_id: 'offline-4',
        variant_text: "Don't count your eggs before they are hatched",
        notes: 'Older English wording',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    translations: [],
    related: [],
    usageExamples: [],
    timeline: [],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-5',
      adage: 'The early bird catches the worm',
      definition: 'Those who act promptly and arrive first have the best chance of success.',
      origin: 'English proverb, 17th century',
      etymology:
        'Literal observation that birds who hunt early find more food; recorded in print by 1636.',
      historical_context:
        'Emerged when agricultural and commercial success depended on timing and early action.',
      interpretation:
        'Early action and preparation lead to better outcomes; emphasizes initiative.',
      modern_practicality:
        'Applies to career advancement, business opportunities, and personal productivity.',
      first_known_usage: 'English, 1636',
      first_known_usage_date: '1636-01-01',
      tags: ['timing', 'success', 'initiative', 'punctuality'],
      views_count: 141,
    }),
    score: 15,
    save_count: 5,
    userVote: null,
    featured_reason: null,
    featured_from: null,
    featured_dates: [],
    variants: [],
    translations: [],
    related: [],
    usageExamples: [],
    timeline: [],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-6',
      adage: "Where there's smoke, there's fire",
      definition:
        'If there are signs or rumors of something, there is likely some truth to it.',
      origin: 'Latin proverb, "Ubi fumus, ibi ignis"',
      etymology:
        'From Latin "Ubi fumus, ibi ignis"; used in English since at least the 15th century.',
      historical_context:
        'Used in legal, social, and political contexts to treat persistent signs as worth investigating.',
      interpretation:
        'Observable signs, patterns, or persistent rumors often indicate underlying realities—investigate rather than dismiss.',
      modern_practicality:
        'Relevant for journalism and decision-making; also a caution not to treat every rumor as proof.',
      first_known_usage: 'Medieval English / Latin antecedents',
      first_known_usage_date: '1300-01-01',
      first_known_usage_uncertain: true,
      geographic_spread: 'Europe; English-speaking world',
      tags: ['truth', 'signs', 'wisdom', 'observation'],
      views_count: 112,
    }),
    score: 10,
    save_count: 4,
    userVote: null,
    featured_reason: null,
    featured_from: null,
    featured_dates: [],
    variants: [
      {
        id: 'v6-1',
        adage_id: 'offline-6',
        variant_text: 'No smoke without fire',
        notes: 'British variant',
        created_at: NOW,
        updated_at: NOW,
      },
      {
        id: 'v6-2',
        adage_id: 'offline-6',
        variant_text: "There's no smoke without fire",
        notes: 'Fuller form',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    translations: [
      {
        id: 't6-1',
        adage_id: 'offline-6',
        language_code: 'es',
        translated_text: 'Donde hay humo, hay fuego',
        created_at: NOW,
        updated_at: NOW,
      },
      {
        id: 't6-2',
        adage_id: 'offline-6',
        language_code: 'fr',
        translated_text: "Il n'y a pas de fumée sans feu",
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    related: [],
    usageExamples: [
      {
        id: 'u6-1',
        adage_id: 'offline-6',
        example_text:
          "Everyone's been talking about the company's financial troubles. Where there's smoke, there's fire.",
        context: 'Business discussion',
        source_type: 'official',
        created_at: NOW,
      },
    ],
    timeline: [
      {
        id: 'tl6-1',
        adage_id: 'offline-6',
        time_period_start: '1300-01-01',
        time_period_end: '1800-12-31',
        popularity_level: 'uncommon',
        primary_location: 'England, Medieval Europe',
        notes: 'Legal and literary contexts',
        sources: ['Medieval English texts'],
        created_at: NOW,
      },
      {
        id: 'tl6-2',
        adage_id: 'offline-6',
        time_period_start: '1800-01-01',
        time_period_end: null,
        popularity_level: 'very_common',
        primary_location: 'English-speaking world',
        notes: 'Common modern English',
        sources: ['Modern usage'],
        created_at: NOW,
      },
    ],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-7',
      adage: "You can't have your cake and eat it too",
      definition:
        'You cannot keep something and also consume it. You cannot have something both ways; you must choose.',
      origin: "John Heywood, 1546",
      etymology:
        'Literal impossibility of possessing a cake and eating it; older order was "eat your cake and have it too."',
      historical_context:
        'Expresses that some choices are mutually exclusive—trade-offs in economics, relationships, and personal decisions.',
      interpretation:
        'Wanting contradictory outcomes is unrealistic; maturity means accepting limitations of choice.',
      modern_practicality:
        'Cited for work-life balance, finances, and priorities—effective decisions acknowledge trade-offs.',
      first_known_usage: "Heywood's Dialogue, 1546",
      first_known_usage_date: '1546-01-01',
      tags: ['wisdom', 'choice', 'impossibility'],
      views_count: 88,
    }),
    score: 9,
    save_count: 3,
    userVote: null,
    featured_reason: null,
    featured_from: null,
    featured_dates: [],
    variants: [
      {
        id: 'v7-1',
        adage_id: 'offline-7',
        variant_text: "You can't eat your cake and have it too",
        notes: 'Original word order',
        created_at: NOW,
        updated_at: NOW,
      },
      {
        id: 'v7-2',
        adage_id: 'offline-7',
        variant_text: "You can't have it both ways",
        notes: 'Modern simplified variant',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    translations: [
      {
        id: 't7-1',
        adage_id: 'offline-7',
        language_code: 'fr',
        translated_text: "On ne peut pas avoir le beurre et l'argent du beurre",
        translator_notes: 'French equivalent',
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    related: [],
    usageExamples: [
      {
        id: 'u7-1',
        adage_id: 'offline-7',
        example_text:
          'You want fewer hours and more pay? You can\'t have your cake and eat it too.',
        context: 'Work-life balance',
        source_type: 'official',
        created_at: NOW,
      },
    ],
    timeline: [],
    comments: [],
    commendations: [],
    citations: [],
  },
  {
    ...base({
      id: 'offline-8',
      adage: 'E Pluribus Unum',
      definition:
        'Out of many, one — unity formed from diversity; a founding motto of the United States.',
      origin: 'Proposed for the Great Seal of the United States, 1776',
      etymology: 'Latin: "e" (out of) + "pluribus" (many) + "unum" (one).',
      historical_context:
        'Chosen to express thirteen colonies uniting as one nation; meaning has deepened with immigration and inclusion debates.',
      interpretation:
        'Describes both a historical reality and an ongoing aspiration: building unity from difference.',
      modern_practicality:
        'Still used in civic discourse about identity, pluralism, and national belonging.',
      first_known_usage: 'Great Seal design process, 1776',
      first_known_usage_date: '1776-01-01',
      geographic_spread: 'United States (motto and currency)',
      tags: ['culture', 'history', 'philosophy', 'america'],
      featured: true,
      views_count: 190,
    }),
    score: 18,
    save_count: 7,
    userVote: null,
    featured_reason: 'Founding American motto — offline showcase',
    featured_from: FEATURED_FROM,
    featured_dates: [
      {
        featured_from: FEATURED_FROM,
        featured_until: null,
        reason: 'Founding American motto — offline showcase',
      },
    ],
    variants: [],
    translations: [],
    related: [],
    usageExamples: [],
    timeline: [
      {
        id: 'tl8-1',
        adage_id: 'offline-8',
        time_period_start: '1776-01-01',
        time_period_end: null,
        popularity_level: 'very_common',
        primary_location: 'United States',
        notes: 'On seal, currency, and civic language',
        sources: ['Great Seal of the United States'],
        created_at: NOW,
      },
    ],
    comments: [],
    commendations: [],
    citations: [],
  },
]

// Wire related adages after all IDs exist
OFFLINE_ADAGES[1].related = [
  {
    id: 'r2-1',
    adage_id: 'offline-2',
    related_adage_id: 'offline-6',
    relationship_type: 'thematic',
    related_adage: {
      id: 'offline-6',
      adage: OFFLINE_ADAGES[5].adage,
      definition: OFFLINE_ADAGES[5].definition,
    },
  },
]
OFFLINE_ADAGES[5].related = [
  {
    id: 'r6-1',
    adage_id: 'offline-6',
    related_adage_id: 'offline-2',
    relationship_type: 'thematic',
    related_adage: {
      id: 'offline-2',
      adage: OFFLINE_ADAGES[1].adage,
      definition: OFFLINE_ADAGES[1].definition,
    },
  },
]

export function listOfflineAdages(options?: {
  search?: string | null
  tag?: string | null
  featured?: boolean
  limit?: number
  offset?: number
}): OfflineAdageDetail[] {
  const { search, tag, featured, limit = 100, offset = 0 } = options || {}
  let items = [...OFFLINE_ADAGES]

  if (featured) {
    items = items.filter((a) => a.featured)
  }

  if (tag) {
    items = items.filter((a) => a.tags?.includes(tag))
  }

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (a) =>
        a.adage.toLowerCase().includes(q) ||
        a.definition.toLowerCase().includes(q) ||
        a.origin?.toLowerCase().includes(q)
    )
  }

  return items.slice(offset, offset + limit)
}

export function getOfflineAdageById(id: string): OfflineAdageDetail | undefined {
  return OFFLINE_ADAGES.find((a) => a.id === id)
}

export function listOfflineFeatured(limit = 3): OfflineAdageDetail[] {
  return OFFLINE_ADAGES.filter((a) => a.featured).slice(0, limit)
}

export function toListItem(adage: OfflineAdageDetail) {
  const {
    variants: _v,
    translations: _t,
    related: _r,
    usageExamples: _u,
    timeline: _tl,
    comments: _c,
    commendations: _cm,
    citations: _ci,
    featured_dates: _fd,
    userVote: _uv,
    ...listFields
  } = adage
  return listFields
}
