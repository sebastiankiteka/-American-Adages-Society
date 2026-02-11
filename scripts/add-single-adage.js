/**
 * Script to add a single adage: "Put that in your back pocket for a rainy day"
 * Run with: node scripts/add-single-adage.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const newAdage = {
  adage: "Put that in your back pocket for a rainy day",
  definition: "Save something (an idea, piece of advice, or resource) for future use when it might be needed. This phrase suggests keeping something valuable in reserve for difficult times or unexpected situations.",
  origin: "This American idiom combines two metaphorical concepts: 'back pocket' (something kept close and ready) and 'rainy day' (a time of difficulty or need). The phrase became popular in the 20th century, particularly in American English, as a way to express the wisdom of saving resources or ideas for future challenges.",
  etymology: "The phrase merges two common metaphors: 'back pocket' refers to keeping something easily accessible and close at hand, while 'rainy day' is a long-standing metaphor for times of hardship or financial difficulty. Together, they create an image of prudent preparation and resourcefulness.",
  historical_context: "This adage reflects American values of preparedness, thrift, and forward-thinking. It became particularly popular during times of economic uncertainty, when saving resources for difficult times was both practical and culturally valued. The phrase emphasizes the importance of being prepared for future challenges.",
  interpretation: "The saying encourages saving valuable ideas, advice, or resources for times when they will be most useful. It suggests that wisdom and preparation are assets that should be preserved and drawn upon when needed, rather than used immediately or forgotten.",
  modern_practicality: "In modern contexts, this phrase is often used to suggest saving money, advice, or strategies for future use. It's particularly relevant in personal finance, career planning, and strategic thinking. The adage reminds us that not everything valuable needs to be used immediately—some things are best kept in reserve.",
  first_known_usage: "The phrase became common in American English during the mid-20th century, combining the established metaphors of 'back pocket' and 'rainy day' into a single expression of prudent preparation.",
  first_known_usage_date: "1950-01-01",
  first_known_usage_uncertain: true,
  tags: ["wisdom", "preparation", "thrift", "resourcefulness"],
  type: "adage",
  advisory: true,
}

async function getAdminUser() {
  const { data: admins, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .is('deleted_at', null)
    .limit(1)

  if (error || !admins || admins.length === 0) {
    console.warn('⚠️  No admin user found, creating adage without created_by')
    return null
  }

  return admins[0].id
}

async function addAdage() {
  console.log(`\n📝 Adding adage: "${newAdage.adage}"`)
  
  // Check if adage already exists
  const { data: existing } = await supabase
    .from('adages')
    .select('id, adage')
    .eq('adage', newAdage.adage)
    .is('deleted_at', null)
    .maybeSingle()

  const adminId = await getAdminUser()

  if (existing) {
    console.log(`⚠️  Adage already exists with ID: ${existing.id}`)
    console.log('   Skipping addition.')
    return existing.id
  }

  // Create the adage
  const { data: adage, error: adageError } = await supabase
    .from('adages')
    .insert({
      adage: newAdage.adage,
      definition: newAdage.definition,
      origin: newAdage.origin || null,
      etymology: newAdage.etymology || null,
      historical_context: newAdage.historical_context || null,
      interpretation: newAdage.interpretation || null,
      modern_practicality: newAdage.modern_practicality || null,
      first_known_usage: newAdage.first_known_usage || null,
      first_known_usage_date: newAdage.first_known_usage_date || null,
      first_known_usage_uncertain: newAdage.first_known_usage_uncertain || false,
      tags: newAdage.tags || [],
      type: newAdage.type || 'adage',
      advisory: newAdage.advisory !== undefined ? newAdage.advisory : true,
      created_by: adminId,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (adageError) {
    console.error(`❌ Error creating adage:`, adageError)
    return null
  }

  console.log(`✅ Created adage with ID: ${adage.id}`)
  return adage.id
}

async function main() {
  console.log('🚀 Adding adage to database...\n')

  const adageId = await addAdage()

  if (adageId) {
    console.log('\n✅ Adage added successfully!')
  } else {
    console.log('\n❌ Failed to add adage')
    process.exit(1)
  }
}

main().catch(console.error)

