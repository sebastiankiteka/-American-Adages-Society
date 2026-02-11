/**
 * Script to add 20 new adages (Tier 1 and Tier 2) to the database
 * All adages will be added with type="adage"
 * Run with: node scripts/add-taxonomy-adages.js
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

// Tier 1 Adages
const tier1Adages = [
  {
    adage: "A stitch in time saves nine",
    definition: "Taking action early to fix a small problem prevents it from becoming a larger, more difficult problem later.",
    tags: ["wisdom", "prevention", "efficiency"],
  },
  {
    adage: "Actions speak louder than words",
    definition: "What people do is more important and revealing than what they say.",
    tags: ["wisdom", "character", "behavior"],
  },
  {
    adage: "Look before you leap",
    definition: "Think carefully before taking action or making a decision.",
    tags: ["wisdom", "caution", "decision-making"],
  },
  {
    adage: "Measure twice, cut once",
    definition: "Plan carefully and double-check before taking action to avoid mistakes.",
    tags: ["wisdom", "preparation", "precision"],
  },
  {
    adage: "You reap what you sow",
    definition: "Your actions determine your outcomes; good actions lead to good results, bad actions lead to bad results.",
    tags: ["wisdom", "consequence", "karma"],
  },
  {
    adage: "Don't count your chickens before they hatch",
    definition: "Don't assume success or make plans based on something that hasn't happened yet.",
    tags: ["wisdom", "caution", "expectation"],
  },
  {
    adage: "Fortune favors the bold",
    definition: "People who take risks and act courageously are more likely to succeed.",
    tags: ["wisdom", "courage", "risk"],
  },
  {
    adage: "Honesty is the best policy",
    definition: "Being truthful and straightforward is the best approach in the long run.",
    tags: ["wisdom", "ethics", "character"],
  },
  {
    adage: "Where there's a will, there's a way",
    definition: "If someone is determined enough, they will find a way to achieve their goal.",
    tags: ["wisdom", "determination", "perseverance"],
  },
  {
    adage: "Necessity is the mother of invention",
    definition: "When people need something badly enough, they will find a way to create or obtain it.",
    tags: ["wisdom", "innovation", "problem-solving"],
  },
]

// Tier 2 Adages
const tier2Adages = [
  {
    adage: "If it ain't broke, don't fix it",
    definition: "If something is working well, don't change it unnecessarily.",
    tags: ["wisdom", "pragmatism", "conservation"],
  },
  {
    adage: "The squeaky wheel gets the grease",
    definition: "People who complain or make their needs known are more likely to get attention and help.",
    tags: ["wisdom", "advocacy", "communication"],
  },
  {
    adage: "Time is money",
    definition: "Time is valuable and should be used efficiently, just like money.",
    tags: ["wisdom", "efficiency", "value"],
  },
  {
    adage: "Nothing ventured, nothing gained",
    definition: "You can't achieve anything without taking risks or making an effort.",
    tags: ["wisdom", "risk", "opportunity"],
  },
  {
    adage: "Don't put all your eggs in one basket",
    definition: "Don't risk everything on a single venture; diversify your investments or efforts.",
    tags: ["wisdom", "risk-management", "diversification"],
  },
  {
    adage: "Speak softly and carry a big stick",
    definition: "Be diplomatic and peaceful in approach, but maintain strength and the ability to act forcefully if necessary.",
    tags: ["wisdom", "diplomacy", "strength"],
  },
  {
    adage: "The proof is in the pudding",
    definition: "The real value or quality of something can only be determined by testing or experiencing it.",
    tags: ["wisdom", "evaluation", "testing"],
  },
  {
    adage: "Every dog has its day",
    definition: "Everyone will have their moment of success or good fortune eventually.",
    tags: ["wisdom", "optimism", "opportunity"],
  },
  {
    adage: "Still waters run deep",
    definition: "Quiet or reserved people often have deep thoughts, strong emotions, or hidden qualities.",
    tags: ["wisdom", "character", "depth"],
  },
  {
    adage: "Penny wise and pound foolish",
    definition: "Being careful with small amounts of money while being wasteful with large amounts; focusing on minor savings while ignoring major expenses.",
    tags: ["wisdom", "finance", "judgment"],
  },
]

async function getAdminUser() {
  const { data: admins, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .is('deleted_at', null)
    .limit(1)

  if (error || !admins || admins.length === 0) {
    console.warn('⚠️  No admin user found, creating adages without created_by')
    return null
  }

  return admins[0].id
}

async function addAdage(adageData, tier) {
  console.log(`\n📝 [Tier ${tier}] Adding adage: "${adageData.adage}"`)
  
  // Check if adage already exists
  const { data: existing } = await supabase
    .from('adages')
    .select('id, adage')
    .eq('adage', adageData.adage)
    .is('deleted_at', null)
    .maybeSingle()

  const adminId = await getAdminUser()

  if (existing) {
    console.log(`⚠️  Adage already exists with ID: ${existing.id} - skipping`)
    return existing.id
  }

  // Create the adage
  const { data: adage, error: adageError } = await supabase
    .from('adages')
    .insert({
      adage: adageData.adage,
      definition: adageData.definition,
      type: 'adage', // Explicitly set type
      tags: adageData.tags || [],
      created_by: adminId,
      published_at: new Date().toISOString(),
      advisory: true, // Adages are advisory by nature
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
  console.log('🚀 Starting to add taxonomy adages...\n')
  console.log(`📊 Tier 1: ${tier1Adages.length} adages`)
  console.log(`📊 Tier 2: ${tier2Adages.length} adages\n`)

  let tier1Count = 0
  let tier2Count = 0

  // Add Tier 1 adages
  console.log('='.repeat(60))
  console.log('TIER 1 ADAGES')
  console.log('='.repeat(60))
  for (const adageData of tier1Adages) {
    const id = await addAdage(adageData, 1)
    if (id) tier1Count++
  }

  // Add Tier 2 adages
  console.log('\n' + '='.repeat(60))
  console.log('TIER 2 ADAGES')
  console.log('='.repeat(60))
  for (const adageData of tier2Adages) {
    const id = await addAdage(adageData, 2)
    if (id) tier2Count++
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ FINISHED')
  console.log('='.repeat(60))
  console.log(`Tier 1: ${tier1Count} adages added`)
  console.log(`Tier 2: ${tier2Count} adages added`)
  console.log(`Total: ${tier1Count + tier2Count} adages added`)
}

main().catch(console.error)

