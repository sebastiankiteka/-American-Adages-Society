-- ============================================
-- Migration: Create version history tables for adages and blog posts
-- ============================================
-- 
-- IMPORTANT: This migration is idempotent (safe to run multiple times)
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Review the changes (tables, triggers, indexes)
-- 4. Click "Run" to execute
-- 
-- SAFETY NOTES:
-- - This migration creates new tables (adage_versions, blog_post_versions)
-- - It does NOT modify existing data
-- - Triggers will automatically create versions on future updates
-- - Old versions are preserved (no data loss)
-- 
-- VERIFICATION:
-- After running, verify with:
--   SELECT COUNT(*) FROM adage_versions;
--   SELECT COUNT(*) FROM blog_post_versions;
-- 
-- ROLLBACK (if needed):
--   DROP TRIGGER IF EXISTS trigger_create_adage_version ON adages;
--   DROP TRIGGER IF EXISTS trigger_create_blog_post_version ON blog_posts;
--   DROP TABLE IF EXISTS adage_versions;
--   DROP TABLE IF EXISTS blog_post_versions;
--   DROP FUNCTION IF EXISTS create_adage_version();
--   DROP FUNCTION IF EXISTS create_blog_post_version();
-- ============================================

-- Version history for adages
CREATE TABLE IF NOT EXISTS adage_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  adage TEXT NOT NULL,
  definition TEXT NOT NULL,
  origin TEXT,
  etymology TEXT,
  historical_context TEXT,
  interpretation TEXT,
  modern_practicality TEXT,
  first_known_usage TEXT,
  first_known_usage_date DATE,
  first_known_usage_uncertain BOOLEAN DEFAULT FALSE,
  geographic_spread TEXT,
  tags TEXT[],
  changed_by UUID REFERENCES users(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(adage_id, version_number)
);

-- Version history for blog posts
CREATE TABLE IF NOT EXISTS blog_post_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  slug VARCHAR(500),
  tags TEXT[],
  changed_by UUID REFERENCES users(id),
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_adage_versions_adage ON adage_versions(adage_id);
CREATE INDEX IF NOT EXISTS idx_adage_versions_created ON adage_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_post ON blog_post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_versions_created ON blog_post_versions(created_at);

-- Function to create version before update
CREATE OR REPLACE FUNCTION create_adage_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM adage_versions
  WHERE adage_id = NEW.id;
  
  INSERT INTO adage_versions (
    adage_id, version_number, adage, definition, origin, etymology,
    historical_context, interpretation, modern_practicality,
    first_known_usage, first_known_usage_date, first_known_usage_uncertain,
    geographic_spread, tags, changed_by
  ) VALUES (
    NEW.id, next_version, NEW.adage, NEW.definition, NEW.origin, NEW.etymology,
    NEW.historical_context, NEW.interpretation, NEW.modern_practicality,
    NEW.first_known_usage, NEW.first_known_usage_date, NEW.first_known_usage_uncertain,
    NEW.geographic_spread, NEW.tags, NEW.updated_by
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create blog post version before update
CREATE OR REPLACE FUNCTION create_blog_post_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM blog_post_versions
  WHERE post_id = NEW.id;
  
  INSERT INTO blog_post_versions (
    post_id, version_number, title, excerpt, content, slug, tags, changed_by
  ) VALUES (
    NEW.id, next_version, NEW.title, NEW.excerpt, NEW.content, NEW.slug, NEW.tags, NEW.updated_by
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_by column to adages if it doesn't exist
ALTER TABLE adages ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Add updated_by column to blog_posts if it doesn't exist
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Create triggers (drop first if they exist)
DROP TRIGGER IF EXISTS trigger_create_adage_version ON adages;
CREATE TRIGGER trigger_create_adage_version
  BEFORE UPDATE ON adages
  FOR EACH ROW
  WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
  EXECUTE FUNCTION create_adage_version();

DROP TRIGGER IF EXISTS trigger_create_blog_post_version ON blog_posts;
CREATE TRIGGER trigger_create_blog_post_version
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  WHEN (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
  EXECUTE FUNCTION create_blog_post_version();

