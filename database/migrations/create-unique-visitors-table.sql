-- Create unique_visitors table to track unique visitors over time
-- This stores each unique visitor (by user_id or IP) with their visit history

CREATE TABLE IF NOT EXISTS unique_visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45), -- IPv6 can be up to 45 chars
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_visits INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure we don't have duplicate entries
  -- A user_id OR ip_address must be present, but not both null
  CONSTRAINT unique_visitor_identifier CHECK (
    (user_id IS NOT NULL) OR (ip_address IS NOT NULL)
  )
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_unique_visitors_user_id ON unique_visitors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unique_visitors_ip_address ON unique_visitors(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_unique_visitors_first_visit ON unique_visitors(first_visit_at);
CREATE INDEX IF NOT EXISTS idx_unique_visitors_last_visit ON unique_visitors(last_visit_at);

-- Create a unique constraint: one entry per user_id (if logged in) OR one entry per IP (if anonymous)
-- We'll handle this in application logic since we can't easily enforce "unique user_id OR unique ip_address"

-- Function to update unique visitor record
CREATE OR REPLACE FUNCTION update_unique_visitor(
  p_user_id UUID DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_visitor_id UUID;
BEGIN
  -- Try to find existing visitor by user_id (if logged in)
  IF p_user_id IS NOT NULL THEN
    SELECT id INTO v_visitor_id
    FROM unique_visitors
    WHERE user_id = p_user_id
    LIMIT 1;
    
    IF v_visitor_id IS NOT NULL THEN
      -- Update existing visitor
      UPDATE unique_visitors
      SET 
        last_visit_at = NOW(),
        total_visits = total_visits + 1,
        updated_at = NOW()
      WHERE id = v_visitor_id;
      RETURN v_visitor_id;
    END IF;
  END IF;
  
  -- If no user_id match, try to find by IP (for anonymous users)
  IF p_ip_address IS NOT NULL AND p_user_id IS NULL THEN
    SELECT id INTO v_visitor_id
    FROM unique_visitors
    WHERE ip_address = p_ip_address
      AND user_id IS NULL
    LIMIT 1;
    
    IF v_visitor_id IS NOT NULL THEN
      -- Update existing anonymous visitor
      UPDATE unique_visitors
      SET 
        last_visit_at = NOW(),
        total_visits = total_visits + 1,
        updated_at = NOW()
      WHERE id = v_visitor_id;
      RETURN v_visitor_id;
    END IF;
  END IF;
  
  -- Create new unique visitor record
  INSERT INTO unique_visitors (user_id, ip_address, first_visit_at, last_visit_at, total_visits)
  VALUES (p_user_id, p_ip_address, NOW(), NOW(), 1)
  RETURNING id INTO v_visitor_id;
  
  RETURN v_visitor_id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy querying of unique visitor stats
CREATE OR REPLACE VIEW unique_visitor_stats AS
SELECT 
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as total_logged_in_visitors,
  COUNT(*) FILTER (WHERE user_id IS NULL) as total_anonymous_visitors,
  COUNT(*) as total_unique_visitors,
  COUNT(*) FILTER (WHERE first_visit_at >= CURRENT_DATE - INTERVAL '7 days') as new_visitors_7d,
  COUNT(*) FILTER (WHERE first_visit_at >= CURRENT_DATE - INTERVAL '30 days') as new_visitors_30d,
  COUNT(*) FILTER (WHERE last_visit_at >= CURRENT_DATE - INTERVAL '7 days') as active_visitors_7d,
  COUNT(*) FILTER (WHERE last_visit_at >= CURRENT_DATE - INTERVAL '30 days') as active_visitors_30d
FROM unique_visitors;


