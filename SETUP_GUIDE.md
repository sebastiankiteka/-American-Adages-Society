# American Adages Society - Database Setup Guide

This guide will help you set up the database-backed version of the American Adages Society website.

## Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** (free tier works fine)
3. **Git** for version control

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Supabase client
- NextAuth v5
- bcryptjs for password hashing
- nodemailer for email notifications

## Step 2: Set Up Supabase Database

1. **Create a Supabase project:**
   - Go to https://supabase.com
   - Sign up or log in
   - Click "New Project"
   - Choose a name and database password
   - Select a region close to you
   - Wait for the project to be created (2-3 minutes)

2. **Run the database schema:**
   - In your Supabase dashboard, go to "SQL Editor"
   - Open the file `database/schema.sql` from this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" to execute the schema
   - Verify all tables were created (check "Table Editor" tab)

3. **Get your Supabase credentials:**
   - Go to "Settings" → "API"
   - Copy the following:
     - Project URL (under "Project URL")
     - `anon` key (under "Project API keys" → "anon public")
     - `service_role` key (under "Project API keys" → "service_role" - keep this secret!)

## Step 3: Configure Environment Variables

1. **Create `.env.local` file** in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=sebastiankiteka@gmail.com
EMAIL_TO=sebastiankiteka@utexas.edu
```

2. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Or use an online generator: https://generate-secret.vercel.app/32

3. **Set up email (optional but recommended):**
   - For Gmail: Create an "App Password" in your Google Account settings
   - Use that app password as `SMTP_PASSWORD`
   - Update `SMTP_USER` with your Gmail address

## Step 4: Create Initial Admin User

1. **Open Supabase SQL Editor** and run:

```sql
-- Create admin user (password: Admin123! - CHANGE THIS IMMEDIATELY)
-- Password hash for "Admin123!" (bcrypt, rounds: 10)
INSERT INTO users (email, password_hash, username, display_name, role, email_verified)
VALUES (
  'sebastiankiteka@utexas.edu',
  '$2a$10$rOzJqKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq',
  'admin',
  'Administrator',
  'admin',
  true
);
```

**⚠️ IMPORTANT:** The password hash above is a placeholder. You need to:

1. **Generate a real password hash:**
   - Create a temporary script `hash-password.js`:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('YourSecurePassword123!', 10).then(hash => console.log(hash));
   ```
   - Run: `node hash-password.js`
   - Copy the output hash

2. **Update the SQL with your real hash:**
   ```sql
   INSERT INTO users (email, password_hash, username, display_name, role, email_verified)
   VALUES (
     'sebastiankiteka@utexas.edu',
     'YOUR_GENERATED_HASH_HERE',
     'admin',
     'Administrator',
     'admin',
     true
   );
   ```

3. **Or use the API to create users** (after setting up the API routes)

## Step 5: Migrate Existing Data (Optional)

If you have existing data in `lib/data.ts`, you can migrate it:

1. **Create a migration script** `scripts/migrate-data.ts`:

```typescript
import { supabase } from '../lib/supabase'
import { adages, blogPosts } from '../lib/data'

async function migrateData() {
  // Migrate adages
  for (const adage of adages) {
    const { error } = await supabase.from('adages').insert({
      id: adage.id,
      adage: adage.adage,
      definition: adage.definition,
      origin: adage.origin,
      etymology: adage.etymology,
      historical_context: adage.historicalContext,
      interpretation: adage.interpretation,
      modern_practicality: adage.modernPracticality,
      tags: adage.tags,
    })
    if (error) console.error('Error migrating adage:', error)
  }

  // Migrate blog posts
  for (const post of blogPosts) {
    const { error } = await supabase.from('blog_posts').insert({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      slug: post.title.toLowerCase().replace(/\s+/g, '-'),
      author_name: post.author,
      tags: post.tags,
      published: true,
      published_at: post.date,
    })
    if (error) console.error('Error migrating blog post:', error)
  }
}

migrateData()
```

2. **Run the migration:**
   ```bash
   npx tsx scripts/migrate-data.ts
   ```

## Step 6: Test the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Go to http://localhost:3000/login
   - Log in with your admin credentials
   - Verify you can access `/admin`

3. **Test API routes:**
   - Try creating an adage via the admin panel
   - Check that it appears in Supabase "Table Editor"
   - Verify soft-delete works (deleted items have `deleted_at` set)

## Step 7: Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add database integration"
   git push
   ```

2. **Configure Vercel environment variables:**
   - Go to your Vercel project settings
   - Add all variables from `.env.local` (except `NEXTAUTH_URL` which should be your production URL)
   - Update `NEXTAUTH_URL` to your production domain

3. **Redeploy:**
   - Vercel will automatically redeploy on push
   - Or manually trigger a redeploy from the dashboard

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has all required variables
- Restart the dev server after adding variables

### "Unauthorized" errors
- Check that you've created an admin user in the database
- Verify the password hash is correct
- Check that `NEXTAUTH_SECRET` is set

### Database connection errors
- Verify Supabase project is active
- Check that API keys are correct
- Ensure database schema was run successfully

### Email not sending
- Check SMTP credentials
- For Gmail, ensure "Less secure app access" is enabled or use App Password
- Check spam folder for test emails

## Next Steps

1. **Set up email verification** for new user registrations
2. **Configure Row Level Security (RLS)** in Supabase for additional security
3. **Set up automated backups** in Supabase
4. **Configure custom domain** in Vercel
5. **Set up monitoring** and error tracking

## Security Notes

- ⚠️ Never commit `.env.local` to git (it's in `.gitignore`)
- ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it bypasses RLS
- ⚠️ Change default admin password immediately
- ⚠️ Enable RLS policies in Supabase for production
- ⚠️ Use strong passwords for all admin accounts
- ⚠️ Regularly update dependencies for security patches

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check NextAuth documentation: https://next-auth.js.org
- Review API route error messages in browser console


