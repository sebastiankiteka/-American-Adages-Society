/**
 * Script to update citation source URLs for "A penny saved is a penny earned"
 * 
 * Updates three citations with stable, authoritative URLs:
 * 1. The Penguin Dictionary of Proverbs (2006)
 * 2. Historical Dictionary of American Slang, Volume 2 (1997)
 * 3. Oxford Dictionary of Proverbs, 5th Edition (2015)
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Normalize URL helper (matches the frontend function)
function normalizeSourceUrl(url) {
  if (!url || typeof url !== 'string') return null
  
  let trimmed = url.trim()
  if (!trimmed) return null
  
  // If it already starts with http:// or https://, validate it
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed)
      return trimmed
    } catch {
      return null
    }
  }
  
  // If it doesn't start with a protocol, prepend https://
  if (!trimmed.match(/^https?:\/\//i)) {
    trimmed = 'https://' + trimmed
  }
  
  // Validate the final URL
  try {
    const urlObj = new URL(trimmed)
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null
    }
    return trimmed
  } catch {
    return null
  }
}

async function updateCitationUrls() {
  try {
    console.log('🔍 Finding adage "A penny saved is a penny earned"...')
    
    // Find the adage
    const { data: adage, error: adageError } = await supabase
      .from('adages')
      .select('id, adage')
      .ilike('adage', '%penny saved%penny earned%')
      .is('deleted_at', null)
      .maybeSingle()
    
    if (adageError) {
      throw new Error(`Failed to find adage: ${adageError.message}`)
    }
    
    if (!adage) {
      throw new Error('Adage "A penny saved is a penny earned" not found in database')
    }
    
    console.log(`✅ Found adage: "${adage.adage}" (ID: ${adage.id})`)
    
    // Find all citations for this adage
    const { data: citations, error: citationsError } = await supabase
      .from('citations')
      .select('id, source_text, source_url')
      .eq('adage_id', adage.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    if (citationsError) {
      throw new Error(`Failed to fetch citations: ${citationsError.message}`)
    }
    
    if (!citations || citations.length === 0) {
      throw new Error('No citations found for this adage')
    }
    
    console.log(`\n📚 Found ${citations.length} citation(s):`)
    citations.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.source_text.substring(0, 60)}...`)
      console.log(`     Current URL: ${c.source_url || '(none)'}`)
    })
    
    // Define the URL mappings
    const urlMappings = {
      'Penguin Dictionary of Proverbs': 'https://www.worldcat.org/isbn/9780140515109',
      'Historical Dictionary of American Slang': 'https://www.worldcat.org/title/random-house-historical-dictionary-of-american-slang/oclc/33809326',
      'Oxford Dictionary of Proverbs': 'https://www.oxfordreference.com/view/10.1093/acref/9780198734903.001.0001/acref-9780198734903'
    }
    
    console.log('\n🔄 Updating citations...\n')
    
    let updatedCount = 0
    
    for (const citation of citations) {
      let newUrl = null
      let matchedKey = null
      
      // Try to match citation by source text
      for (const [key, url] of Object.entries(urlMappings)) {
        if (citation.source_text.includes(key)) {
          newUrl = url
          matchedKey = key
          break
        }
      }
      
      if (!newUrl) {
        console.log(`⚠️  Skipping citation "${citation.source_text.substring(0, 50)}..." - no matching URL mapping`)
        continue
      }
      
      // Normalize the URL
      const normalizedUrl = normalizeSourceUrl(newUrl)
      if (!normalizedUrl) {
        console.log(`❌ Invalid URL for "${matchedKey}": ${newUrl}`)
        continue
      }
      
      // Update the citation
      const { data: updated, error: updateError } = await supabase
        .from('citations')
        .update({ source_url: normalizedUrl })
        .eq('id', citation.id)
        .select()
        .single()
      
      if (updateError) {
        console.log(`❌ Failed to update citation ${citation.id}: ${updateError.message}`)
        continue
      }
      
      console.log(`✅ Updated: "${matchedKey}"`)
      console.log(`   Old URL: ${citation.source_url || '(none)'}`)
      console.log(`   New URL: ${normalizedUrl}\n`)
      updatedCount++
    }
    
    console.log(`\n✨ Successfully updated ${updatedCount} citation(s)`)
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const { data: verifiedCitations } = await supabase
      .from('citations')
      .select('id, source_text, source_url')
      .eq('adage_id', adage.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    
    console.log('\n📋 Final citation URLs:')
    verifiedCitations?.forEach((c, i) => {
      const normalized = normalizeSourceUrl(c.source_url)
      console.log(`  ${i + 1}. ${c.source_text.substring(0, 60)}...`)
      console.log(`     URL: ${c.source_url || '(none)'}`)
      console.log(`     Valid: ${normalized ? '✅' : '❌'}\n`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the script
updateCitationUrls()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

