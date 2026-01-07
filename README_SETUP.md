# Setup Instructions - American Adages Society

## ✅ Your Supabase Project is Ready!

I've configured everything with your Supabase credentials. Here's what to do next:

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Run this command to automatically create `.env.local` with your Supabase credentials:

```bash
npm run setup-env
```

This creates `.env.local` with:
- ✅ Your Supabase URL and API keys
- ✅ Generated secure NextAuth secret
- ✅ Email configuration (you'll need to add Gmail app password)

### 3. Run Database Schema

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/rsjmbeydxvtapktfpryy
   - Or: https://supabase.com/dashboard → Select "American Adages Society"

2. **Open SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run the Schema:**
   - Open `database/schema.sql` in your code editor
   - Copy the entire file (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify:**
   - Click "Table Editor" in left sidebar
   - You should see all tables: users, adages, blog_posts, comments, etc.

### 4. Create Admin User

After the schema is set up, create your admin account:

```bash
npm run create-admin
```

This will create an admin user with:
- Email: `sebastiankiteka@utexas.edu`
- Password: `Admin123!ChangeMe`

**Or specify custom credentials:**
```bash
npm run create-admin sebastiankiteka@utexas.edu YourSecurePassword123!
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- ✅ Homepage loads
- ✅ Login at http://localhost:3000/login
- ✅ Admin panel at http://localhost:3000/admin

## Your Supabase Credentials

Already configured in the setup script:
- **Project URL:** https://rsjmbeydxvtapktfpryy.supabase.co
- **Project ID:** rsjmbeydxvtapktfpryy
- **Anon Key:** (configured in .env.local)
- **Service Role Key:** (configured in .env.local)

## Optional: Email Setup

If you want email notifications to work:

1. **Enable 2-Factor Authentication** on your Google account
2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AAS Website"
   - Copy the 16-character password

3. **Update .env.local:**
   - Open `.env.local`
   - Replace `your_app_password_here` with your app password
   - Save the file

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### "Missing Supabase environment variables"
- Make sure you ran `npm run setup-env`
- Restart the dev server: `npm run dev`

### Schema errors in Supabase
- Make sure you copied the ENTIRE `database/schema.sql` file
- Check for error messages in SQL Editor
- Some errors about existing tables are okay (schema uses IF NOT EXISTS)

### "Unauthorized" when logging in
- Make sure you ran `npm run create-admin`
- Check Supabase Table Editor → users table
- Verify the email/password you're using

### Can't connect to Supabase
- Verify your project is active in Supabase dashboard
- Check that credentials in `.env.local` are correct
- Make sure you're using the right project (rsjmbeydxvtapktfpryy)

## Next Steps After Setup

Once everything is working:

1. ✅ **Test API Routes:**
   - Visit http://localhost:3000/api/adages
   - Should return JSON (empty array if no adages yet)

2. ✅ **Test Admin Panel:**
   - Log in at http://localhost:3000/login
   - Go to http://localhost:3000/admin
   - Try creating an adage

3. ✅ **Test Contact Form:**
   - Visit http://localhost:3000/contact
   - Submit a test message
   - Check Supabase Table Editor → contact_messages

4. ✅ **Migrate Existing Data** (optional):
   - If you have data in `lib/data.ts`, we can create a migration script

## Security Checklist

Before going to production:

- [ ] Change default admin password
- [ ] Set up Row Level Security (RLS) in Supabase
- [ ] Configure proper email SMTP
- [ ] Set production `NEXTAUTH_URL` in Vercel
- [ ] Enable Supabase backups
- [ ] Review and restrict API access

## Need Help?

- Check `QUICK_START.md` for step-by-step guide
- Check `SETUP_GUIDE.md` for detailed instructions
- Check `IMPLEMENTATION_STATUS.md` to see what's done

## Files Created

- ✅ `scripts/setup-env.js` - Auto-creates .env.local
- ✅ `scripts/create-admin-user.js` - Creates admin user
- ✅ `scripts/run-schema.js` - Schema verification
- ✅ `QUICK_START.md` - Quick reference
- ✅ `.env.local` - Your credentials (gitignored)

