// Shared data for adages and blog posts
// In production, this would come from a database

export interface Adage {
  id: string
  adage: string
  definition: string
  origin?: string
  etymology?: string
  historicalContext?: string
  interpretation?: string
  modernPracticality?: string
  tags?: string[]
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  author?: string
  tags?: string[]
}

export const adages: Adage[] = [
  {
    id: '1',
    adage: 'A penny saved is a penny earned',
    definition: 'Saving money is as valuable as earning it. This emphasizes the importance of frugality and careful financial management.',
    origin: 'Attributed to Benjamin Franklin, 1737',
    etymology: 'This phrase first appeared in Benjamin Franklin\'s "Poor Richard\'s Almanack" in 1737. Franklin was known for his practical wisdom about money and thrift.',
    historicalContext: 'During the 18th century, when this adage was popularized, economic stability was crucial for survival. Franklin\'s advice reflected the values of the emerging American middle class, emphasizing self-reliance and careful resource management.',
    interpretation: 'The adage suggests that money not spent is equivalent to money earned, highlighting the value of restraint and planning. It encourages a mindset where saving is seen as an active form of earning.',
    modernPracticality: 'In today\'s consumer-driven economy, this adage remains relevant for personal finance, encouraging people to view saving as a positive action rather than deprivation. It\'s particularly valuable for budgeting and long-term financial planning.',
    tags: ['finance', 'wisdom', 'frugality'],
  },
  {
    id: '2',
    adage: 'Actions speak louder than words',
    definition: 'What people do is more important than what they say. Deeds demonstrate true intentions and character.',
    origin: 'English proverb, 17th century',
    etymology: 'This phrase has been traced back to various sources, including the writings of John Pym (1584-1643) and appears in multiple languages. The concept emphasizes observable behavior over verbal promises.',
    historicalContext: 'The phrase gained prominence during periods when trust and reliability were essential for survival and social cohesion. It reflects a practical approach to evaluating character and commitment.',
    interpretation: 'This adage suggests that behavior is a more reliable indicator of character, values, and intentions than verbal expressions. It encourages looking beyond rhetoric to assess true commitment.',
    modernPracticality: 'In contemporary contexts, this adage is crucial for evaluating leadership, relationships, and organizational culture. It reminds us to judge people and institutions by their actions rather than their marketing or promises.',
    tags: ['character', 'behavior', 'wisdom'],
  },
  {
    id: '3',
    adage: 'Better late than never',
    definition: 'It is better to do something late than to never do it at all. Encourages completion even when delayed.',
    origin: 'Geoffrey Chaucer, "The Canterbury Tales", 14th century',
    etymology: 'The phrase appears in Chaucer\'s "The Canterbury Tales" (c. 1387-1400) in the form "better than never is late." It has been adapted and shortened over centuries.',
    historicalContext: 'The phrase reflects a pragmatic approach to completion and redemption, suggesting that delayed action is preferable to inaction. It has been used to encourage perseverance and second chances.',
    interpretation: 'This adage promotes the value of completion and persistence, even when timing is imperfect. It suggests that delayed achievement is still achievement.',
    modernPracticality: 'In modern life, this adage encourages people to complete tasks, apologize, or make amends even if delayed. It\'s particularly relevant for procrastination, deadlines, and personal growth.',
    tags: ['timing', 'completion', 'encouragement'],
  },
  {
    id: '4',
    adage: 'Don\'t count your chickens before they hatch',
    definition: 'Don\'t make plans based on something that hasn\'t happened yet. Warns against premature assumptions.',
    origin: 'Aesop\'s Fables, ancient Greece',
    etymology: 'This phrase comes from Aesop\'s fable "The Milkmaid and Her Pail," dating back to ancient Greece (c. 600 BCE). The story warns against assuming outcomes before they occur.',
    historicalContext: 'The fable has been retold across cultures and centuries, teaching the importance of patience and not taking future outcomes for granted. It reflects agricultural wisdom about the uncertainty of farming.',
    interpretation: 'The adage cautions against premature celebration or planning based on uncertain outcomes. It emphasizes the importance of waiting for actual results before making assumptions.',
    modernPracticality: 'In contemporary contexts, this adage is valuable for financial planning, career decisions, and project management. It encourages realistic expectations and contingency planning.',
    tags: ['caution', 'planning', 'wisdom'],
  },
  {
    id: '5',
    adage: 'The early bird catches the worm',
    definition: 'Those who act promptly and arrive first have the best chance of success.',
    origin: 'English proverb, 17th century',
    etymology: 'This phrase dates back to the 17th century and reflects the literal observation that birds who wake and hunt early have better access to food. It was first recorded in print in 1636.',
    historicalContext: 'The phrase emerged during a period when agricultural and commercial success depended heavily on timing and early action. It reflects the value placed on initiative and promptness.',
    interpretation: 'The adage suggests that early action and preparation lead to better outcomes. It emphasizes the competitive advantage of being first and prepared.',
    modernPracticality: 'In modern contexts, this adage applies to career advancement, business opportunities, and personal productivity. It encourages proactive behavior and time management.',
    tags: ['timing', 'success', 'initiative'],
  },
  {
    id: '6',
    adage: 'Where there\'s smoke, there\'s fire',
    definition: 'If there are signs or rumors of something, there is likely some truth to it.',
    origin: 'Latin proverb, "Ubi fumus, ibi ignis"',
    etymology: 'The phrase comes from the Latin "Ubi fumus, ibi ignis" (where there is smoke, there is fire). It has been used in English since at least the 15th century.',
    historicalContext: 'This adage reflects the logical principle that observable effects usually have causes. It has been used both literally (fire produces smoke) and metaphorically (signs indicate underlying truth).',
    interpretation: 'The phrase suggests that where there are signs, rumors, or evidence of something, there is likely a basis in truth. It encourages investigation when patterns emerge.',
    modernPracticality: 'In contemporary contexts, this adage is relevant for critical thinking, journalism, and decision-making. However, it also requires careful application to avoid false assumptions based on incomplete information.',
    tags: ['truth', 'signs', 'wisdom'],
  },
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Words That Shaped America: The Power of "E Pluribus Unum"',
    excerpt: 'Exploring how this Latin phrase became a cornerstone of American identity, representing unity in diversity and the strength found in our collective differences.',
    content: `"E Pluribus Unum" — "Out of many, one" — has served as a de facto motto of the United States since its founding, appearing on currency, official seals, and government documents. But beyond its official status, this phrase embodies a fundamental American adage about unity and diversity.

The phrase was first proposed for the Great Seal of the United States in 1776, chosen for its ability to capture the essence of the new nation: thirteen colonies uniting to form a single country. Yet its meaning has evolved and deepened over centuries.

What makes "E Pluribus Unum" particularly powerful as an adage is its dual nature: it describes both a historical reality (the formation of the United States from diverse colonies) and an ongoing aspiration (the continued work of building unity from diversity). Unlike many adages that offer simple wisdom, this one invites us into an active process of nation-building and community-making.

In contemporary discourse, "E Pluribus Unum" remains relevant as America continues to navigate questions of identity, immigration, and inclusion. The adage doesn't promise that unity is easy or automatic—rather, it acknowledges that strength comes from the very diversity that makes unity challenging.

As we explore adages in the American Adages Society, "E Pluribus Unum" serves as a reminder that language itself can be a tool for both reflection and aspiration. It shows us how a few carefully chosen words can carry centuries of meaning and continue to shape how we understand ourselves as a nation.`,
    date: '2024-01-15',
    author: 'AAS Editorial Team',
    tags: ['culture', 'history', 'philosophy'],
  },
  {
    id: '2',
    title: 'Adages in Action: How "Actions Speak Louder Than Words" Guides Modern Leadership',
    excerpt: 'A reflection on how timeless wisdom informs contemporary leadership practices, examining the gap between rhetoric and reality in organizational culture.',
    content: `In an era of carefully crafted mission statements and polished corporate communications, the adage "actions speak louder than words" takes on renewed significance. This phrase, which dates back to at least the 17th century, offers a critical lens for evaluating leadership and organizational integrity.

Modern leadership theory increasingly emphasizes authenticity and consistency between stated values and actual behavior. Research in organizational psychology consistently shows that employees and stakeholders judge leaders not by their speeches or written statements, but by their observable actions, decisions, and the systems they create.

Consider how this adage applies to contemporary leadership challenges:

**Trust Building**: When leaders promise transparency but maintain closed-door decision-making, the adage reveals the disconnect. True leadership requires alignment between words and actions.

**Cultural Change**: Organizations often announce cultural transformations through memos and presentations. Yet real change only occurs when actions—hiring practices, promotion criteria, resource allocation—actually shift.

**Crisis Management**: During difficult times, leaders' actions (or inactions) reveal their true priorities more clearly than any prepared statement.

The wisdom of "actions speak louder than words" reminds us that leadership is fundamentally about consistency and integrity. It's not enough to articulate values—those values must be embodied in daily decisions, policies, and behaviors.

As we explore adages in our discussions, this one particularly resonates for those interested in leadership, organizational culture, and authentic communication. It challenges us to examine not just what we say, but what we do—and to recognize that others are doing the same.`,
    date: '2024-01-10',
    author: 'Sarah Chen',
    tags: ['leadership', 'philosophy', 'modern application'],
  },
  {
    id: '3',
    title: 'Spring 2024 Program Launch: Creative Writing Workshops',
    excerpt: 'We\'re excited to announce our new series of workshops exploring adages through creative writing, poetry, and storytelling. Join us for an evening of language and imagination.',
    content: `We're thrilled to announce the launch of our Spring 2024 Creative Writing Workshop series! These monthly sessions will explore how adages can inspire and inform creative expression across genres.

**Workshop Format**: Each session will begin with an exploration of a specific adage—its origins, meanings, and cultural significance. Then, participants will engage in guided writing exercises that use the adage as a springboard for creative work.

**What to Expect**:
- Poetry workshops exploring how adages can serve as themes, titles, or structural elements
- Short story sessions where adages provide narrative frameworks or character insights
- Creative nonfiction exercises examining personal experiences through the lens of timeless wisdom
- Collaborative projects building on adage-based prompts

**Why This Matters**: Adages are more than sayings—they're narrative seeds, philosophical starting points, and cultural touchstones. By engaging with them creatively, we deepen our understanding while creating new works that carry forward the wisdom embedded in these phrases.

Our first workshop will focus on "Better late than never," exploring themes of completion, redemption, and second chances through various writing forms.

All workshops are open to writers of all levels. No prior experience with adages or creative writing is required—just bring your curiosity and a notebook.

We look forward to seeing how these timeless phrases inspire your creative work!`,
    date: '2024-01-05',
    author: 'AAS Events Team',
    tags: ['events', 'announcement', 'programs'],
  },
  {
    id: '4',
    title: 'The Etymology of "Better Late Than Never"',
    excerpt: 'Tracing the origins of this familiar phrase from Chaucer\'s Canterbury Tales to its modern usage, and what it reveals about our relationship with time and completion.',
    content: `The phrase "better late than never" is so familiar that we rarely pause to consider its origins. Yet tracing its etymology reveals a rich history that spans centuries and cultures.

**Early Origins**: The phrase first appears in English literature in Geoffrey Chaucer's "The Canterbury Tales" (c. 1387-1400), where it appears as "better than never is late." Chaucer's version suggests the phrase was already well-known in his time, indicating even earlier origins.

**Classical Precedents**: Similar sentiments appear in classical literature. The Roman poet Livy (59 BCE - 17 CE) wrote "potius sero quam numquam" (better late than never), suggesting the concept predates even Chaucer.

**Evolution of Meaning**: While the core meaning has remained consistent—that delayed action is preferable to inaction—the phrase has taken on different nuances over time. In Chaucer's era, it often related to religious redemption and the possibility of late conversion. In modern usage, it more commonly applies to practical matters like deadlines, apologies, or completing tasks.

**Cultural Variations**: The phrase appears in similar forms across many languages, indicating a universal human recognition that completion, even when delayed, has value. This cross-cultural presence suggests the adage addresses a fundamental aspect of human experience.

**Modern Relevance**: In our fast-paced, deadline-driven culture, "better late than never" offers a counter-narrative to perfectionism and all-or-nothing thinking. It acknowledges that life is messy, timing is imperfect, and that delayed completion is still completion.

Understanding the etymology of this adage enriches our appreciation of its wisdom and reminds us that these phrases carry centuries of human experience and reflection.`,
    date: '2023-12-20',
    author: 'Dr. Michael Torres',
    tags: ['etymology', 'language', 'history'],
  },
  {
    id: '5',
    title: 'Reflections on "Where There\'s Smoke, There\'s Fire" in the Digital Age',
    excerpt: 'How do ancient proverbs hold up in an era of misinformation? Examining the relevance of this adage in understanding truth, signs, and evidence in modern discourse.',
    content: `The adage "where there's smoke, there's fire" has guided human reasoning for centuries, suggesting that observable signs usually indicate underlying truth. But in our digital age of misinformation, viral rumors, and algorithmic amplification, does this ancient wisdom still hold?

**The Traditional Wisdom**: The phrase, derived from the Latin "Ubi fumus, ibi ignis," reflects a logical principle: effects usually have causes. Smoke indicates fire; signs indicate underlying realities. This has served as valuable guidance for investigation, journalism, and critical thinking.

**The Digital Challenge**: In the age of social media, "smoke" can be manufactured. Rumors spread faster than facts. Patterns can be created by algorithms rather than discovered. The "smoke" we see might be digital manipulation rather than evidence of "fire."

**A More Nuanced Application**: The adage remains valuable, but requires careful application:
- **Investigation, Not Assumption**: The presence of "smoke" (signs, rumors, patterns) should prompt investigation, not immediate conclusion.
- **Source Evaluation**: In the digital age, we must ask: Who is creating the smoke? Why? What are their motivations?
- **Pattern Recognition**: Real "fire" usually produces consistent, verifiable "smoke" from multiple independent sources.

**Modern Relevance**: The adage teaches us to pay attention to patterns and signs, but also reminds us that not all smoke indicates fire—some indicates smoke machines. Critical thinking requires both recognizing patterns and questioning their origins.

As we navigate information overload, this ancient adage offers both guidance and caution: pay attention to signs, but investigate before concluding. The wisdom isn't in blindly following the adage, but in thoughtfully applying it to distinguish between genuine signals and manufactured noise.`,
    date: '2023-12-10',
    author: 'Emma Rodriguez',
    tags: ['modern application', 'philosophy', 'culture'],
  },
]

