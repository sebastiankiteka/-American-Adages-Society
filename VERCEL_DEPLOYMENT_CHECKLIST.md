# Vercel Deployment Checklist

Complete this checklist in order to deploy the American Adages Society website to Vercel.

## Phase 1: Pre-Deployment Preparation

### 1.1 Database Setup (Supabase)
- [ ] **Run all database migrations**
  - Go to Supabase Dashboard → SQL Editor
  - Run `database/migrations/RUN_ALL_MIGRATIONS.sql` in full
  - Verify all tables exist: `users`, `adages`, `blog_posts`, `comments`, `votes`, `mailing_list`, `notifications`, `forum_sections`, `forum_threads`, `forum_replies`, `citations`, `documents`, `adage_versions`, `blog_post_versions`, etc.
  - Verify version history tables exist (if using version history feature)
    - Run `database/migrations/create-version-history.sql` if not already run

- [ ] **Create initial admin user**
  - Option 1: Use Supabase SQL Editor to insert admin user directly
  - Option 2: Run `npm run create-admin` locally (requires local env setup)
  - Admin user should have `role = 'admin'` in the `users` table

- [ ] **Verify database functions and triggers**
  - Check that all triggers are active (version history, etc.)
  - Verify Row Level Security (RLS) policies are set correctly

### 1.2 Local Build Test
- [ ] **Test production build locally**
  ```bash
  npm install
  npm run build
  npm start
  ```
- [ ] **Verify no build errors**
  - Check for TypeScript errors
  - Check for missing dependencies
  - Verify all imports resolve correctly

- [ ] **Test critical functionality**
  - Homepage loads
  - Archive page loads
  - Blog page loads
  - Login works
  - Admin panel accessible (if logged in as admin)

## Phase 2: Vercel Project Setup

### 2.1 Create Vercel Project
- [ ] **Connect GitHub repository to Vercel**
  - Go to [vercel.com](https://vercel.com)
  - Click "Add New Project"
  - Import your GitHub repository
  - Select the repository containing this codebase

- [ ] **Configure project settings**
  - Framework Preset: **Next.js** (should auto-detect)
  - Root Directory: `.` (root of repository)
  - Build Command: `npm run build` (default)
  - Output Directory: `.next` (default)
  - Install Command: `npm install` (default)
  - Node.js Version: **18.x** or higher (check `package.json` engines)

### 2.2 Verify vercel.json Configuration
- [ ] **Check `vercel.json` exists** (already present)
  - Cron job for featured adage rotation is configured
  - Schedule: `0 0 * * 1` (every Monday at midnight UTC)

## Phase 3: Environment Variables

### 3.1 Required Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

#### Supabase Configuration (REQUIRED)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
  - Found in: Supabase Dashboard → Project Settings → API → Project URL
  - Scope: All environments (Production, Preview, Development)

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: Your Supabase anonymous/public key
  - Found in: Supabase Dashboard → Project Settings → API → anon public key
  - Scope: All environments

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Value: Your Supabase service role key (KEEP SECRET)
  - Found in: Supabase Dashboard → Project Settings → API → service_role key
  - Scope: All environments
  - ⚠️ **Never expose this in client-side code**

#### Authentication (REQUIRED)
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET`
  - Value: Generate a random secret (32+ characters)
  - Generate with: `openssl rand -base64 32` or use [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
  - Scope: All environments
  - Used for: NextAuth session encryption

#### Email Configuration (REQUIRED for email features)
- [ ] `SMTP_HOST`
  - Value: Your SMTP server hostname (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
  - Scope: All environments

- [ ] `SMTP_PORT`
  - Value: SMTP port (usually `587` for TLS or `465` for SSL)
  - Scope: All environments

- [ ] `SMTP_USER`
  - Value: SMTP username/email
  - Scope: All environments

- [ ] `SMTP_PASSWORD`
  - Value: SMTP password or app-specific password
  - Scope: All environments

- [ ] `SMTP_FROM_EMAIL`
  - Value: Email address to send from (e.g., `noreply@americanadagessociety.org`)
  - Scope: All environments

- [ ] `SMTP_FROM_NAME`
  - Value: Display name for emails (e.g., `American Adages Society`)
  - Scope: All environments

#### Site Configuration (REQUIRED)
- [ ] `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_BASE_URL`
  - Value: Your production domain (e.g., `https://americanadagessociety.org`)
  - Scope: Production only (or use different values for preview/dev)
  - Used for: Canonical URLs, email links, sitemap generation

#### Cron Job Security (OPTIONAL but recommended)
- [ ] `CRON_SECRET`
  - Value: Random secret for securing cron endpoints
  - Generate with: `openssl rand -base64 32`
  - Scope: Production only
  - Used for: `/api/adages/rotate-featured` endpoint security

#### Optional: Analytics & Error Logging
- [ ] `NEXT_PUBLIC_ANALYTICS_ENABLED`
  - Value: `true` or `false` (default: `false`)
  - Scope: All environments

- [ ] `NEXT_PUBLIC_ANALYTICS_SERVICE`
  - Value: `ga4`, `plausible`, `custom`, or `none` (default: `none`)
  - Scope: All environments

- [ ] `ENABLE_ERROR_LOGGING`
  - Value: `true` or `false` (default: production only)
  - Scope: All environments

- [ ] `NEXT_PUBLIC_ERROR_LOGGING_SERVICE`
  - Value: `sentry`, `custom`, or `console` (default: `console`)
  - Scope: All environments

### 3.2 Verify Environment Variables
- [ ] **Check all required variables are set**
  - Supabase: URL, Anon Key, Service Role Key
  - Auth: AUTH_SECRET
  - Email: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL
  - Site: NEXT_PUBLIC_SITE_URL

- [ ] **Set different values for Preview/Development if needed**
  - Use Vercel's environment variable scoping
  - Production: Production domain
  - Preview: Preview domain or staging URL
  - Development: Local development URL

## Phase 4: Database Migrations (If Needed)

### 4.1 Version History Tables (If Using)
- [ ] **Run version history migration**
  - File: `database/migrations/create-version-history.sql`
  - Run in Supabase SQL Editor
  - Creates: `adage_versions`, `blog_post_versions` tables
  - Creates: Triggers for automatic versioning

### 4.2 Verify All Tables Exist
- [ ] **Check critical tables**
  - `users` (with `role`, `email`, `password_hash` columns)
  - `adages` (with all required columns)
  - `blog_posts` (with `published`, `published_at` columns)
  - `comments`, `votes`, `saved_adages`
  - `mailing_list` (with proper constraints)
  - `notifications`
  - `forum_sections`, `forum_threads`, `forum_replies`
  - `citations`, `documents`
  - `adage_versions`, `blog_post_versions` (if using version history)

## Phase 5: Vercel Deployment

### 5.1 Initial Deployment
- [ ] **Deploy to Vercel**
  - Push code to GitHub (if not already connected)
  - Vercel will auto-deploy on push
  - Or manually trigger deployment in Vercel Dashboard

- [ ] **Monitor build logs**
  - Check for build errors
  - Verify all dependencies install correctly
  - Check for TypeScript/compilation errors

### 5.2 Post-Deployment Verification
- [ ] **Test homepage**
  - Visit production URL
  - Verify homepage loads
  - Check dark mode toggle works
  - Verify navigation works

- [ ] **Test critical pages**
  - `/archive` - Archive listing loads
  - `/archive/[id]` - Adage detail page loads
  - `/blog` - Blog listing loads
  - `/blog/[id]` - Blog post detail loads
  - `/about` - About page loads
  - `/contact` - Contact form loads

- [ ] **Test authentication**
  - `/login` - Login page loads
  - Login with admin credentials works
  - Admin panel accessible at `/admin`
  - Logout works correctly

- [ ] **Test API endpoints**
  - `/api/adages` - Returns adages list
  - `/api/blog-posts` - Returns blog posts
  - `/api/contact` - Contact form submission works

- [ ] **Test email functionality**
  - Submit contact form
  - Verify email is sent (check SMTP logs)
  - Test password reset flow (if implemented)

### 5.3 Cron Job Setup
- [ ] **Verify cron job is configured**
  - Check `vercel.json` has cron configuration
  - Path: `/api/adages/rotate-featured`
  - Schedule: `0 0 * * 1` (weekly on Monday)
  - Vercel automatically sets up cron jobs from `vercel.json`

- [ ] **Test cron endpoint manually** (optional)
  - Visit: `https://your-domain.vercel.app/api/adages/rotate-featured`
  - Should return success or require authentication
  - Check Vercel Dashboard → Cron Jobs to see execution history

## Phase 6: Domain & SSL Configuration

### 6.1 Custom Domain Setup
- [ ] **Add custom domain in Vercel**
  - Go to Project Settings → Domains
  - Add your domain (e.g., `americanadagessociety.org`)
  - Follow Vercel's DNS configuration instructions

- [ ] **Configure DNS records**
  - Add A record or CNAME as instructed by Vercel
  - Wait for DNS propagation (can take up to 48 hours)

- [ ] **Update environment variables**
  - Update `NEXT_PUBLIC_SITE_URL` to your custom domain
  - Redeploy after updating

### 6.2 SSL Certificate
- [ ] **Verify SSL is active**
  - Vercel automatically provisions SSL certificates
  - Check that `https://` works on your domain
  - Verify certificate is valid (no browser warnings)

## Phase 7: Production Optimizations

### 7.1 Performance
- [ ] **Verify image optimization**
  - Check that Next.js Image component works
  - Verify images load correctly
  - Check image optimization is enabled (default in Vercel)

- [ ] **Check build output**
  - Verify static pages are generated where possible
  - Check bundle size is reasonable
  - Review Vercel Analytics (if enabled)

### 7.2 Monitoring
- [ ] **Set up error monitoring** (optional)
  - Configure Sentry or similar service
  - Add `NEXT_PUBLIC_ERROR_LOGGING_SERVICE=sentry`
  - Add Sentry DSN to environment variables

- [ ] **Set up analytics** (optional)
  - Configure Google Analytics or Plausible
  - Add `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
  - Add `NEXT_PUBLIC_ANALYTICS_SERVICE=ga4` (or `plausible`)

### 7.3 Security
- [ ] **Verify security headers**
  - Check CSP headers are set (configured in `next.config.js`)
  - Verify HTTPS is enforced
  - Check that sensitive environment variables are not exposed

- [ ] **Review API rate limiting**
  - Verify rate limiting is active on public endpoints
  - Test that rate limits work correctly

## Phase 8: Final Checks

### 8.1 Functionality Verification
- [ ] **User registration** (if enabled)
- [ ] **User login/logout**
- [ ] **Admin panel access**
- [ ] **Content creation** (adages, blog posts)
- [ ] **Comments system**
- [ ] **Voting system**
- [ ] **Mailing list signup**
- [ ] **Contact form**
- [ ] **Search functionality**
- [ ] **Dark mode toggle**
- [ ] **Mobile responsiveness**

### 8.2 Content Verification
- [ ] **Homepage displays correctly**
- [ ] **Weekly featured adage shows**
- [ ] **Archive displays adages**
- [ ] **Blog posts display correctly**
- [ ] **Navigation works on all pages**
- [ ] **Footer displays correctly**

### 8.3 Error Handling
- [ ] **404 page works** (`/not-found`)
- [ ] **500 error page works** (`/error`)
- [ ] **Error boundaries catch errors**
- [ ] **API errors return proper responses**

## Phase 9: Documentation & Maintenance

### 9.1 Documentation
- [ ] **Update README.md** with production URL
- [ ] **Document admin credentials** (store securely, not in code)
- [ ] **Document environment variables** (for future reference)

### 9.2 Backup & Recovery
- [ ] **Set up database backups** (Supabase handles this automatically)
- [ ] **Document rollback procedure**
- [ ] **Test restore process** (optional)

### 9.3 Ongoing Maintenance
- [ ] **Set up monitoring alerts** (optional)
- [ ] **Schedule regular backups** (if needed beyond Supabase defaults)
- [ ] **Plan for updates** (how to deploy new versions)

## Troubleshooting Common Issues

### Build Fails
- Check environment variables are all set
- Verify Node.js version is 18+
- Check for TypeScript errors
- Verify all dependencies are in `package.json`

### Database Connection Errors
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies allow necessary access
- Check service role key is set (for admin operations)

### Email Not Sending
- Verify SMTP credentials are correct
- Check SMTP port (587 for TLS, 465 for SSL)
- Test SMTP connection separately
- Check email provider allows Vercel IPs

### Cron Jobs Not Running
- Verify `vercel.json` is committed to repository
- Check cron schedule syntax is correct
- Verify endpoint exists and is accessible
- Check Vercel Dashboard → Cron Jobs for execution logs

### Dark Mode Not Working
- Verify CSS variables are defined in `globals.css`
- Check Tailwind config has `darkMode: 'class'`
- Verify blocking script in `layout.tsx` runs
- Check browser console for errors

## Quick Reference: Environment Variables Summary

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET (or NEXTAUTH_SECRET)
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM_EMAIL
SMTP_FROM_NAME
NEXT_PUBLIC_SITE_URL
```

**Optional:**
```
CRON_SECRET
NEXT_PUBLIC_ANALYTICS_ENABLED
NEXT_PUBLIC_ANALYTICS_SERVICE
ENABLE_ERROR_LOGGING
NEXT_PUBLIC_ERROR_LOGGING_SERVICE
```

## Next Steps After Deployment

1. **Test all user flows** end-to-end
2. **Monitor error logs** in Vercel Dashboard
3. **Set up analytics** to track usage
4. **Configure custom domain** if not done
5. **Set up monitoring alerts** for critical errors
6. **Document deployment process** for future updates

---

**Estimated Time:** 2-4 hours (depending on domain setup and testing)

**Critical Path:** Database migrations → Environment variables → Deploy → Test → Domain setup














