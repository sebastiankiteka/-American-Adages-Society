const NOW = '2026-01-15T12:00:00.000Z'
const REPLY_AT = '2026-01-16T14:30:00.000Z'

const OFFLINE_AUTHOR = {
  id: 'offline-user-aas',
  username: 'aas_editor',
  display_name: 'AAS Editor',
  profile_image_url: null as string | null,
}

const COMMUNITY_AUTHOR = {
  id: 'offline-user-member',
  username: 'adage_fan',
  display_name: 'Community Member',
  profile_image_url: null as string | null,
}

export type OfflineForumAuthor = typeof OFFLINE_AUTHOR

export type OfflineForumSection = {
  id: string
  title: string
  slug: string
  description?: string
  rules?: string
  subsection_of?: string | null
  order_index: number
  locked: boolean
  created_at: string
  subsections: OfflineForumSection[]
}

export type OfflineForumReply = {
  id: string
  thread_id: string
  parent_reply_id?: string | null
  content: string
  author_id: string
  created_at: string
  updated_at: string
  author: OfflineForumAuthor
}

export type OfflineForumThread = {
  id: string
  section_id: string
  title: string
  slug: string
  content: string
  author_id: string
  pinned: boolean
  locked: boolean
  frozen: boolean
  views_count: number
  replies_count: number
  last_reply_at?: string
  created_at: string
  updated_at: string
  author: OfflineForumAuthor
  section: { id: string; title: string; slug: string }
  replies: OfflineForumReply[]
}

export const OFFLINE_FORUM_SECTIONS: OfflineForumSection[] = [
  {
    id: 'offline-section-general',
    title: 'General Discussion',
    slug: 'general-discussion',
    description:
      'A place for general conversations about adages, their meanings, and cultural significance.',
    rules: `Rules:
1. Be respectful and constructive in all discussions
2. Stay on topic — discussions should relate to adages or language
3. No spam or self-promotion
4. Use clear, descriptive thread titles
5. Search before posting to avoid duplicate threads`,
    subsection_of: null,
    order_index: 0,
    locked: false,
    created_at: NOW,
    subsections: [],
  },
  {
    id: 'offline-section-origins',
    title: 'Origins & Etymology',
    slug: 'origins-etymology',
    description: 'Trace where sayings came from and how their wording changed over time.',
    rules: 'Cite sources when you can. Speculation is welcome if labeled as such.',
    subsection_of: null,
    order_index: 1,
    locked: false,
    created_at: NOW,
    subsections: [],
  },
]

export const OFFLINE_FORUM_THREADS: OfflineForumThread[] = [
  {
    id: 'offline-thread-welcome',
    section_id: 'offline-section-general',
    title: 'Welcome to the Forum!',
    slug: 'welcome-to-the-forum',
    content: `Welcome to the American Adages Society forum! This is a space for discussing adages, their origins, meanings, and how they relate to our culture and language.

Feel free to:
- Share interesting adages you've discovered
- Discuss the meanings and interpretations of adages
- Ask questions about adage origins
- Share examples of adages in modern usage

Let's start some great conversations!

*(Offline mode — sample content while the live database is unavailable.)*`,
    author_id: OFFLINE_AUTHOR.id,
    pinned: true,
    locked: false,
    frozen: false,
    views_count: 24,
    replies_count: 1,
    last_reply_at: REPLY_AT,
    created_at: NOW,
    updated_at: REPLY_AT,
    author: OFFLINE_AUTHOR,
    section: {
      id: 'offline-section-general',
      title: 'General Discussion',
      slug: 'general-discussion',
    },
    replies: [
      {
        id: 'offline-reply-1',
        thread_id: 'offline-thread-welcome',
        parent_reply_id: null,
        content:
          'Thanks for creating this forum! I\'m excited to discuss adages with the community. One of my favorites is "The early bird catches the worm" — it\'s so simple yet so true about the value of being proactive.',
        author_id: COMMUNITY_AUTHOR.id,
        created_at: REPLY_AT,
        updated_at: REPLY_AT,
        author: COMMUNITY_AUTHOR,
      },
    ],
  },
  {
    id: 'offline-thread-penny',
    section_id: 'offline-section-general',
    title: 'Favorite thrift adages?',
    slug: 'favorite-thrift-adages',
    content:
      'Beyond "A penny saved is a penny earned," what other sayings about money and thrift do you find useful today?',
    author_id: COMMUNITY_AUTHOR.id,
    pinned: false,
    locked: false,
    frozen: false,
    views_count: 11,
    replies_count: 1,
    last_reply_at: '2026-01-17T09:00:00.000Z',
    created_at: '2026-01-16T10:00:00.000Z',
    updated_at: '2026-01-17T09:00:00.000Z',
    author: COMMUNITY_AUTHOR,
    section: {
      id: 'offline-section-general',
      title: 'General Discussion',
      slug: 'general-discussion',
    },
    replies: [
      {
        id: 'offline-reply-2',
        thread_id: 'offline-thread-penny',
        parent_reply_id: null,
        content:
          '"Don\'t put all your eggs in one basket" still feels essential for investing and career planning.',
        author_id: OFFLINE_AUTHOR.id,
        created_at: '2026-01-17T09:00:00.000Z',
        updated_at: '2026-01-17T09:00:00.000Z',
        author: OFFLINE_AUTHOR,
      },
    ],
  },
  {
    id: 'offline-thread-smoke',
    section_id: 'offline-section-origins',
    title: 'Where does "where there\'s smoke, there\'s fire" come from?',
    slug: 'smoke-theres-fire-origins',
    content:
      'I\'ve seen Latin "Ubi fumus, ibi ignis" cited — does anyone have a clearer first English attestation?',
    author_id: OFFLINE_AUTHOR.id,
    pinned: false,
    locked: false,
    frozen: false,
    views_count: 8,
    replies_count: 0,
    last_reply_at: undefined,
    created_at: '2026-01-14T16:00:00.000Z',
    updated_at: '2026-01-14T16:00:00.000Z',
    author: OFFLINE_AUTHOR,
    section: {
      id: 'offline-section-origins',
      title: 'Origins & Etymology',
      slug: 'origins-etymology',
    },
    replies: [],
  },
]

export function listOfflineForumSections(): OfflineForumSection[] {
  return OFFLINE_FORUM_SECTIONS.map((s) => ({ ...s, subsections: [...s.subsections] }))
}

export function getOfflineForumSectionBySlug(slug: string): OfflineForumSection | undefined {
  return OFFLINE_FORUM_SECTIONS.find((s) => s.slug === slug)
}

export function listOfflineForumThreads(options?: {
  sectionId?: string | null
  limit?: number
  offset?: number
}) {
  const { sectionId, limit = 50, offset = 0 } = options || {}
  let items = [...OFFLINE_FORUM_THREADS]

  if (sectionId) {
    items = items.filter((t) => t.section_id === sectionId)
  }

  items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    const aTime = a.last_reply_at || a.created_at
    const bTime = b.last_reply_at || b.created_at
    return bTime.localeCompare(aTime)
  })

  return items.slice(offset, offset + limit).map(({ replies: _r, ...thread }) => thread)
}

export function getOfflineForumThreadBySlug(
  slug: string,
  sectionSlug?: string | null
): OfflineForumThread | undefined {
  return OFFLINE_FORUM_THREADS.find(
    (t) => t.slug === slug && (!sectionSlug || t.section.slug === sectionSlug)
  )
}
