-- Check views table for anonymous users and date ranges
-- Run this in Supabase SQL Editor to see the breakdown

-- Check views by user type
SELECT 
  CASE 
    WHEN user_id IS NOT NULL THEN 'Logged-in'
    WHEN ip_address IS NOT NULL THEN 'Anonymous (with IP)'
    ELSE 'Anonymous (no IP)'
  END as visitor_type,
  COUNT(*) as view_count,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
  COUNT(DISTINCT ip_address) FILTER (WHERE ip_address IS NOT NULL) as unique_ips
FROM views
GROUP BY 
  CASE 
    WHEN user_id IS NOT NULL THEN 'Logged-in'
    WHEN ip_address IS NOT NULL THEN 'Anonymous (with IP)'
    ELSE 'Anonymous (no IP)'
  END;

-- Check views over time
SELECT 
  DATE(viewed_at) as view_date,
  COUNT(*) as total_views,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_logged_in_users,
  COUNT(DISTINCT ip_address) FILTER (WHERE user_id IS NULL AND ip_address IS NOT NULL) as unique_anonymous_ips,
  COUNT(*) FILTER (WHERE user_id IS NULL) as anonymous_views
FROM views
GROUP BY DATE(viewed_at)
ORDER BY view_date DESC
LIMIT 30;

-- Check if there are any views with NULL user_id (anonymous)
SELECT 
  COUNT(*) as anonymous_views_count,
  COUNT(DISTINCT ip_address) as unique_anonymous_ips,
  MIN(viewed_at) as first_anonymous_view,
  MAX(viewed_at) as last_anonymous_view
FROM views
WHERE user_id IS NULL;

