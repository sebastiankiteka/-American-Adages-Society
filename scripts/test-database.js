// Script to test database connection and verify tables exist
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  console.error('   Run: npm run setup-env')
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
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testDatabase() {
  console.log('🔍 Testing database connection...\n')

  // Test 1: Check connection
  console.log('1. Testing connection...')
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('   ❌ Connection failed:', error.message)
      return false
    }
    console.log('   ✅ Connected to Supabase successfully')
  } catch (err) {
    console.error('   ❌ Connection error:', err.message)
    return false
  }

  // Test 2: Check if key tables exist
  console.log('\n2. Checking if tables exist...')
  const requiredTables = [
    'users',
    'adages',
    'blog_posts',
    'events',
    'comments',
    'votes',
    'contact_messages',
    'mailing_list',
  ]

  const tableStatus = {}
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        tableStatus[table] = { exists: false, error: error.message }
      } else {
        tableStatus[table] = { exists: true }
      }
    } catch (err) {
      tableStatus[table] = { exists: false, error: err.message }
    }
  }

  let allExist = true
  for (const [table, status] of Object.entries(tableStatus)) {
    if (status.exists) {
      console.log(`   ✅ ${table}`)
    } else {
      console.log(`   ❌ ${table} - ${status.error}`)
      allExist = false
    }
  }

  // Test 3: Check if admin user exists
  console.log('\n3. Checking for admin user...')
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'admin')
      .is('deleted_at', null)

    if (error) {
      console.error('   ❌ Error checking users:', error.message)
    } else if (users && users.length > 0) {
      console.log(`   ✅ Found ${users.length} admin user(s):`)
      users.forEach(user => {
        console.log(`      - ${user.email} (${user.role})`)
      })
    } else {
      console.log('   ⚠️  No admin users found')
      console.log('      Run: npm run create-admin')
    }
  } catch (err) {
    console.error('   ❌ Error:', err.message)
  }

  // Test 4: Count records in key tables
  console.log('\n4. Checking data in tables...')
  const tablesToCheck = ['adages', 'blog_posts', 'events', 'contact_messages']
  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      if (error) {
        console.log(`   ⚠️  ${table}: Error counting - ${error.message}`)
      } else {
        console.log(`   📊 ${table}: ${count || 0} records`)
      }
    } catch (err) {
      console.log(`   ⚠️  ${table}: ${err.message}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (allExist) {
    console.log('✅ Database is set up and ready!')
    console.log('\n📝 Next steps:')
    console.log('   1. If no admin user exists, run: npm run create-admin')
    console.log('   2. Start adding content via admin panel')
    console.log('   3. Update frontend pages to use API routes')
  } else {
    console.log('⚠️  Some tables are missing!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run the database schema in Supabase SQL Editor')
    console.log('   2. Copy database/schema.sql and run it')
    console.log('   3. Then run this test again')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

testDatabase().catch(console.error)

