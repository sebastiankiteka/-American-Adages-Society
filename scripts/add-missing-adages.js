// Script to add missing adages: "Where there's smoke, there's fire" and "You can't have your cake and eat it too"
// Run with: node scripts/add-missing-adages.js

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

// Adage data to add
const newAdages = [
  {
    adage: "Where there's smoke, there's fire",
    definition: "Signs or rumors often indicate an underlying truth. If there are indications that something is happening, it likely is.",
    origin: "First recorded in English in the 14th century. The phrase appears in various forms in medieval literature, suggesting that signs or rumors often indicate underlying truth. The modern form was popularized in the 19th century.",
    etymology: "The phrase comes from the literal observation that smoke is a visible sign of fire. This natural relationship between cause and effect was applied metaphorically to suggest that visible signs or rumors often indicate underlying truths or problems.",
    historical_context: "This adage has been used throughout history in legal, social, and political contexts to suggest that persistent rumors or signs often have a basis in fact. It reflects a pragmatic approach to evaluating information and has been particularly valued in contexts where direct evidence is difficult to obtain.",
    interpretation: "The saying suggests that observable signs, patterns, or persistent rumors should be taken seriously, as they often indicate underlying realities. It encourages paying attention to circumstantial evidence and patterns rather than dismissing them outright.",
    modern_practicality: "In modern contexts, this adage is often cited in journalism, business, and personal relationships to encourage investigating persistent rumors or patterns. However, it also serves as a reminder to verify information rather than accepting rumors at face value. It's particularly relevant in evaluating organizational culture, business practices, and social situations.",
    first_known_usage: "First recorded in English in the 14th century. The phrase appears in various forms in medieval literature, suggesting that signs or rumors often indicate underlying truth. The modern form was popularized in the 19th century.",
    first_known_usage_date: "1300-01-01",
    first_known_usage_uncertain: true,
    tags: ["wisdom", "observation", "truth"],
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
    definition: "You cannot have or keep something and also use it up or consume it. You cannot have something both ways; you must choose one option or the other.",
    origin: "First recorded in English in the 16th century. The earliest known version appears in John Heywood's 'A Dialogue Conteinyng the Nomber in Effect of All the Prouerbes in the Englishe Tongue' (1546). The phrase expresses the impossibility of having something both ways.",
    etymology: "The phrase comes from the literal impossibility of both possessing a cake and consuming it simultaneously. Once you eat the cake, you no longer have it. The original word order was 'You can't eat your cake and have it too,' which makes the logical contradiction more apparent.",
    historical_context: "This adage has been used throughout history to express the fundamental truth that certain choices are mutually exclusive. It reflects the value placed on making clear decisions and accepting the consequences of those choices. The phrase has been particularly relevant in contexts involving trade-offs, whether in economics, relationships, or personal decisions.",
    interpretation: "The saying emphasizes that life often requires choosing between mutually exclusive options. It suggests that wanting contradictory outcomes is unrealistic and that maturity involves recognizing and accepting the limitations of choice.",
    modern_practicality: "In modern contexts, this adage is frequently cited in discussions about work-life balance, financial decisions, and personal priorities. It reminds us that many desirable outcomes are mutually exclusive and that effective decision-making requires acknowledging trade-offs. It's particularly relevant in discussions about time management, resource allocation, and personal values.",
    first_known_usage: "First recorded in English in the 16th century. The earliest known version appears in John Heywood's 'A Dialogue Conteinyng the Nomber in Effect of All the Prouerbes in the Englishe Tongue' (1546). The phrase expresses the impossibility of having something both ways.",
    first_known_usage_date: "1546-01-01",
    first_known_usage_uncertain: false,
    tags: ["wisdom", "choice", "impossibility"],
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

async function getAdminUser() {
  // Get the first admin user to use as created_by
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

async function addAdage(adageData) {
  console.log(`\n📝 Adding adage: "${adageData.adage}"`)
  
  // Check if adage already exists
  const { data: existing } = await supabase
    .from('adages')
    .select('id, adage')
    .eq('adage', adageData.adage)
    .is('deleted_at', null)
    .single()

  const adminId = await getAdminUser()

  if (existing) {
    console.log(`⚠️  Adage already exists with ID: ${existing.id} - updating with complete data...`)
    
    // Update the existing adage with complete data
    const { error: updateError } = await supabase
      .from('adages')
      .update({
        definition: adageData.definition,
        origin: adageData.origin || null,
        etymology: adageData.etymology || null,
        historical_context: adageData.historical_context || null,
        interpretation: adageData.interpretation || null,
        modern_practicality: adageData.modern_practicality || null,
        first_known_usage: adageData.first_known_usage || null,
        first_known_usage_date: adageData.first_known_usage_date || null,
        first_known_usage_uncertain: adageData.first_known_usage_uncertain || false,
        tags: adageData.tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error(`❌ Error updating adage:`, updateError)
      return existing.id
    }

    console.log(`✅ Updated adage with complete data`)
    
    // Use existing adage ID and continue to add variants, translations, etc.
    const adage = { id: existing.id }
    
    // Add variants (check for duplicates first)
    if (adageData.variants && adageData.variants.length > 0) {
      // Check existing variants
      const { data: existingVariants } = await supabase
        .from('adage_variants')
        .select('variant_text')
        .eq('adage_id', adage.id)
        .is('deleted_at', null)

      const existingVariantTexts = new Set((existingVariants || []).map((v) => v.variant_text))
      const newVariants = adageData.variants
        .filter(v => !existingVariantTexts.has(v.variant_text))
        .map(v => ({
          adage_id: adage.id,
          variant_text: v.variant_text,
          notes: v.notes || null,
        }))

      if (newVariants.length > 0) {
        const { error: variantsError } = await supabase
          .from('adage_variants')
          .insert(newVariants)

        if (variantsError) {
          console.error(`⚠️  Error adding variants:`, variantsError)
        } else {
          console.log(`✅ Added ${newVariants.length} new variant(s)`)
        }
      } else {
        console.log(`ℹ️  All variants already exist`)
      }
    }

    // Add translations (check for duplicates first)
    if (adageData.translations && adageData.translations.length > 0) {
      const { data: existingTranslations } = await supabase
        .from('adage_translations')
        .select('language_code')
        .eq('adage_id', adage.id)
        .is('deleted_at', null)

      const existingLangCodes = new Set((existingTranslations || []).map((t) => t.language_code))
      const newTranslations = adageData.translations
        .filter(t => !existingLangCodes.has(t.language_code))
        .map(t => ({
          adage_id: adage.id,
          language_code: t.language_code,
          translated_text: t.translated_text,
          translator_notes: t.translator_notes || null,
        }))

      if (newTranslations.length > 0) {
        const { error: translationsError } = await supabase
          .from('adage_translations')
          .insert(newTranslations)

        if (translationsError) {
          console.error(`⚠️  Error adding translations:`, translationsError)
        } else {
          console.log(`✅ Added ${newTranslations.length} new translation(s)`)
        }
      } else {
        console.log(`ℹ️  All translations already exist`)
      }
    }

    // Add usage examples (check for duplicates first)
    if (adageData.usage_examples && adageData.usage_examples.length > 0) {
      const { data: existingExamples } = await supabase
        .from('adage_usage_examples')
        .select('example_text')
        .eq('adage_id', adage.id)
        .is('deleted_at', null)

      const existingExampleTexts = new Set((existingExamples || []).map((e) => e.example_text))
      const newExamples = adageData.usage_examples
        .filter(e => !existingExampleTexts.has(e.example_text))
        .map(e => ({
          adage_id: adage.id,
          example_text: e.example_text,
          context: e.context || null,
          source_type: e.source_type || 'community',
          created_by: adminId,
        }))

      if (newExamples.length > 0) {
        const { error: examplesError } = await supabase
          .from('adage_usage_examples')
          .insert(newExamples)

        if (examplesError) {
          console.error(`⚠️  Error adding usage examples:`, examplesError)
        } else {
          console.log(`✅ Added ${newExamples.length} new usage example(s)`)
        }
      } else {
        console.log(`ℹ️  All usage examples already exist`)
      }
    }

    // Add timeline entries (check for duplicates by time period)
    if (adageData.timeline && adageData.timeline.length > 0) {
      const { data: existingTimeline } = await supabase
        .from('adage_timeline')
        .select('time_period_start, time_period_end')
        .eq('adage_id', adage.id)
        .is('deleted_at', null)

      const existingPeriods = new Set(
        (existingTimeline || []).map((t) => 
          `${t.time_period_start}-${t.time_period_end || 'null'}`
        )
      )
      const newTimelineEntries = adageData.timeline
        .filter(t => {
          const periodKey = `${t.time_period_start}-${t.time_period_end || 'null'}`
          return !existingPeriods.has(periodKey)
        })
        .map(t => ({
          adage_id: adage.id,
          time_period_start: t.time_period_start,
          time_period_end: t.time_period_end || null,
          popularity_level: t.popularity_level,
          primary_location: t.primary_location || null,
          geographic_changes: t.geographic_changes || null,
          notes: t.notes || null,
          sources: t.sources || [],
        }))

      if (newTimelineEntries.length > 0) {
        const { error: timelineError } = await supabase
          .from('adage_timeline')
          .insert(newTimelineEntries)

        if (timelineError) {
          console.error(`⚠️  Error adding timeline entries:`, timelineError)
        } else {
          console.log(`✅ Added ${newTimelineEntries.length} new timeline entr(ies)`)
        }
      } else {
        console.log(`ℹ️  All timeline entries already exist`)
      }
    }

    return existing.id
  }

  // Create the adage
  const { data: adage, error: adageError } = await supabase
    .from('adages')
    .insert({
      adage: adageData.adage,
      definition: adageData.definition,
      origin: adageData.origin || null,
      etymology: adageData.etymology || null,
      historical_context: adageData.historical_context || null,
      interpretation: adageData.interpretation || null,
      modern_practicality: adageData.modern_practicality || null,
      first_known_usage: adageData.first_known_usage || null,
      first_known_usage_date: adageData.first_known_usage_date || null,
      first_known_usage_uncertain: adageData.first_known_usage_uncertain || false,
      tags: adageData.tags || [],
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

  // Add variants
  if (adageData.variants && adageData.variants.length > 0) {
    const variants = adageData.variants.map(v => ({
      adage_id: adage.id,
      variant_text: v.variant_text,
      notes: v.notes || null,
    }))

    const { error: variantsError } = await supabase
      .from('adage_variants')
      .insert(variants)

    if (variantsError) {
      console.error(`⚠️  Error adding variants:`, variantsError)
    } else {
      console.log(`✅ Added ${variants.length} variant(s)`)
    }
  }

  // Add translations
  if (adageData.translations && adageData.translations.length > 0) {
    const translations = adageData.translations.map(t => ({
      adage_id: adage.id,
      language_code: t.language_code,
      translated_text: t.translated_text,
      translator_notes: t.translator_notes || null,
    }))

    const { error: translationsError } = await supabase
      .from('adage_translations')
      .insert(translations)

    if (translationsError) {
      console.error(`⚠️  Error adding translations:`, translationsError)
    } else {
      console.log(`✅ Added ${translations.length} translation(s)`)
    }
  }

  // Add usage examples
  if (adageData.usage_examples && adageData.usage_examples.length > 0) {
    const examples = adageData.usage_examples.map(e => ({
      adage_id: adage.id,
      example_text: e.example_text,
      context: e.context || null,
      source_type: e.source_type || 'community',
      created_by: adminId,
    }))

    const { error: examplesError } = await supabase
      .from('adage_usage_examples')
      .insert(examples)

    if (examplesError) {
      console.error(`⚠️  Error adding usage examples:`, examplesError)
    } else {
      console.log(`✅ Added ${examples.length} usage example(s)`)
    }
  }

  // Add timeline entries
  if (adageData.timeline && adageData.timeline.length > 0) {
    const timelineEntries = adageData.timeline.map(t => ({
      adage_id: adage.id,
      time_period_start: t.time_period_start,
      time_period_end: t.time_period_end || null,
      popularity_level: t.popularity_level,
      primary_location: t.primary_location || null,
      geographic_changes: t.geographic_changes || null,
      notes: t.notes || null,
      sources: t.sources || [],
    }))

    const { error: timelineError } = await supabase
      .from('adage_timeline')
      .insert(timelineEntries)

    if (timelineError) {
      console.error(`⚠️  Error adding timeline entries:`, timelineError)
    } else {
      console.log(`✅ Added ${timelineEntries.length} timeline entr(ies)`)
    }
  }

  return adage.id
}

async function main() {
  console.log('🚀 Starting to add missing adages...\n')

  for (const adageData of newAdages) {
    await addAdage(adageData)
  }

  console.log('\n✅ Finished adding adages!')
}

main().catch(console.error)

