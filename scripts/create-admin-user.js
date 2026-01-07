// Script to create admin user in Supabase
// Usage: node scripts/create-admin-user.js <email> <password>

const bcrypt = require('bcryptjs')
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
  console.error('   Run: node scripts/setup-env.js first')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const email = process.argv[2] || 'sebastiankiteka@utexas.edu'
  const password = process.argv[3] || 'Admin123!ChangeMe'

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin-user.js <email> <password>')
    process.exit(1)
  }

  console.log(`Creating admin user: ${email}`)

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .is('deleted_at', null)
    .single()

  if (existing) {
    console.log(`⚠️  User ${email} already exists with role: ${existing.role}`)
    console.log('Updating to admin and setting new password...')
    
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        role: 'admin',
        email_verified: true,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating user:', error.message)
      process.exit(1)
    }

    console.log('✅ User updated successfully!')
    console.log(`   Email: ${data.email}`)
    console.log(`   Role: ${data.role}`)
    console.log(`   ID: ${data.id}`)
  } else {
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        username: email.split('@')[0],
        display_name: 'Administrator',
        role: 'admin',
        email_verified: true,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating user:', error.message)
      process.exit(1)
    }

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${data.email}`)
    console.log(`   Role: ${data.role}`)
    console.log(`   ID: ${data.id}`)
  }

  console.log('\n📝 You can now log in at http://localhost:3000/login')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log('\n⚠️  IMPORTANT: Change this password after first login!')
}

createAdminUser().catch(console.error)

