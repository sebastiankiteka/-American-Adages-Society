// Script to run database schema in Supabase
// This script will help you verify the schema is ready to run

const fs = require('fs')
const path = require('path')

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')

if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found:', schemaPath)
  process.exit(1)
}

const schema = fs.readFileSync(schemaPath, 'utf8')

console.log('📋 Database Schema Ready')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('To set up your database:')
console.log('')
console.log('1. Go to https://supabase.com/dashboard')
console.log('2. Select your project: "American Adages Society"')
console.log('3. Click on "SQL Editor" in the left sidebar')
console.log('4. Click "New query"')
console.log('5. Copy the contents of database/schema.sql')
console.log('6. Paste into the SQL Editor')
console.log('7. Click "Run" (or press Ctrl+Enter)')
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log(`Schema file: ${schemaPath}`)
console.log(`Schema size: ${(schema.length / 1024).toFixed(2)} KB`)
console.log(`Number of CREATE TABLE statements: ${(schema.match(/CREATE TABLE/g) || []).length}`)
console.log('')
console.log('✅ Schema file is ready to run!')

