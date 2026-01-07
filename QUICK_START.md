# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Run the setup script to create `.env.local` with your Supabase credentials:

```bash
npm run setup-env
```

This will:
- Create `.env.local` with your Supabase credentials
- Generate a secure `NEXTAUTH_SECRET`
- Set up email configuration (you'll need to add your Gmail app password)

**Note:** If you want to use email notifications, you'll need to:
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Create an "App Password" for Gmail
4. Update `SMTP_PASSWORD` in `.env.local` with that app password

## Step 3: Run Database Schema

1. Go to https://supabase.com/dashboard
2. Select your project: **American Adages Society**
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Open `database/schema.sql` in your code editor
6. Copy the entire contents
7. Paste into the Supabase SQL Editor
8. Click **Run** (or press Ctrl+Enter)

You should see "Success. No rows returned" - this means the schema was created successfully!

**Verify the schema:**
- Click **Table Editor** in the left sidebar
- You should see all the tables listed (users, adages, blog_posts, etc.)

## Step 4: Create Admin User

After the schema is set up, create your admin account:

```bash
npm run create-admin
```

Or with custom email/password:

```bash
npm run create-admin sebastiankiteka@utexas.edu YourSecurePassword123!
```

This will create an admin user that you can use to log in.

## Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Homepage loads
- Try logging in at http://localhost:3000/login
- Access admin panel at http://localhost:3000/admin

## Step 6: Test API Routes

You can test the API routes using:
- Browser: http://localhost:3000/api/adages
- Postman or similar tool
- Or use the admin panel once logged in

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure you ran `npm run setup-env`
- Restart the dev server after creating `.env.local`

### "Schema errors" in Supabase
- Make sure you copied the entire `database/schema.sql` file
- Check for any error messages in the SQL Editor
- Some tables might already exist - that's okay, the schema uses `CREATE TABLE IF NOT EXISTS` where possible

### "Cannot connect to Supabase"
- Verify your credentials in `.env.local`
- Check that your Supabase project is active
- Make sure you're using the correct project URL and keys

### "Unauthorized" when logging in
- Make sure you created the admin user with `npm run create-admin`
- Check that the user exists in Supabase Table Editor
- Verify the password you're using matches what you set

## Next Steps

Once everything is working:
1. ✅ Test creating an adage via admin panel
2. ✅ Test the contact form
3. ✅ Test voting on adages
4. ✅ Test commenting system

Then we can continue with:
- Updating frontend pages to use the API
- Building the forum system
- Adding user profiles
- Implementing weekly adage feature

## Your Supabase Project Info

- **Project Name:** American Adages Society
- **URL:** https://rsjmbeydxvtapktfpryy.supabase.co
- **Project ID:** rsjmbeydxvtapktfpryy
- **Dashboard:** https://supabase.com/dashboard/project/rsjmbeydxvtapktfpryy

## Security Reminders

⚠️ **IMPORTANT:**
- Never commit `.env.local` to git (it's in `.gitignore`)
- Change the default admin password after first login
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- Use strong passwords for all accounts

