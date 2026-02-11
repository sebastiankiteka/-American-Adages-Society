# Quick Fix: Add profile_private Column

## Problem
You're seeing the error: `column users.profile_private does not exist`

## Solution
Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_private BOOLEAN DEFAULT FALSE;
```

## Steps:
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Paste the SQL command above
4. Click "Run" or press Ctrl+Enter
5. The column will be added and the error will be resolved

## Alternative: Run Full Migration
If you want to run all pending migrations, execute the contents of:
`database/migrations/RUN_ALL_MIGRATIONS.sql`

This includes the profile_private migration along with all other updates.















