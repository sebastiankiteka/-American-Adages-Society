-- =============================================================================
-- site_metrics: stores dashboard metrics (e.g. total_adages) so the dashboard
-- and Archive stay in sync. A trigger keeps total_adages updated on adage changes.
-- Run in Supabase SQL Editor.
-- =============================================================================

-- Table for key/value metrics (counts). Use value for numeric metrics.
CREATE TABLE IF NOT EXISTS site_metrics (
  key TEXT PRIMARY KEY,
  value BIGINT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill total_adages from current adages table (same logic as Archive: visible only)
INSERT INTO site_metrics (key, value, updated_at)
SELECT 'total_adages', COUNT(*)::BIGINT, NOW()
  FROM adages
  WHERE deleted_at IS NULL AND hidden_at IS NULL
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Function: refresh total_adages in site_metrics
CREATE OR REPLACE FUNCTION refresh_total_adages_metric()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO site_metrics (key, value, updated_at)
  SELECT 'total_adages', COUNT(*)::BIGINT, NOW()
    FROM adages
    WHERE deleted_at IS NULL AND hidden_at IS NULL
  ON CONFLICT (key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  RETURN NULL;
END;
$$;

-- Trigger: after any change to adages, refresh the metric
DROP TRIGGER IF EXISTS trigger_refresh_total_adages_metric ON adages;
CREATE TRIGGER trigger_refresh_total_adages_metric
  AFTER INSERT OR DELETE OR UPDATE OF deleted_at, hidden_at
  ON adages
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_total_adages_metric();

-- One-time refresh so the trigger's logic is applied (in case of existing rows)
INSERT INTO site_metrics (key, value, updated_at)
SELECT 'total_adages', COUNT(*)::BIGINT, NOW()
  FROM adages
  WHERE deleted_at IS NULL AND hidden_at IS NULL
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
