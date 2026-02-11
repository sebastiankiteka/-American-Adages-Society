-- Add indexes to improve performance of stats queries
-- These indexes help the /api/users/[id]/stats endpoint run faster

-- Index for finding user's comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id) WHERE deleted_at IS NULL;

-- Index for finding user's blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id) WHERE deleted_at IS NULL;

-- Index for finding user's adages
CREATE INDEX IF NOT EXISTS idx_adages_created_by ON adages(created_by) WHERE deleted_at IS NULL;

-- Index for finding user's forum replies
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id) WHERE deleted_at IS NULL;

-- Index for finding user's forum threads
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id) WHERE deleted_at IS NULL;

-- Index for finding challenges on specific content
CREATE INDEX IF NOT EXISTS idx_reader_challenges_target ON reader_challenges(target_type, target_id) WHERE deleted_at IS NULL;

-- Index for finding citations by submitter
CREATE INDEX IF NOT EXISTS idx_citations_submitted_by ON citations(submitted_by) WHERE deleted_at IS NULL;

-- Index for finding challenges by challenger
CREATE INDEX IF NOT EXISTS idx_reader_challenges_challenger_id ON reader_challenges(challenger_id) WHERE deleted_at IS NULL;

-- Index for votes on comments (already exists but ensuring it's optimized)
CREATE INDEX IF NOT EXISTS idx_votes_comment_target ON votes(target_type, target_id) WHERE target_type = 'comment';

-- Index for votes on blog posts
CREATE INDEX IF NOT EXISTS idx_votes_blog_target ON votes(target_type, target_id) WHERE target_type = 'blog';

-- Index for votes on adages
CREATE INDEX IF NOT EXISTS idx_votes_adage_target ON votes(target_type, target_id) WHERE target_type = 'adage';

-- Index for votes on forum replies
CREATE INDEX IF NOT EXISTS idx_votes_forum_reply_target ON votes(target_type, target_id) WHERE target_type = 'forum_reply';

-- Index for votes on forum threads
CREATE INDEX IF NOT EXISTS idx_votes_forum_thread_target ON votes(target_type, target_id) WHERE target_type = 'forum_thread';















