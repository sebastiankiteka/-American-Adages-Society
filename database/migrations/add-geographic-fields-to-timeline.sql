-- Add geographic fields to adage_timeline table
ALTER TABLE adage_timeline 
ADD COLUMN IF NOT EXISTS primary_location TEXT,
ADD COLUMN IF NOT EXISTS geographic_changes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN adage_timeline.primary_location IS 'Primary geographic location where adage was most popular during this period (e.g., "United States", "New England", "British Isles")';
COMMENT ON COLUMN adage_timeline.geographic_changes IS 'Description of geographic spread changes during this period (e.g., "Spread from England to American colonies", "Became popular in urban areas")';


