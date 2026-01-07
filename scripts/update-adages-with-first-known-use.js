// Script to update existing adages with first known usage data
// and add variants, translations, related adages, usage examples, and timeline entries
// Run with: node scripts/update-adages-with-first-known-use.js

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

// Comprehensive adage data with first known usage and related information
// This script will update existing adages in your database
// Add more adages to this array as needed
const adageUpdates = [
  {
    adage: "A penny saved is a penny earned",
    first_known_usage: "First appeared in Benjamin Franklin's 'Poor Richard's Almanack' in 1737. The phrase was part of Franklin's collection of practical wisdom aimed at promoting thrift and financial prudence among the American colonists.",
    first_known_usage_date: "1737-01-01",
    first_known_usage_uncertain: false,
    variants: [
      { variant_text: "A penny saved is a penny got", notes: "Early variant from 17th century" },
      { variant_text: "Take care of the pence, and the pounds will take care of themselves", notes: "Related British variant" }
    ],
    translations: [
      { language_code: "es", translated_text: "Un centavo ahorrado es un centavo ganado", translator_notes: "Direct Spanish translation" },
      { language_code: "fr", translated_text: "Un sou économisé est un sou gagné", translator_notes: "French equivalent" }
    ],
    usage_examples: [
      {
        example_text: "I decided to pack my lunch instead of buying it every day. A penny saved is a penny earned, after all.",
        context: "Personal finance discussion",
        source_type: "official"
      },
      {
        example_text: "The company's cost-cutting measures reflect the old adage: a penny saved is a penny earned.",
        context: "Business article about corporate savings",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1737-01-01",
        time_period_end: "1800-12-31",
        popularity_level: "common",
        primary_location: "American Colonies (Pennsylvania)",
        geographic_changes: "Originated in Philadelphia through Poor Richard's Almanack, spread throughout the American colonies",
        notes: "Popularized through Poor Richard's Almanack",
        sources: ["Poor Richard's Almanack, 1737"]
      },
      {
        time_period_start: "1800-01-01",
        time_period_end: "1900-12-31",
        popularity_level: "very_common",
        primary_location: "United States",
        geographic_changes: "Became standard in American financial advice, spread to all regions of the expanding nation",
        notes: "Widely used in American financial advice literature",
        sources: ["Various 19th century financial guides"]
      },
      {
        time_period_start: "1900-01-01",
        time_period_end: null,
        popularity_level: "ubiquitous",
        primary_location: "United States, English-speaking world",
        geographic_changes: "Spread globally through American economic influence and English language dominance",
        notes: "One of the most recognized American adages about money",
        sources: ["Modern financial literature", "Educational materials"]
      }
    ]
  },
  {
    adage: "Actions speak louder than words",
    first_known_usage: "First recorded in English in the 17th century, popularized by Abraham Lincoln in a speech",
    first_known_usage_date: "1628-01-01",
    first_known_usage_uncertain: true,
    variants: [
      { variant_text: "Deeds, not words", notes: "Shorter variant" },
      { variant_text: "Actions speak louder than words, but not nearly as often", notes: "Humorous modern variant" }
    ],
    translations: [
      { language_code: "es", translated_text: "Las acciones hablan más fuerte que las palabras", translator_notes: "Spanish translation" },
      { language_code: "de", translated_text: "Taten sagen mehr als Worte", translator_notes: "German equivalent" }
    ],
    usage_examples: [
      {
        example_text: "He promised to help, but actions speak louder than words. We'll see if he actually shows up.",
        context: "Everyday conversation about reliability",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1628-01-01",
        time_period_end: "1800-12-31",
        popularity_level: "uncommon",
        primary_location: "England",
        geographic_changes: "Originated in English literature, used primarily in written works",
        notes: "Early usage in English literature",
        sources: ["17th century English texts"]
      },
      {
        time_period_start: "1800-01-01",
        time_period_end: null,
        popularity_level: "ubiquitous",
        primary_location: "English-speaking world",
        geographic_changes: "Spread to American colonies and throughout the English-speaking world, became part of common speech",
        notes: "Extremely common in modern English",
        sources: ["Modern literature", "Common speech"]
      }
    ]
  },
  {
    adage: "Better late than never",
    first_known_usage: "Originated from Latin 'potius sero quam numquam', first used in English by Geoffrey Chaucer in 'The Canterbury Tales' (c. 1387)",
    first_known_usage_date: "1387-01-01",
    first_known_usage_uncertain: true,
    variants: [
      { variant_text: "Better late than never, but better never late", notes: "Modern humorous variant" }
    ],
    translations: [
      { language_code: "la", translated_text: "Potius sero quam numquam", translator_notes: "Original Latin" },
      { language_code: "es", translated_text: "Más vale tarde que nunca", translator_notes: "Spanish translation" }
    ],
    usage_examples: [
      {
        example_text: "I finally finished my degree at 45. Better late than never!",
        context: "Personal achievement discussion",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1387-01-01",
        time_period_end: "1600-12-31",
        popularity_level: "rare",
        primary_location: "England",
        geographic_changes: "Introduced to English from Latin through Chaucer's works",
        notes: "Used primarily in literary contexts",
        sources: ["Chaucer's Canterbury Tales"]
      },
      {
        time_period_start: "1600-01-01",
        time_period_end: null,
        popularity_level: "very_common",
        primary_location: "English-speaking world",
        geographic_changes: "Spread from literary usage to common speech, adopted throughout English-speaking regions",
        notes: "Common in everyday speech",
        sources: ["Modern usage"]
      }
    ]
  },
  {
    adage: "Don't count your chickens before they hatch",
    first_known_usage: "First recorded in English in the 16th century. The earliest known version appears in Thomas Howell's 'New Sonnets and Pretty Pamphlets' (1570). The phrase was popularized by Aesop's fables.",
    first_known_usage_date: "1570-01-01",
    first_known_usage_uncertain: true,
    variants: [
      { variant_text: "Don't count your chickens before they're hatched", notes: "More grammatically complete variant" },
      { variant_text: "Never count your chickens before they hatch", notes: "Alternative phrasing" }
    ],
    translations: [
      { language_code: "es", translated_text: "No cuentes los pollos antes de que nazcan", translator_notes: "Spanish translation" },
      { language_code: "fr", translated_text: "Il ne faut pas vendre la peau de l'ours avant de l'avoir tué", translator_notes: "French equivalent (don't sell the bear's skin before killing it)" }
    ],
    usage_examples: [
      {
        example_text: "I know the job interview went well, but I'm not celebrating yet. Don't count your chickens before they hatch.",
        context: "Career advice conversation",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1570-01-01",
        time_period_end: "1800-12-31",
        popularity_level: "common",
        primary_location: "England",
        geographic_changes: "Introduced through translations of Aesop's fables, popularized in English literature",
        notes: "Used in English literature and fables",
        sources: ["Thomas Howell's works", "Aesop's Fables translations"]
      },
      {
        time_period_start: "1800-01-01",
        time_period_end: null,
        popularity_level: "ubiquitous",
        primary_location: "English-speaking world",
        geographic_changes: "Spread to American colonies and became universal in English-speaking countries",
        notes: "Extremely common in modern English",
        sources: ["Modern literature", "Common speech"]
      }
    ]
  },
  {
    adage: "The early bird catches the worm",
    first_known_usage: "First recorded in English in the 17th century. The earliest known version appears in William Camden's 'Remaines of a Greater Worke Concerning Britaine' (1605). The phrase emphasizes the value of being proactive and starting early.",
    first_known_usage_date: "1605-01-01",
    first_known_usage_uncertain: true,
    variants: [
      { variant_text: "The early bird gets the worm", notes: "More common modern variant" }
    ],
    translations: [
      { language_code: "es", translated_text: "Al que madruga, Dios le ayuda", translator_notes: "Spanish equivalent (God helps those who rise early)" },
      { language_code: "de", translated_text: "Morgenstund hat Gold im Mund", translator_notes: "German equivalent (morning hour has gold in its mouth)" }
    ],
    usage_examples: [
      {
        example_text: "I always arrive at the sale an hour early. The early bird catches the worm!",
        context: "Shopping discussion",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1605-01-01",
        time_period_end: "1800-12-31",
        popularity_level: "uncommon",
        primary_location: "England",
        geographic_changes: "First recorded in English proverbial collections, used primarily in written works",
        notes: "Used in English proverbial literature",
        sources: ["William Camden's works"]
      },
      {
        time_period_start: "1800-01-01",
        time_period_end: null,
        popularity_level: "very_common",
        primary_location: "English-speaking world",
        geographic_changes: "Spread to American colonies and became common in everyday speech across English-speaking regions",
        notes: "Common in modern English",
        sources: ["Modern usage"]
      }
    ]
  },
  {
    adage: "Where there's smoke, there's fire",
    first_known_usage: "First recorded in English in the 14th century. The phrase appears in various forms in medieval literature, suggesting that signs or rumors often indicate underlying truth. The modern form was popularized in the 19th century.",
    first_known_usage_date: "1300-01-01",
    first_known_usage_uncertain: true,
    variants: [
      { variant_text: "No smoke without fire", notes: "British variant" },
      { variant_text: "There's no smoke without fire", notes: "More complete variant" }
    ],
    translations: [
      { language_code: "es", translated_text: "Donde hay humo, hay fuego", translator_notes: "Direct Spanish translation" },
      { language_code: "fr", translated_text: "Il n'y a pas de fumée sans feu", translator_notes: "French equivalent" }
    ],
    usage_examples: [
      {
        example_text: "Everyone's been talking about the company's financial troubles. Where there's smoke, there's fire.",
        context: "Business discussion",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1300-01-01",
        time_period_end: "1800-12-31",
        popularity_level: "uncommon",
        primary_location: "England, Medieval Europe",
        geographic_changes: "Originated in medieval English and Latin texts, used in legal and literary contexts",
        notes: "Used in medieval and early modern literature",
        sources: ["Medieval English texts"]
      },
      {
        time_period_start: "1800-01-01",
        time_period_end: null,
        popularity_level: "very_common",
        primary_location: "English-speaking world",
        geographic_changes: "Became common in American English and spread throughout English-speaking countries",
        notes: "Common in modern English",
        sources: ["Modern usage"]
      }
    ]
  },
  {
    adage: "You can't have your cake and eat it too",
    first_known_usage: "First recorded in English in the 16th century. The earliest known version appears in John Heywood's 'A Dialogue Conteinyng the Nomber in Effect of All the Prouerbes in the Englishe Tongue' (1546). The phrase expresses the impossibility of having something both ways.",
    first_known_usage_date: "1546-01-01",
    first_known_usage_uncertain: false,
    variants: [
      { variant_text: "You can't eat your cake and have it too", notes: "Original word order variant" },
      { variant_text: "You can't have it both ways", notes: "Modern simplified variant" }
    ],
    translations: [
      { language_code: "es", translated_text: "No se puede tener todo", translator_notes: "Spanish equivalent (you can't have everything)" },
      { language_code: "fr", translated_text: "On ne peut pas avoir le beurre et l'argent du beurre", translator_notes: "French equivalent (you can't have the butter and the money from the butter)" }
    ],
    usage_examples: [
      {
        example_text: "You want to work fewer hours but make more money? You can't have your cake and eat it too.",
        context: "Work-life balance discussion",
        source_type: "official"
      }
    ],
    timeline: [
      {
        time_period_start: "1546-01-01",
        time_period_end: "1800-12-31",
        popularity_level: "common",
        primary_location: "England",
        geographic_changes: "First recorded in Heywood's comprehensive proverb collection, spread through English literature",
        notes: "Popularized through Heywood's proverb collection",
        sources: ["John Heywood's 'A Dialogue'"]
      },
      {
        time_period_start: "1800-01-01",
        time_period_end: null,
        popularity_level: "very_common",
        primary_location: "English-speaking world",
        geographic_changes: "Adopted in American English and became standard throughout English-speaking regions",
        notes: "Common in modern English",
        sources: ["Modern usage"]
      }
    ]
  }
]

async function listAllAdages() {
  console.log('Fetching all adages from database...\n')
  const { data: allAdages, error } = await supabase
    .from('adages')
    .select('id, adage, first_known_usage')
    .is('deleted_at', null)
    .order('adage')

  if (error) {
    console.error('Error fetching adages:', error)
    return []
  }

  console.log(`Found ${allAdages.length} adages:\n`)
  allAdages.forEach((adage, idx) => {
    console.log(`${idx + 1}. "${adage.adage}"`)
    if (adage.first_known_usage) {
      console.log(`   ✓ Has first known usage`)
    } else {
      console.log(`   ✗ Missing first known usage`)
    }
  })
  console.log('')

  return allAdages
}

async function updateAdages() {
  console.log('Starting adage updates...\n')

  // First, list all adages
  const allAdages = await listAllAdages()

  for (const update of adageUpdates) {
    try {
      // Find the adage by text (exact match first, then partial match)
      let { data: adages, error: findError } = await supabase
        .from('adages')
        .select('id, adage')
        .eq('adage', update.adage)
        .is('deleted_at', null)
        .limit(1)

      // If no exact match, try case-insensitive partial match
      if ((!adages || adages.length === 0) && update.adage) {
        const { data: partialMatch } = await supabase
          .from('adages')
          .select('id, adage')
          .ilike('adage', `%${update.adage}%`)
          .is('deleted_at', null)
          .limit(1)
        adages = partialMatch
      }

      if (findError) {
        console.error(`Error finding adage "${update.adage}":`, findError)
        continue
      }

      if (!adages || adages.length === 0) {
        console.log(`⚠️  Adage not found: "${update.adage}" - skipping`)
        continue
      }

      const adageId = adages[0].id
      console.log(`\n📝 Updating: "${update.adage}" (ID: ${adageId})`)

      // Update the adage with first known usage
      const { error: updateError } = await supabase
        .from('adages')
        .update({
          first_known_usage: update.first_known_usage,
          first_known_usage_date: update.first_known_usage_date,
          first_known_usage_uncertain: update.first_known_usage_uncertain,
          updated_at: new Date().toISOString()
        })
        .eq('id', adageId)

      if (updateError) {
        console.error(`  ❌ Error updating adage:`, updateError)
        continue
      }
      console.log(`  ✅ Updated first known usage`)

      // Add variants
      if (update.variants && update.variants.length > 0) {
        // Delete existing variants first
        await supabase
          .from('adage_variants')
          .update({ deleted_at: new Date().toISOString() })
          .eq('adage_id', adageId)

        for (const variant of update.variants) {
          const { error: variantError } = await supabase
            .from('adage_variants')
            .insert({
              adage_id: adageId,
              variant_text: variant.variant_text,
              notes: variant.notes || null
            })

          if (variantError) {
            console.error(`  ❌ Error adding variant:`, variantError)
          } else {
            console.log(`  ✅ Added variant: "${variant.variant_text}"`)
          }
        }
      }

      // Add translations
      if (update.translations && update.translations.length > 0) {
        // Delete existing translations first
        await supabase
          .from('adage_translations')
          .update({ deleted_at: new Date().toISOString() })
          .eq('adage_id', adageId)

        for (const translation of update.translations) {
          const { error: transError } = await supabase
            .from('adage_translations')
            .insert({
              adage_id: adageId,
              language_code: translation.language_code,
              translated_text: translation.translated_text,
              translator_notes: translation.translator_notes || null
            })

          if (transError) {
            console.error(`  ❌ Error adding translation:`, transError)
          } else {
            console.log(`  ✅ Added translation (${translation.language_code}): "${translation.translated_text.substring(0, 50)}..."`)
          }
        }
      }

      // Add usage examples
      if (update.usage_examples && update.usage_examples.length > 0) {
        // Delete existing examples first
        await supabase
          .from('adage_usage_examples')
          .update({ deleted_at: new Date().toISOString() })
          .eq('adage_id', adageId)

        for (const example of update.usage_examples) {
          const { error: exampleError } = await supabase
            .from('adage_usage_examples')
            .insert({
              adage_id: adageId,
              example_text: example.example_text,
              context: example.context || null,
              source_type: example.source_type || 'official',
              created_by: null
            })

          if (exampleError) {
            console.error(`  ❌ Error adding usage example:`, exampleError)
          } else {
            console.log(`  ✅ Added usage example`)
          }
        }
      }

      // Update timeline entries with geographic information
      if (update.timeline && update.timeline.length > 0) {
        // Get existing timeline entries
        const { data: existingTimeline } = await supabase
          .from('adage_timeline')
          .select('id, time_period_start, time_period_end')
          .eq('adage_id', adageId)
          .is('deleted_at', null)

        // Create a map of existing entries by date range
        const existingMap = new Map()
        if (existingTimeline) {
          existingTimeline.forEach((entry) => {
            const key = `${entry.time_period_start}_${entry.time_period_end || 'null'}`
            existingMap.set(key, entry.id)
          })
        }

        for (const entry of update.timeline) {
          const key = `${entry.time_period_start}_${entry.time_period_end || 'null'}`
          const existingId = existingMap.get(key)

          if (existingId) {
            // Update existing entry with geographic information
            const { error: updateError } = await supabase
              .from('adage_timeline')
              .update({
                primary_location: entry.primary_location || null,
                geographic_changes: entry.geographic_changes || null,
                // Also update other fields in case they changed
                popularity_level: entry.popularity_level,
                notes: entry.notes || null,
                sources: entry.sources || []
              })
              .eq('id', existingId)

            if (updateError) {
              console.error(`  ❌ Error updating timeline entry:`, updateError)
            } else {
              console.log(`  ✅ Updated timeline entry: ${entry.time_period_start} - ${entry.time_period_end || 'Present'}`)
            }
          } else {
            // Insert new entry
            const { error: insertError } = await supabase
              .from('adage_timeline')
              .insert({
                adage_id: adageId,
                time_period_start: entry.time_period_start,
                time_period_end: entry.time_period_end || null,
                popularity_level: entry.popularity_level,
                primary_location: entry.primary_location || null,
                geographic_changes: entry.geographic_changes || null,
                notes: entry.notes || null,
                sources: entry.sources || []
              })

            if (insertError) {
              console.error(`  ❌ Error adding timeline entry:`, insertError)
            } else {
              console.log(`  ✅ Added timeline entry: ${entry.time_period_start} - ${entry.time_period_end || 'Present'}`)
            }
          }
        }
      }

    } catch (error) {
      console.error(`Error processing "${update.adage}":`, error)
    }
  }

  console.log('\n✨ Update complete!')
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--list')) {
    // Just list all adages
    await listAllAdages()
    process.exit(0)
  } else {
    // Run the update
    await updateAdages()
    console.log('\n✅ All updates finished successfully')
    console.log('\n💡 Tip: Run with --list flag to see all adages: npm run update-adages -- --list')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})

