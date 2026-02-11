// Script to add sample data via API (requires admin authentication)
// Usage: node scripts/add-sample-data.js
// Note: This requires the dev server to be running and you to be logged in as admin

const fetch = require('node-fetch')

const API_BASE = 'http://localhost:3000/api'

// You'll need to get a session token - for now, this is a placeholder
// In production, you'd use proper authentication
async function addSampleData() {
  console.log('📝 Adding sample data to database via API...\n')

  // Note: This script requires admin authentication
  // For now, you'll need to manually add data through the admin panel
  // OR we can create a direct database script instead
  
  console.log('⚠️  This script requires admin authentication.')
  console.log('📝 Instead, please add sample data through the admin panel at http://localhost:3000/admin')
  console.log('\nOr use the direct database script: scripts/add-sample-data-direct.js')
}

addSampleData().catch(console.error)















