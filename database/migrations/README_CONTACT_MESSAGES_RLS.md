# Fix: Contact Messages RLS Policy

## Problem
The "Get Involved" and "Contact" pages are throwing a Supabase RLS error:
```
"new row violates row-level security policy for table 'contact_messages'"
```

This happens when unauthenticated users try to submit contact forms.

## Solution
Created a new RLS policy that allows anonymous/public users to insert contact messages while keeping other operations secure.

## Files Created/Modified

### 1. Migration File: `database/migrations/add-contact-messages-rls.sql`
This SQL migration:
- Enables RLS on `contact_messages` table
- Creates a policy allowing public/anonymous inserts with validation
- Creates policies for users to view their own messages
- Creates policies for admins to view/update/delete all messages

## Steps to Apply

### Step 1: Check Current RLS Policies
Run this SQL in your Supabase SQL Editor to see existing policies:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'contact_messages';

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contact_messages';
```

### Step 2: Apply the Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `database/migrations/add-contact-messages-rls.sql`
4. Copy and paste the entire SQL into the editor
5. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify the Policy
After running the migration, verify the policy exists:

```sql
-- Verify the INSERT policy exists
SELECT policyname, cmd, roles, with_check
FROM pg_policies 
WHERE tablename = 'contact_messages' 
AND cmd = 'INSERT';
```

You should see:
- Policy name: `Allow public contact form submissions`
- Command: `INSERT`
- Roles: `{public}` (includes both anon and authenticated)

### Step 4: Test the Forms
1. Open your site in an incognito/private window (to test as unauthenticated user)
2. Navigate to `/contact` page
3. Fill out and submit the form
4. Navigate to `/get-involved` page
5. Fill out and submit the form

Both should succeed without RLS errors.

## Policy Details

### INSERT Policy: "Allow public contact form submissions"
- **Target**: `public` role (includes both anonymous and authenticated users)
- **Operation**: `INSERT`
- **Validation** (WITH CHECK):
  - Message: 10-5000 characters
  - Name: 2-255 characters
  - Email: Valid format (regex) and max 255 characters
  - Category: Must be one of the valid categories

### SELECT Policies
- Users can view their own messages (if `user_id` is set)
- Admins can view all non-deleted messages

### UPDATE/DELETE Policies
- Only admins can update or delete messages

## Code Status

✅ **API Route** (`app/api/contact/route.ts`):
- Already uses server-side route handler
- Has proper validation
- Has rate limiting (5 requests per 15 minutes)
- Uses regular `supabase` client (will work with new RLS policy)

✅ **Contact Form** (`app/contact/page.tsx`):
- Already has error handling
- Already shows success message
- Already shows loading state

✅ **Get Involved Form** (`app/get-involved/page.tsx`):
- Already has error handling
- Already shows success message
- Already shows loading state

## Security Features

1. **Rate Limiting**: 5 requests per 15 minutes per IP (already implemented)
2. **Input Validation**: Server-side validation in API route
3. **RLS Validation**: Database-level validation via WITH CHECK clause
4. **Email Format**: Regex validation at database level
5. **Message Length**: Min 10, max 5000 characters
6. **Category Validation**: Only valid categories allowed

## Optional Enhancements (Future)

If you want additional security:
1. **CAPTCHA**: Add Cloudflare Turnstile or hCaptcha to forms
2. **IP Rate Limiting**: Enhance rate limiting with Supabase Edge Functions
3. **Email Verification**: Require email verification before accepting submissions
4. **Spam Detection**: Add spam detection service integration

## Troubleshooting

### If forms still fail after applying migration:

1. **Check RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'contact_messages';
   ```
   Should show `rowsecurity = true`

2. **Check policy exists**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'contact_messages';
   ```

3. **Check policy allows public**:
   ```sql
   SELECT policyname, roles FROM pg_policies 
   WHERE tablename = 'contact_messages' AND cmd = 'INSERT';
   ```
   Should include `public` in roles

4. **Test insert directly**:
   ```sql
   -- This should work (as anon user in Supabase SQL Editor, or via API)
   INSERT INTO contact_messages (name, email, message, category)
   VALUES ('Test User', 'test@example.com', 'This is a test message with at least 10 characters', 'general');
   ```

5. **Check API route logs**: Look for specific error messages in your Vercel/deployment logs

## Notes

- The application uses NextAuth (not Supabase Auth), so `auth.uid()` will be NULL for most users
- The INSERT policy uses `TO public` which works for both anonymous and authenticated users
- Admin policies check for role in the `users` table (assuming you have a `role` column)
- The API route already has comprehensive validation, so the RLS WITH CHECK is defense-in-depth


