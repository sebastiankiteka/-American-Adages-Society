// Script to add sample data directly to database
// Usage: node scripts/add-sample-data-direct.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function getAdminUser() {
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .is('deleted_at', null)
    .limit(1)

  if (!users || users.length === 0) {
    console.error('❌ No admin user found. Run: npm run create-admin')
    process.exit(1)
  }

  return users[0].id
}

async function addSampleData() {
  console.log('📝 Adding sample data to database...\n')

  const adminId = await getAdminUser()

  // Sample Adages
  const sampleAdages = [
    {
      adage: 'A penny saved is a penny earned',
      definition: 'Saving money is as valuable as earning it. This emphasizes the importance of frugality and careful financial management.',
      origin: 'Attributed to Benjamin Franklin, 1737',
      etymology: 'This phrase first appeared in Benjamin Franklin\'s "Poor Richard\'s Almanack" in 1737. Franklin was known for his practical wisdom about money and thrift.',
      historical_context: 'During the 18th century, when this adage was popularized, economic stability was crucial for survival. Franklin\'s advice reflected the values of the emerging American middle class, emphasizing self-reliance and careful resource management.',
      interpretation: 'The adage suggests that money not spent is equivalent to money earned, highlighting the value of restraint and planning. It encourages a mindset where saving is seen as an active form of earning.',
      modern_practicality: 'In today\'s consumer-driven economy, this adage remains relevant for personal finance, encouraging people to view saving as a positive action rather than deprivation. It\'s particularly valuable for budgeting and long-term financial planning.',
      tags: ['finance', 'wisdom', 'frugality'],
      featured: false,
      created_by: adminId,
    },
    {
      adage: 'Actions speak louder than words',
      definition: 'What people do is more important and revealing than what they say. Deeds demonstrate true intentions and character more effectively than promises or declarations.',
      origin: 'First recorded in English in the 17th century, though the concept appears in various cultures',
      etymology: 'The phrase emphasizes that observable behavior provides more reliable information about a person\'s true nature than their verbal statements.',
      historical_context: 'This adage has been valued across cultures and time periods as a way to assess trustworthiness and character. It reflects a universal human need to evaluate others based on consistent behavior rather than rhetoric.',
      interpretation: 'The saying encourages critical thinking about the relationship between words and actions, suggesting that true character is revealed through consistent behavior over time.',
      modern_practicality: 'In modern leadership, business, and relationships, this adage reminds us to pay attention to patterns of behavior rather than isolated statements. It\'s particularly relevant in evaluating commitments and promises.',
      tags: ['character', 'wisdom', 'leadership'],
      featured: true,
      created_by: adminId,
    },
    {
      adage: 'Better late than never',
      definition: 'It is better to do something late than to never do it at all. This encourages completion of tasks or fulfillment of obligations, even if delayed.',
      origin: 'First recorded in English in the 14th century, derived from Latin "potius sero quam numquam"',
      etymology: 'The phrase has been used across languages and cultures, emphasizing the value of eventual completion over permanent inaction.',
      historical_context: 'This adage has been used throughout history to encourage persistence and to value delayed but eventual achievement over abandonment.',
      interpretation: 'The saying suggests that the value of an action is not entirely negated by delay, and that completion has inherent worth regardless of timing.',
      modern_practicality: 'In modern contexts, this adage is often used to encourage people to complete overdue tasks, apologize for past mistakes, or pursue delayed goals. It promotes a growth mindset and the value of persistence.',
      tags: ['persistence', 'wisdom', 'completion'],
      featured: false,
      created_by: adminId,
    },
    {
      adage: 'Don\'t count your chickens before they hatch',
      definition: 'Don\'t assume success or make plans based on expected outcomes that haven\'t yet occurred. Wait for actual results before celebrating or making commitments.',
      origin: 'First recorded in English in the 16th century, though similar sayings exist in many cultures',
      etymology: 'The phrase comes from the literal practice of counting eggs in a nest before they\'ve hatched, representing premature assumptions about future outcomes.',
      historical_context: 'This adage reflects agricultural wisdom about the uncertainty of farming outcomes, but has been applied broadly to caution against overconfidence in any endeavor.',
      interpretation: 'The saying warns against premature celebration or planning based on uncertain future events, encouraging patience and realistic expectations.',
      modern_practicality: 'In modern business, investing, and personal planning, this adage reminds us to base decisions on actual results rather than anticipated outcomes. It promotes cautious optimism and realistic planning.',
      tags: ['caution', 'wisdom', 'planning'],
      featured: false,
      created_by: adminId,
    },
    {
      adage: 'The early bird catches the worm',
      definition: 'Those who act promptly and arrive first have the best chance of success. Being early or prepared gives one an advantage.',
      origin: 'First recorded in English in the 17th century',
      etymology: 'The phrase comes from the observation that birds who wake and search for food early in the morning find the most worms, which are more active at that time.',
      historical_context: 'This adage has been used across cultures to encourage punctuality, preparation, and proactive behavior. It reflects the value placed on being ready and acting promptly.',
      interpretation: 'The saying emphasizes the competitive advantage of being early, prepared, or proactive rather than waiting or being reactive.',
      modern_practicality: 'In modern contexts, this adage is often cited in business, education, and personal development to encourage early action, preparation, and the value of being first to market or opportunity.',
      tags: ['punctuality', 'preparation', 'success'],
      featured: false,
      created_by: adminId,
    },
  ]

  // Sample Blog Posts
  const sampleBlogPosts = [
    {
      title: 'The Power of Adages: Why These Small Phrases Matter',
      excerpt: 'Adages are more than just old sayings—they are vessels of cultural wisdom that have survived generations. In this post, we explore why these concise expressions continue to shape our thinking and guide our actions.',
      content: `# The Power of Adages: Why These Small Phrases Matter

Adages are more than just old sayings—they are vessels of cultural wisdom that have survived generations. These concise expressions, passed down through oral tradition and written word, carry with them the accumulated knowledge and values of countless people who came before us.

## What Makes an Adage Powerful?

An adage distills complex wisdom into a memorable phrase. Consider "Actions speak louder than words"—in just five words, it captures a profound truth about human nature and relationships. This efficiency is part of what makes adages so enduring.

## Cultural Memory

Each adage tells a story about the values and experiences of the culture that created it. When we use "A penny saved is a penny earned," we're connecting to centuries of financial wisdom and the values of thrift and careful planning.

## Modern Relevance

Despite their age, adages remain remarkably relevant. They provide quick guidance in complex situations, offer perspective when we're overwhelmed, and connect us to shared human experiences across time and culture.

At the American Adages Society, we believe that understanding these phrases helps us understand ourselves and our culture better. Join us as we explore the depth and wisdom embedded in these timeless expressions.`,
      tags: ['culture', 'philosophy', 'language'],
      published: true,
      published_at: new Date('2025-11-15').toISOString(),
      author_id: adminId,
    },
    {
      title: 'Looking Ahead: Our Plans for 2026',
      excerpt: 'As we move into 2026, the American Adages Society has exciting plans for expanding our archive, hosting more events, and engaging with the community. Read about our upcoming initiatives and how you can get involved.',
      content: `# Looking Ahead: Our Plans for 2026

As we move into 2026, the American Adages Society is excited to share our plans for the coming year. We have several initiatives that will expand our mission of preserving and exploring the wisdom embedded in adages.

## Expanding Our Archive

We're working to significantly expand our archive of adages, adding detailed historical context, etymology, and modern interpretations. Our goal is to create the most comprehensive collection of American adages with scholarly depth.

## Community Events

We're planning monthly discussion sessions, guest speaker events, and creative workshops. These gatherings will bring together students, scholars, and anyone interested in exploring language and wisdom.

## Research Initiatives

We're launching collaborative research projects to trace the origins and evolution of specific adages, examining how they've changed over time and what they reveal about American culture.

## Get Involved

We're always looking for new members and contributors. Whether you're interested in research, writing, event planning, or simply exploring adages, there's a place for you in our community.

Stay tuned for more announcements, and join us at our upcoming events!`,
      tags: ['announcement', 'programs', 'events'],
      published: true,
      published_at: new Date('2025-12-20').toISOString(),
      author_id: adminId,
    },
  ]

  // Sample Event
  const sampleEvent = {
    title: 'Spring Organization Fair - Session 2',
    description: 'Join the American Adages Society at the 2026 Spring Student Organization Fair! We\'ll be in WCP Ballroom Room 2.410 for Session 2. Come learn about our mission, meet current members, and discover how you can get involved in exploring the wisdom embedded in adages. Check-in begins at 12:00 p.m. in the WCP Legislative Assembly Room 2.302, and the fair runs from 1:00 p.m. to 3:00 p.m.',
    event_date: new Date('2026-01-14T13:00:00').toISOString(), // January 14, 2026, 1:00 PM
    end_date: new Date('2026-01-14T15:00:00').toISOString(), // 3:00 PM
    location: 'WCP Ballroom Room 2.410, William C. Powers, Jr. Student Activity Center, University of Texas - Austin',
    event_type: 'other',
    created_by: adminId,
  }

  try {
    // Add adages
    console.log('📚 Adding sample adages...')
    for (const adage of sampleAdages) {
      const { data, error } = await supabase
        .from('adages')
        .insert(adage)
        .select()
        .single()

      if (error) {
        console.error(`   ❌ Error adding "${adage.adage}":`, error.message)
      } else {
        console.log(`   ✅ Added: "${adage.adage}"`)
      }
    }

    // Add blog posts
    console.log('\n📝 Adding sample blog posts...')
    for (const post of sampleBlogPosts) {
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...post,
          slug,
        })
        .select()
        .single()

      if (error) {
        console.error(`   ❌ Error adding "${post.title}":`, error.message)
      } else {
        console.log(`   ✅ Added: "${post.title}"`)
      }
    }

    // Add event
    console.log('\n📅 Adding sample event...')
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvent)
      .select()
      .single()

    if (error) {
      console.error(`   ❌ Error adding event:`, error.message)
    } else {
      console.log(`   ✅ Added: "${sampleEvent.title}"`)
    }

    console.log('\n✅ Sample data added successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Visit http://localhost:3000/archive to see the adages')
    console.log('   2. Visit http://localhost:3000/blog to see the blog posts')
    console.log('   3. Visit http://localhost:3000/events to see the event')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

addSampleData().catch(console.error)















