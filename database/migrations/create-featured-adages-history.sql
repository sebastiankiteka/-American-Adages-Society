-- Featured adages history table (tracks when adages were featured with reasons)
CREATE TABLE IF NOT EXISTS featured_adages_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  featured_from TIMESTAMP WITH TIME ZONE NOT NULL,
  featured_until TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_featured_history_adage ON featured_adages_history(adage_id);
CREATE INDEX IF NOT EXISTS idx_featured_history_dates ON featured_adages_history(featured_from, featured_until);
-- Note: Cannot create index with NOW() in predicate (not immutable)
-- Queries can still filter by current date at query time efficiently using the dates index above


