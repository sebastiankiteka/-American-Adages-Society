# Database Schema

This schema file is **idempotent** - it's safe to run multiple times. It uses:
- `CREATE TABLE IF NOT EXISTS` - won't error if tables already exist
- `CREATE INDEX IF NOT EXISTS` - won't error if indexes already exist
- `CREATE OR REPLACE FUNCTION` - updates functions if they exist
- `DROP TRIGGER IF EXISTS` - safely recreates triggers

## Running the Schema

1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy the entire contents of `schema.sql`
4. Paste into SQL Editor
5. Click "Run"

The schema will:
- ✅ Create all tables (if they don't exist)
- ✅ Create all indexes (if they don't exist)
- ✅ Create/update functions
- ✅ Create/update triggers

## What Gets Created

- **24 tables** for the complete application
- **12 indexes** for performance
- **2 functions** for automatic updates
- **10 triggers** for maintaining data integrity

## Troubleshooting

### "relation already exists" errors
- The schema now uses `IF NOT EXISTS` - this shouldn't happen
- If you still see errors, some tables may have been created manually
- You can safely ignore these errors or drop the existing tables first

### "function already exists" 
- Functions use `CREATE OR REPLACE` - they'll be updated automatically
- This is expected behavior

### "trigger already exists"
- Triggers are dropped and recreated - this is safe
- The `DROP TRIGGER IF EXISTS` prevents errors

## Schema Updates

If you need to modify the schema:
1. Make changes to `schema.sql`
2. Run the updated schema in Supabase
3. The `IF NOT EXISTS` clauses ensure only new/changed items are created

