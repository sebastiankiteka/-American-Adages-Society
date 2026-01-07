-- Migration: Add sample forum section with example content
-- Run this in Supabase SQL Editor

-- Insert a sample forum section
INSERT INTO forum_sections (title, slug, description, rules, order_index, locked)
VALUES (
  'General Discussion',
  'general-discussion',
  'A place for general conversations about adages, their meanings, and cultural significance.',
  'Rules:
1. Be respectful and constructive in all discussions
2. Stay on topic - discussions should relate to adages or language
3. No spam or self-promotion
4. Use clear, descriptive thread titles
5. Search before posting to avoid duplicate threads',
  0,
  false
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Get the section ID (you may need to run this separately if the above doesn't return it)
-- For now, we'll use a subquery approach

-- Insert a sample thread (if a user exists)
-- Note: This will only work if you have at least one user in the database
-- If no admin exists, it will use any user; if no users exist, the thread won't be created
DO $$
DECLARE
  section_id_val UUID;
  user_id_val UUID;
BEGIN
  -- Get the section ID
  SELECT id INTO section_id_val FROM forum_sections WHERE slug = 'general-discussion' LIMIT 1;
  
  -- Get any user (prefer admin, but use any user if no admin exists)
  SELECT id INTO user_id_val 
  FROM users 
  WHERE deleted_at IS NULL 
  ORDER BY CASE WHEN role = 'admin' THEN 1 ELSE 2 END
  LIMIT 1;
  
  -- Insert thread if we have both section and user
  IF section_id_val IS NOT NULL AND user_id_val IS NOT NULL THEN
    INSERT INTO forum_threads (section_id, title, slug, content, author_id, pinned, views_count, replies_count)
    VALUES (
      section_id_val,
      'Welcome to the Forum!',
      'welcome-to-the-forum',
      'Welcome to the American Adages Society forum! This is a space for discussing adages, their origins, meanings, and how they relate to our culture and language.

Feel free to:
- Share interesting adages you''ve discovered
- Discuss the meanings and interpretations of adages
- Ask questions about adage origins
- Share examples of adages in modern usage

Let''s start some great conversations!',
      user_id_val,
      true,
      0,
      0
    )
    ON CONFLICT (section_id, slug) DO NOTHING;
  END IF;
END $$;

-- Insert a sample reply to the welcome thread
DO $$
DECLARE
  thread_id_val UUID;
  user_id_val UUID;
BEGIN
  -- Get the thread ID
  SELECT id INTO thread_id_val FROM forum_threads WHERE slug = 'welcome-to-the-forum' LIMIT 1;
  
  -- Get any user (prefer admin, but use any user if no admin exists)
  SELECT id INTO user_id_val 
  FROM users 
  WHERE deleted_at IS NULL 
  ORDER BY CASE WHEN role = 'admin' THEN 1 ELSE 2 END
  LIMIT 1;
  
  -- Insert reply if we have both thread and user
  IF thread_id_val IS NOT NULL AND user_id_val IS NOT NULL THEN
    INSERT INTO forum_replies (thread_id, content, author_id)
    VALUES (
      thread_id_val,
      'Thanks for creating this forum! I''m excited to discuss adages with the community. One of my favorites is "The early bird catches the worm" - it''s so simple yet so true about the value of being proactive.',
      user_id_val
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Update thread's last_reply_at and replies_count
UPDATE forum_threads
SET 
  last_reply_at = NOW(),
  replies_count = (
    SELECT COUNT(*) 
    FROM forum_replies 
    WHERE thread_id = forum_threads.id 
    AND deleted_at IS NULL
  )
WHERE slug = 'welcome-to-the-forum';

