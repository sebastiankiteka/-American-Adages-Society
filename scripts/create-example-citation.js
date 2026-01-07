// Script to create an example citation for testing
// Run with: node scripts/create-example-citation.js

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

async function createExampleCitation() {
  try {
    console.log('📚 Creating example citation...')

    // Get the first available adage
    const { data: adages, error: adageError } = await supabase
      .from('adages')
      .select('id, adage')
      .is('deleted_at', null)
      .is('hidden_at', null)
      .limit(1)
      .single()

    if (adageError || !adages) {
      console.error('❌ No adages found. Please create an adage first.')
      process.exit(1)
    }

    const adage = adages
    console.log(`✓ Found adage: "${adage.adage}"`)

    // Get the first admin user to use as submitter
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .is('deleted_at', null)
      .limit(1)
      .single()

    const submittedBy = adminUser?.id || null

    // Create example citations with different source types
    const exampleCitations = [
      {
        adage_id: adage.id,
        source_text: 'Oxford Dictionary of Proverbs, 5th Edition. Oxford University Press, 2015. Pages 234-235.',
        source_url: 'https://www.oxfordreference.com/view/10.1093/acref/9780198734901.001.0001/acref-9780198734901',
        source_type: 'academic',
        submitted_by: submittedBy,
        verified: true,
      },
      {
        adage_id: adage.id,
        source_text: 'Historical Dictionary of American Slang, Volume 2. Random House, 1997. Entry on page 456.',
        source_url: 'https://example.com/historical-dictionary',
        source_type: 'historical',
        submitted_by: submittedBy,
        verified: true,
      },
      {
        adage_id: adage.id,
        source_text: 'The Penguin Dictionary of Proverbs. Penguin Books, 2006. ISBN: 978-0140515109.',
        source_url: 'https://example.com/penguin-dictionary',
        source_type: 'literary',
        submitted_by: submittedBy,
        verified: true,
      },
    ]

    console.log(`\n📝 Creating ${exampleCitations.length} example citations...`)

    for (const citation of exampleCitations) {
      const { data, error } = await supabase
        .from('citations')
        .insert(citation)
        .select()
        .single()

      if (error) {
        console.error(`❌ Error creating citation: ${error.message}`)
      } else {
        console.log(`✓ Created citation: ${data.source_type} - "${data.source_text.substring(0, 50)}..."`)
      }
    }

    console.log('\n✅ Example citations created successfully!')
    console.log(`\n📖 View them at: /citations`)
    console.log(`\n💡 The related sources section should now be visible on each citation card.`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createExampleCitation()


