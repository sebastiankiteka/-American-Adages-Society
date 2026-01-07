// Script to help set up .env.local file
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rsjmbeydxvtapktfpryy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzam1iZXlkeHZ0YXBrdGZwcnl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMTk5MDEsImV4cCI6MjA4Mjg5NTkwMX0.aTYFHPco94wSOiuUBDe1MTZ6ikK9APiSh_1TXxr-hcc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzam1iZXlkeHZ0YXBrdGZwcnl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzMxOTkwMSwiZXhwIjoyMDgyODk1OTAxfQ.B8P5mjy7qhJen2vFGZj27bZ4Xw_i3TXVigHRdqJoM6c

# NextAuth Configuration (v5 uses AUTH_SECRET, but NEXTAUTH_SECRET also works)
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=${crypto.randomBytes(32).toString('base64')}
NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('base64')}

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sebastiankiteka@gmail.com
SMTP_PASSWORD=otsx fdku wkvc wqqe
EMAIL_FROM=sebastiankiteka@gmail.com
EMAIL_TO=sebastiankiteka@utexas.edu
`

const envPath = path.join(process.cwd(), '.env.local')

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup')
  fs.copyFileSync(envPath, envPath + '.backup')
}

fs.writeFileSync(envPath, envContent)
console.log('✅ Created .env.local file with Supabase credentials')
console.log('📝 Next steps:')
console.log('   1. Update SMTP_PASSWORD with your Gmail app password (if using email)')
console.log('   2. Run the database schema in Supabase SQL Editor')
console.log('   3. Create admin user using scripts/create-admin-user.js')

