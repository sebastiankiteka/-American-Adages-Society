# Next Steps - Development Roadmap

## ✅ Completed
- Database schema set up
- Authentication working (admin login)
- Core API routes (adages, comments, votes, contact, mailing list)
- Login page created

## 🎯 Priority 1: Core Functionality (Do First)

### 1. Complete API Routes
- ✅ Blog posts API (just created)
- ⏳ Events API (next)
- ⏳ User registration API

### 2. Update Admin Pages to Use API
**Why:** Admin can currently edit, but changes are only in localStorage. Need to save to database.

**Pages to update:**
- `app/admin/adages/page.tsx` - Use `/api/adages` instead of localStorage
- `app/admin/blog/page.tsx` - Use `/api/blog-posts` instead of localStorage  
- `app/admin/events/page.tsx` - Use `/api/events` instead of localStorage
- `app/admin/page.tsx` - Use NextAuth session instead of localStorage check

**Benefits:**
- Changes persist in database
- Multiple admins can work together
- Data survives browser clears

### 3. Update Public Pages to Fetch from API
**Why:** Public pages still show static/localStorage data. Need real-time database content.

**Pages to update:**
- `app/archive/page.tsx` - Fetch from `/api/adages`
- `app/archive/[id]/page.tsx` - Fetch from `/api/adages/[id]`
- `app/blog/page.tsx` - Fetch from `/api/blog-posts`
- `app/blog/[id]/page.tsx` - Fetch from `/api/blog-posts/[id]`
- `app/events/page.tsx` - Fetch from `/api/events`
- `app/contact/page.tsx` - Submit to `/api/contact`

## 🎯 Priority 2: User Features

### 4. User Registration & Profiles
- Create `/app/register/page.tsx`
- Create `/api/users/register` route
- Create user profile pages
- Email verification system

### 5. Comments & Voting on Public Pages
- Add comment sections to adage detail pages
- Add comment sections to blog posts
- Add voting UI to adages and blog posts
- Show vote scores and user's votes

## 🎯 Priority 3: Enhanced Features

### 6. Weekly Adage Feature
- Add to homepage
- Rotate featured adage
- Include in mailing list updates

### 7. Admin Dashboard Enhancements
- Contact messages inbox
- Activity feed
- Analytics dashboard
- User management

### 8. Forum System
- Forum sections
- Threads and replies
- Posting rules
- Moderation tools

## 🎯 Priority 4: Advanced Features

### 9. Enhanced Archive Features
- Historical timeline visualization
- Variants and translations
- Related adages
- Usage examples
- Citations

### 10. Collections & Social
- User collections
- Saved adages
- User profiles
- Friendships

## 📋 Recommended Order

**Week 1:**
1. ✅ Create blog posts API
2. ⏳ Create events API
3. ⏳ Update admin adages page
4. ⏳ Update admin blog page
5. ⏳ Update admin events page

**Week 2:**
6. Update public archive page
7. Update public blog page
8. Update public events page
9. Update contact form
10. Test everything end-to-end

**Week 3:**
11. User registration
12. Comments on public pages
13. Voting on public pages
14. Weekly adage feature

**Week 4:**
15. Admin dashboard enhancements
16. Forum system
17. Enhanced archive features

## 🚀 Quick Wins (Can Do Anytime)

- Update contact form (simple API call)
- Update mailing list signup (simple API call)
- Add loading states to pages
- Add error handling
- Improve mobile responsiveness

## 📝 Notes

- All API routes are ready for adages, comments, votes, contact, mailing list
- Blog posts API just created
- Events API needs to be created next
- Frontend pages need to be updated to use APIs
- Consider adding loading skeletons for better UX
- Add error boundaries for graceful error handling

