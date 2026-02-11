// Backfill script to populate unique_visitors table from existing views
// Run this after applying the unique_visitors migration
// Usage: node scripts/backfill-unique-visitors.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

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

// Helper function to create a stable hash from IP + user_agent
function createVisitorHash(ip, userAgent) {
  const safeIp = ip || 'unknown'
  const safeUserAgent = userAgent || 'unknown'
  return crypto
    .createHash('sha256')
    .update(`${safeIp}|${safeUserAgent}`)
    .digest('hex')
}

async function backfillUniqueVisitors() {
  console.log('📊 Starting unique visitors backfill...\n')

  try {
    // Get all views from the views table
    // Note: user_agent column doesn't exist in views table, so we'll use IP only for hashing
    const { data: allViews, error: viewsError } = await supabase
      .from('views')
      .select('user_id, ip_address, viewed_at')
      .order('viewed_at', { ascending: true })

    if (viewsError) {
      console.error('❌ Error fetching views:', viewsError.message)
      process.exit(1)
    }

    if (!allViews || allViews.length === 0) {
      console.log('⚠️  No views found to backfill')
      return
    }

    console.log(`Found ${allViews.length} total views to process\n`)

    // Group views by unique identifier
    const visitorMap = new Map()
    let debugCount = 0

    for (const view of allViews) {
      const visitDate = new Date(view.viewed_at)
      
      // Determine unique key:
      // 1. If user_id exists → use it (logged-in user)
      // 2. Otherwise → generate hash from IP + user_agent (anonymous user)
      let derivedKey = null
      let visitorHash = null
      
      if (view.user_id) {
        // Use user_id for logged-in users
        derivedKey = `user:${view.user_id}`
      } else {
        // For anonymous users, create a stable hash from IP + user_agent
        // Note: user_agent column doesn't exist, so we'll use IP only
        const ip = view.ip_address || null
        const userAgent = null // user_agent column doesn't exist in views table
        
        // Skip if IP is missing (can't identify anonymous visitor without IP)
        if (!ip) {
          console.warn('⚠️  Skipping view with no IP address (viewed_at:', view.viewed_at, ')')
          continue
        }
        
        visitorHash = createVisitorHash(ip, userAgent)
        derivedKey = `anon:${visitorHash}`
      }
      
      // Debug logging for first 10 records
      if (debugCount < 10) {
        console.log({
          ip: view.ip_address || 'unknown',
          userAgent: '(not available - column does not exist)',
          userId: view.user_id || '(anonymous)',
          derivedKey: derivedKey
        })
        debugCount++
      }
      
      if (visitorMap.has(derivedKey)) {
        const visitor = visitorMap.get(derivedKey)
        visitor.last_visit = visitDate
        visitor.visit_count++
        if (visitDate < visitor.first_visit) {
          visitor.first_visit = visitDate
        }
      } else {
        visitorMap.set(derivedKey, {
          user_id: view.user_id,
          ip_address: view.ip_address || 'unknown',
          visitor_hash: visitorHash, // Store hash for anonymous visitors
          first_visit: visitDate,
          last_visit: visitDate,
          visit_count: 1,
        })
      }
    }

    console.log(`Found ${visitorMap.size} unique visitors\n`)

    // Insert or update unique visitors
    let inserted = 0
    let updated = 0
    let errors = 0

    for (const [key, visitor] of visitorMap.entries()) {
      try {
        // Check if visitor already exists
        let query = supabase.from('unique_visitors').select('id')
        
        if (visitor.user_id) {
          // For logged-in users, match by user_id
          query = query.eq('user_id', visitor.user_id)
        } else {
          // For anonymous users, construct the IP+hash string to match
          // This ensures we match visitors that were inserted with the hash
          const ipToMatch = visitor.visitor_hash 
            ? `${visitor.ip_address || 'unknown'}_${visitor.visitor_hash.substring(0, 16)}`
            : (visitor.ip_address || 'unknown')
          
          // Try to match by the full IP+hash string
          query = query.eq('ip_address', ipToMatch).is('user_id', null)
        }

        const { data: existing, error: queryError } = await query.single()

        // If queryError and it's not a "not found" error, log it
        if (queryError && queryError.code !== 'PGRST116') {
          console.error(`   ⚠️  Query error for visitor ${key}:`, queryError.message)
        }

        if (existing && !queryError) {
          // Update existing visitor
          const { error: updateError } = await supabase
            .from('unique_visitors')
            .update({
              first_visit_at: visitor.first_visit.toISOString(),
              last_visit_at: visitor.last_visit.toISOString(),
              total_visits: visitor.visit_count,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          if (updateError) {
            console.error(`   ❌ Error updating visitor ${key}:`, updateError.message)
            errors++
          } else {
            updated++
            if (updated % 10 === 0) {
              console.log(`   ✅ Updated ${updated} visitors...`)
            }
          }
        } else {
          // Insert new visitor
          // For anonymous visitors with a hash, store the hash in ip_address by appending it
          // This allows us to distinguish between different anonymous visitors from the same IP
          const ipToStore = visitor.visitor_hash 
            ? `${visitor.ip_address || 'unknown'}_${visitor.visitor_hash.substring(0, 16)}`
            : (visitor.ip_address || 'unknown')
          
          const { error: insertError } = await supabase
            .from('unique_visitors')
            .insert({
              user_id: visitor.user_id,
              ip_address: ipToStore,
              first_visit_at: visitor.first_visit.toISOString(),
              last_visit_at: visitor.last_visit.toISOString(),
              total_visits: visitor.visit_count,
            })

          if (insertError) {
            console.error(`   ❌ Error inserting visitor ${key}:`, insertError.message)
            errors++
          } else {
            inserted++
            if (inserted % 10 === 0) {
              console.log(`   ✅ Inserted ${inserted} visitors...`)
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Error processing visitor ${key}:`, error.message)
        errors++
      }
    }

    console.log('\n--- Backfill Summary ---')
    console.log(`Total unique visitors found: ${visitorMap.size}`)
    console.log(`New visitors inserted: ${inserted}`)
    console.log(`Existing visitors updated: ${updated}`)
    console.log(`Errors: ${errors}`)
    console.log('📊 Unique visitors backfill complete!')
  } catch (error) {
    console.error('❌ Error during backfill:', error)
    process.exit(1)
  }
}

backfillUniqueVisitors().catch(console.error)


