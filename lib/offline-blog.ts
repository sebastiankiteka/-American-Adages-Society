import { BlogPost } from '@/lib/db-types'

export type OfflineBlogPost = BlogPost & {
  score: number
  comment_count: number
  activity_count: number
  view_count: number
  userVote: null
  comments: unknown[]
}

const NOW = '2026-01-15T12:00:00.000Z'

function post(
  partial: Omit<BlogPost, 'views_count' | 'published' | 'created_at' | 'updated_at'> &
    Partial<Pick<BlogPost, 'views_count' | 'published' | 'created_at' | 'updated_at'>>
): OfflineBlogPost {
  return {
    views_count: 0,
    published: true,
    created_at: NOW,
    updated_at: NOW,
    score: 0,
    comment_count: 0,
    activity_count: 0,
    view_count: 0,
    userVote: null,
    comments: [],
    ...partial,
  }
}

export const OFFLINE_BLOG_POSTS: OfflineBlogPost[] = [
  post({
    id: 'offline-blog-1',
    title: 'Words That Shaped America: The Power of "E Pluribus Unum"',
    slug: 'words-that-shaped-america-e-pluribus-unum',
    excerpt:
      'Exploring how this Latin phrase became a cornerstone of American identity, representing unity in diversity.',
    content: `"E Pluribus Unum" — "Out of many, one" — has served as a de facto motto of the United States since its founding, appearing on currency, official seals, and government documents.

The phrase was first proposed for the Great Seal of the United States in 1776, chosen for its ability to capture the essence of the new nation: thirteen colonies uniting to form a single country. Yet its meaning has evolved and deepened over centuries.

What makes "E Pluribus Unum" particularly powerful as an adage is its dual nature: it describes both a historical reality and an ongoing aspiration. Unlike many adages that offer simple wisdom, this one invites us into an active process of nation-building and community-making.

In contemporary discourse, it remains relevant as America continues to navigate questions of identity, immigration, and inclusion. The adage doesn't promise that unity is easy—rather, it acknowledges that strength comes from the diversity that makes unity challenging.

As we explore adages in the American Adages Society, "E Pluribus Unum" serves as a reminder that language itself can be a tool for both reflection and aspiration.`,
    author_name: 'AAS Editorial Team',
    tags: ['culture', 'history', 'philosophy'],
    published_at: '2024-01-15T00:00:00.000Z',
    views_count: 42,
    view_count: 42,
    score: 5,
    comment_count: 0,
    activity_count: 5,
  }),
  post({
    id: 'offline-blog-2',
    title: 'Adages in Action: How "Actions Speak Louder Than Words" Guides Modern Leadership',
    slug: 'actions-speak-louder-than-words-leadership',
    excerpt:
      'A reflection on how timeless wisdom informs contemporary leadership practices and organizational culture.',
    content: `In an era of carefully crafted mission statements and polished corporate communications, the adage "actions speak louder than words" takes on renewed significance.

Modern leadership theory increasingly emphasizes authenticity and consistency between stated values and actual behavior. Research in organizational psychology consistently shows that employees and stakeholders judge leaders not by their speeches, but by their observable actions and the systems they create.

**Trust Building**: When leaders promise transparency but maintain closed-door decision-making, the adage reveals the disconnect.

**Cultural Change**: Organizations often announce transformations through memos. Yet real change only occurs when hiring, promotion, and resource allocation actually shift.

**Crisis Management**: During difficult times, leaders' actions reveal their true priorities more clearly than any prepared statement.

The wisdom of "actions speak louder than words" reminds us that leadership is fundamentally about consistency and integrity.`,
    author_name: 'Sarah Chen',
    tags: ['leadership', 'philosophy', 'modern application'],
    published_at: '2024-01-10T00:00:00.000Z',
    views_count: 31,
    view_count: 31,
    score: 3,
    activity_count: 3,
  }),
  post({
    id: 'offline-blog-3',
    title: 'The Etymology of "Better Late Than Never"',
    slug: 'etymology-better-late-than-never',
    excerpt:
      'Tracing the origins of this familiar phrase from Chaucer\'s Canterbury Tales to its modern usage.',
    content: `The phrase "better late than never" is so familiar that we rarely pause to consider its origins. Yet tracing its etymology reveals a rich history that spans centuries.

**Early Origins**: The phrase first appears in English literature in Geoffrey Chaucer's "The Canterbury Tales" (c. 1387-1400), where it appears as "better than never is late."

**Classical Precedents**: Similar sentiments appear in classical literature. The Roman poet Livy wrote "potius sero quam numquam" (better late than never).

**Evolution of Meaning**: While the core meaning has remained consistent—that delayed action is preferable to inaction—the phrase has taken on different nuances over time.

**Modern Relevance**: In our fast-paced, deadline-driven culture, "better late than never" offers a counter-narrative to perfectionism and all-or-nothing thinking.`,
    author_name: 'Dr. Michael Torres',
    tags: ['etymology', 'language', 'history'],
    published_at: '2023-12-20T00:00:00.000Z',
    views_count: 28,
    view_count: 28,
    score: 2,
    activity_count: 2,
  }),
  post({
    id: 'offline-blog-4',
    title: 'Reflections on "Where There\'s Smoke, There\'s Fire" in the Digital Age',
    slug: 'smoke-and-fire-digital-age',
    excerpt:
      'How do ancient proverbs hold up in an era of misinformation? Examining truth, signs, and evidence today.',
    content: `The adage "where there's smoke, there's fire" has guided human reasoning for centuries. But in our digital age of misinformation and algorithmic amplification, does this ancient wisdom still hold?

**The Traditional Wisdom**: Effects usually have causes. Smoke indicates fire; signs indicate underlying realities.

**The Digital Challenge**: In the age of social media, "smoke" can be manufactured. Rumors spread faster than facts. Patterns can be created by algorithms rather than discovered.

**A More Nuanced Application**:
- Investigation, not assumption: signs should prompt inquiry, not immediate conclusion.
- Source evaluation: Who is creating the smoke, and why?
- Pattern recognition: Real "fire" usually produces consistent, verifiable "smoke" from multiple independent sources.

Critical thinking requires both recognizing patterns and questioning their origins.`,
    author_name: 'Emma Rodriguez',
    tags: ['modern application', 'philosophy', 'culture'],
    published_at: '2023-12-10T00:00:00.000Z',
    views_count: 36,
    view_count: 36,
    score: 4,
    activity_count: 4,
  }),
  post({
    id: 'offline-blog-5',
    title: 'The Power of Adages: Why These Small Phrases Matter',
    slug: 'power-of-adages',
    excerpt:
      'Adages are more than old sayings—they are vessels of cultural wisdom that have survived generations.',
    content: `# The Power of Adages: Why These Small Phrases Matter

Adages are more than just old sayings—they are vessels of cultural wisdom that have survived generations. These concise expressions carry the accumulated knowledge and values of countless people who came before us.

## What Makes an Adage Powerful?

An adage distills complex wisdom into a memorable phrase. Consider "Actions speak louder than words"—in just five words, it captures a profound truth about human nature and relationships.

## Cultural Memory

Each adage tells a story about the values and experiences of the culture that created it. When we use "A penny saved is a penny earned," we're connecting to centuries of financial wisdom.

## Modern Relevance

Despite their age, adages remain remarkably relevant. They provide quick guidance in complex situations and connect us to shared human experiences across time and culture.

At the American Adages Society, we believe that understanding these phrases helps us understand ourselves and our culture better.`,
    author_name: 'AAS Editorial Team',
    tags: ['culture', 'philosophy', 'language'],
    published_at: '2025-11-15T00:00:00.000Z',
    views_count: 55,
    view_count: 55,
    score: 6,
    activity_count: 6,
  }),
]

export function listOfflineBlogPosts(options?: {
  search?: string | null
  tag?: string | null
  limit?: number
  offset?: number
}): OfflineBlogPost[] {
  const { search, tag, limit = 100, offset = 0 } = options || {}
  let items = OFFLINE_BLOG_POSTS.filter((p) => p.published && !p.hidden_at && !p.deleted_at)

  if (tag) {
    items = items.filter((p) => p.tags?.includes(tag))
  }

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    )
  }

  return items
    .slice()
    .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at))
    .slice(offset, offset + limit)
}

export function getOfflineBlogPostById(id: string): OfflineBlogPost | undefined {
  return OFFLINE_BLOG_POSTS.find((p) => p.id === id)
}

export function getOfflineBlogPostBySlug(slug: string): OfflineBlogPost | undefined {
  return OFFLINE_BLOG_POSTS.find((p) => p.slug === slug)
}

export function toBlogListItem(post: OfflineBlogPost) {
  const { comments: _c, userVote: _u, view_count: _v, ...rest } = post
  return rest
}
