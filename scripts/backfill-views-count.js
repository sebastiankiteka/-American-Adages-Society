// Script to backfill views_count fields from existing views table data
// Usage: node scripts/backfill-views-count.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually since dotenv might not work in scripts
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function backfillViewsCount() {
  console.log('🔄 Starting views_count backfill...\n')

  try {
    // Step 1: Count views per adage
    console.log('📊 Counting views for adages...')
    const { data: adageViews, error: adageViewsError } = await supabase
      .from('views')
      .select('target_id')
      .eq('target_type', 'adage')

    if (adageViewsError) {
      console.error('❌ Error fetching adage views:', adageViewsError.message)
      return
    }

    // Count views per adage
    const adageViewCounts = {}
    if (adageViews) {
      adageViews.forEach((view) => {
        adageViewCounts[view.target_id] = (adageViewCounts[view.target_id] || 0) + 1
      })
    }

    console.log(`   Found ${Object.keys(adageViewCounts).length} adages with views`)
    console.log(`   Total adage views: ${adageViews?.length || 0}`)

    // Update adages
    let adagesUpdated = 0
    for (const [adageId, count] of Object.entries(adageViewCounts)) {
      const { error } = await supabase
        .from('adages')
        .update({ views_count: count })
        .eq('id', adageId)
        .is('deleted_at', null)

      if (error) {
        console.error(`   ⚠️  Failed to update adage ${adageId}:`, error.message)
      } else {
        adagesUpdated++
      }
    }
    console.log(`   ✅ Updated ${adagesUpdated} adages\n`)

    // Step 2: Count views per blog post
    console.log('📊 Counting views for blog posts...')
    const { data: blogViews, error: blogViewsError } = await supabase
      .from('views')
      .select('target_id')
      .eq('target_type', 'blog')

    if (blogViewsError) {
      console.error('❌ Error fetching blog views:', blogViewsError.message)
      return
    }

    // Count views per blog
    const blogViewCounts = {}
    if (blogViews) {
      blogViews.forEach((view) => {
        blogViewCounts[view.target_id] = (blogViewCounts[view.target_id] || 0) + 1
      })
    }

    console.log(`   Found ${Object.keys(blogViewCounts).length} blog posts with views`)
    console.log(`   Total blog views: ${blogViews?.length || 0}`)

    // Update blog posts
    let blogsUpdated = 0
    for (const [blogId, count] of Object.entries(blogViewCounts)) {
      const { error } = await supabase
        .from('blog_posts')
        .update({ views_count: count })
        .eq('id', blogId)
        .is('deleted_at', null)

      if (error) {
        console.error(`   ⚠️  Failed to update blog ${blogId}:`, error.message)
      } else {
        blogsUpdated++
      }
    }
    console.log(`   ✅ Updated ${blogsUpdated} blog posts\n`)

    // Step 3: Count views per forum thread
    console.log('📊 Counting views for forum threads...')
    const { data: forumViews, error: forumViewsError } = await supabase
      .from('views')
      .select('target_id')
      .eq('target_type', 'forum_thread')

    if (forumViewsError) {
      console.error('❌ Error fetching forum views:', forumViewsError.message)
      return
    }

    // Count views per forum thread
    const forumViewCounts = {}
    if (forumViews) {
      forumViews.forEach((view) => {
        forumViewCounts[view.target_id] = (forumViewCounts[view.target_id] || 0) + 1
      })
    }

    console.log(`   Found ${Object.keys(forumViewCounts).length} forum threads with views`)
    console.log(`   Total forum views: ${forumViews?.length || 0}`)

    // Update forum threads
    let forumsUpdated = 0
    for (const [threadId, count] of Object.entries(forumViewCounts)) {
      const { error } = await supabase
        .from('forum_threads')
        .update({ views_count: count })
        .eq('id', threadId)
        .is('deleted_at', null)

      if (error) {
        console.error(`   ⚠️  Failed to update forum thread ${threadId}:`, error.message)
      } else {
        forumsUpdated++
      }
    }
    console.log(`   ✅ Updated ${forumsUpdated} forum threads\n`)

    // Step 4: Reset counts for items with no views
    console.log('🔄 Resetting counts for items with no views...')
    
    // Get all adages
    const { data: allAdages } = await supabase
      .from('adages')
      .select('id, views_count')
      .is('deleted_at', null)

    let adagesReset = 0
    if (allAdages) {
      for (const adage of allAdages) {
        if (!adageViewCounts[adage.id] && adage.views_count > 0) {
          const { error } = await supabase
            .from('adages')
            .update({ views_count: 0 })
            .eq('id', adage.id)

          if (!error) adagesReset++
        }
      }
    }

    // Get all blog posts
    const { data: allBlogs } = await supabase
      .from('blog_posts')
      .select('id, views_count')
      .is('deleted_at', null)

    let blogsReset = 0
    if (allBlogs) {
      for (const blog of allBlogs) {
        if (!blogViewCounts[blog.id] && blog.views_count > 0) {
          const { error } = await supabase
            .from('blog_posts')
            .update({ views_count: 0 })
            .eq('id', blog.id)

          if (!error) blogsReset++
        }
      }
    }

    // Get all forum threads
    const { data: allThreads } = await supabase
      .from('forum_threads')
      .select('id, views_count')
      .is('deleted_at', null)

    let threadsReset = 0
    if (allThreads) {
      for (const thread of allThreads) {
        if (!forumViewCounts[thread.id] && thread.views_count > 0) {
          const { error } = await supabase
            .from('forum_threads')
            .update({ views_count: 0 })
            .eq('id', thread.id)

          if (!error) threadsReset++
        }
      }
    }

    console.log(`   ✅ Reset ${adagesReset} adages, ${blogsReset} blog posts, ${threadsReset} forum threads\n`)

    // Summary
    const totalViews = (adageViews?.length || 0) + (blogViews?.length || 0) + (forumViews?.length || 0)
    
    console.log('📈 Backfill Summary:')
    console.log(`   Total views in database: ${totalViews}`)
    console.log(`   Adages updated: ${adagesUpdated}`)
    console.log(`   Blog posts updated: ${blogsUpdated}`)
    console.log(`   Forum threads updated: ${forumsUpdated}`)
    console.log(`   Items reset to 0: ${adagesReset + blogsReset + threadsReset}`)
    console.log('\n✅ Backfill completed successfully!')
    console.log('\n💡 Note: Going forward, views_count will be automatically updated when pages are viewed.')

  } catch (error) {
    console.error('❌ Error during backfill:', error.message)
    process.exit(1)
  }
}

backfillViewsCount().catch(console.error)

