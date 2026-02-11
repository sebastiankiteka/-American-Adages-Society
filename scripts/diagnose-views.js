// Diagnostic script to check views tracking
// Usage: node scripts/diagnose-views.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local
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
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function diagnoseViews() {
  console.log('🔍 Diagnosing views tracking...\n')

  try {
    // Check if views table exists and has data
    console.log('1️⃣ Checking views table...')
    const { data: allViews, error: viewsError, count } = await supabase
      .from('views')
      .select('*', { count: 'exact' })
      .order('viewed_at', { ascending: false })
      .limit(100)

    if (viewsError) {
      console.error('   ❌ Error querying views:', viewsError.message)
      console.error('   This might indicate RLS is blocking access or table doesn\'t exist')
    } else {
      console.log(`   ✅ Found ${count || 0} total views in database`)
      if (allViews && allViews.length > 0) {
        console.log(`   📊 Sample views (last 10):`)
        allViews.slice(0, 10).forEach((view, idx) => {
          console.log(`      ${idx + 1}. ${view.target_type} ${view.target_id} - ${new Date(view.viewed_at).toLocaleString()}`)
        })
      }
    }

    // Check views_count on adages
    console.log('\n2️⃣ Checking adages views_count...')
    const { data: adages, error: adagesError } = await supabase
      .from('adages')
      .select('id, adage, views_count')
      .is('deleted_at', null)
      .order('views_count', { ascending: false })
      .limit(10)

    if (adagesError) {
      console.error('   ❌ Error querying adages:', adagesError.message)
    } else {
      const totalAdageViews = adages?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0
      console.log(`   ✅ Total views_count across all adages: ${totalAdageViews}`)
      console.log(`   📊 Top adages by views_count:`)
      adages?.slice(0, 5).forEach((adage, idx) => {
        console.log(`      ${idx + 1}. "${adage.adage.substring(0, 50)}..." - ${adage.views_count || 0} views`)
      })
    }

    // Count actual views per adage from views table
    console.log('\n3️⃣ Counting actual views from views table...')
    const { data: adageViewRecords } = await supabase
      .from('views')
      .select('target_id')
      .eq('target_type', 'adage')

    if (adageViewRecords) {
      const viewCounts = {}
      adageViewRecords.forEach(v => {
        viewCounts[v.target_id] = (viewCounts[v.target_id] || 0) + 1
      })
      const totalActualViews = adageViewRecords.length
      console.log(`   ✅ Total adage views in views table: ${totalActualViews}`)
      console.log(`   📊 Views per adage (top 5):`)
      const sorted = Object.entries(viewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      
      for (const [adageId, count] of sorted) {
        const { data: adage } = await supabase
          .from('adages')
          .select('adage')
          .eq('id', adageId)
          .single()
        console.log(`      "${adage?.adage?.substring(0, 50) || adageId}..." - ${count} views`)
      }
    }

    // Check RLS status
    console.log('\n4️⃣ Checking RLS status on views table...')
    // Try to query as regular user to see if RLS blocks
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (anonKey) {
      const anonClient = createClient(supabaseUrl, anonKey)
      const { error: anonError } = await anonClient
        .from('views')
        .select('id', { count: 'exact', head: true })
      
      if (anonError) {
        console.log(`   ⚠️  RLS might be blocking anonymous access: ${anonError.message}`)
        console.log(`   💡 This is expected - views should be inserted via supabaseAdmin`)
      } else {
        console.log(`   ✅ Anonymous access works (RLS might not be enabled)`)
      }
    } else {
      console.log(`   ⚠️  Could not check RLS (anon key not found)`)
    }

    // Check recent activity
    console.log('\n5️⃣ Checking recent view activity...')
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const { data: recentViews, count: recentCount } = await supabase
      .from('views')
      .select('*', { count: 'exact' })
      .gte('viewed_at', oneWeekAgo.toISOString())
      .order('viewed_at', { ascending: false })
      .limit(20)

    console.log(`   ✅ Views in last 7 days: ${recentCount || 0}`)
    if (recentViews && recentViews.length > 0) {
      console.log(`   📊 Recent views:`)
      recentViews.slice(0, 5).forEach((view, idx) => {
        const date = new Date(view.viewed_at).toLocaleString()
        console.log(`      ${idx + 1}. ${view.target_type} ${view.target_id} - ${date}`)
      })
    }

    // Check unique visitors breakdown
    console.log('\n6️⃣ Checking unique visitors breakdown...')
    const { data: allViewData } = await supabase
      .from('views')
      .select('user_id, ip_address')
      .gte('viewed_at', oneWeekAgo.toISOString())

    if (allViewData) {
      const uniqueIPs = new Set()
      const uniqueUsers = new Set()
      const viewsWithIP = allViewData.filter(v => v.ip_address).length
      const viewsWithUser = allViewData.filter(v => v.user_id).length
      const viewsWithBoth = allViewData.filter(v => v.ip_address && v.user_id).length
      const viewsWithNeither = allViewData.filter(v => !v.ip_address && !v.user_id).length

      allViewData.forEach(v => {
        if (v.ip_address) uniqueIPs.add(v.ip_address)
        if (v.user_id) uniqueUsers.add(v.user_id)
      })

      console.log(`   📊 Views breakdown (last 7 days):`)
      console.log(`      Total views: ${allViewData.length}`)
      console.log(`      Views with IP address: ${viewsWithIP} (${Math.round(viewsWithIP / allViewData.length * 100)}%)`)
      console.log(`      Views with user_id: ${viewsWithUser} (${Math.round(viewsWithUser / allViewData.length * 100)}%)`)
      console.log(`      Views with both IP and user: ${viewsWithBoth}`)
      console.log(`      Views with neither: ${viewsWithNeither}`)
      console.log(`   👥 Unique visitors:`)
      console.log(`      Unique IPs: ${uniqueIPs.size}`)
      console.log(`      Unique users: ${uniqueUsers.size}`)
      console.log(`      Total unique (no double-count): ${Math.max(uniqueIPs.size, uniqueUsers.size)}`)
      
      if (viewsWithIP === 0) {
        console.log(`   ⚠️  WARNING: No IP addresses captured!`)
        console.log(`      This means unique visitor tracking relies only on logged-in users.`)
        console.log(`      In localhost/dev, IP headers might not be set.`)
      }
    }

    // Summary
    console.log('\n📋 Summary:')
    console.log(`   Total views in views table: ${count || 0}`)
    console.log(`   Total views_count on adages: ${adages?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0}`)
    console.log(`   Views in last 7 days: ${recentCount || 0}`)
    
    if ((count || 0) === 0) {
      console.log('\n⚠️  WARNING: No views found in database!')
      console.log('   Possible causes:')
      console.log('   1. Views aren\'t being tracked (check server logs for trackView errors)')
      console.log('   2. RLS is blocking inserts (should use supabaseAdmin)')
      console.log('   3. Site hasn\'t been visited yet')
      console.log('   4. API routes aren\'t being called (check if pages use API routes)')
    } else if ((count || 0) < 10) {
      console.log('\n⚠️  WARNING: Very few views found!')
      console.log('   This might indicate views aren\'t being tracked properly.')
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message)
    process.exit(1)
  }
}

diagnoseViews().catch(console.error)

