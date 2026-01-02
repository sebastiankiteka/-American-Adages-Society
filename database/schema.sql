-- American Adages Society Database Schema
-- Postgres-compatible SQL for Supabase or any Postgres database
-- All tables include soft-delete support (deleted_at, hidden_at)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access control
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255), -- nullable for OAuth users
  username VARCHAR(100) UNIQUE,
  display_name VARCHAR(255),
  bio TEXT,
  profile_image_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user', 'restricted', 'probation', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'moderator', 'user', 'restricted', 'probation', 'banned'))
);

-- Adages table (enhanced with scholarly depth)
CREATE TABLE adages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  tags TEXT[], -- array of tags
  featured BOOLEAN DEFAULT FALSE, -- for weekly adage feature
  featured_until TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Adage variants (different versions of the same adage)
CREATE TABLE adage_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  variant_text TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Adage translations
CREATE TABLE adage_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  translator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Related adages (bidirectional relationships)
CREATE TABLE related_adages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  related_adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) CHECK (relationship_type IN ('similar', 'opposing', 'commonly_paired', 'variant', 'derived_from')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(adage_id, related_adage_id, relationship_type)
);

-- Adage usage examples
CREATE TABLE adage_usage_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  example_text TEXT NOT NULL,
  context TEXT,
  source_type VARCHAR(20) DEFAULT 'community' CHECK (source_type IN ('official', 'community')),
  created_by UUID REFERENCES users(id), -- null for official examples
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Adage timeline data (for popularity over time visualization)
CREATE TABLE adage_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  time_period_start DATE NOT NULL,
  time_period_end DATE,
  popularity_level VARCHAR(20) CHECK (popularity_level IN ('rare', 'uncommon', 'common', 'very_common', 'ubiquitous')),
  notes TEXT,
  sources TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Blog posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  author_id UUID REFERENCES users(id),
  author_name VARCHAR(255), -- fallback if author deleted
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(500),
  event_type VARCHAR(50) CHECK (event_type IN ('discussion', 'workshop', 'speaker', 'other')),
  ical_link TEXT,
  google_calendar_link TEXT,
  photo_gallery_urls TEXT[], -- array of image URLs
  related_adage_ids UUID[], -- array of related adage IDs
  related_forum_thread_id UUID, -- link to forum discussion
  related_blog_post_id UUID REFERENCES blog_posts(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Forum sections
CREATE TABLE forum_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  rules TEXT, -- publicly readable rules
  subsection_of UUID REFERENCES forum_sections(id), -- for nested sections
  order_index INTEGER DEFAULT 0,
  locked BOOLEAN DEFAULT FALSE,
  moderation_permissions JSONB, -- flexible permissions config
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Forum threads
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES forum_sections(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  frozen BOOLEAN DEFAULT FALSE, -- frozen = no new replies
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0, -- denormalized for performance
  last_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(section_id, slug)
);

-- Forum replies
CREATE TABLE forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE, -- for nested replies
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Unified comments system (for blogs, adages, forum posts)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('blog', 'adage', 'forum')),
  target_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for nested replies
  user_id UUID REFERENCES users(id), -- nullable only if guest commenting enabled later
  content TEXT NOT NULL,
  is_commendation BOOLEAN DEFAULT FALSE, -- special "Example Usage" comments by AAS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  hidden_at TIMESTAMP WITH TIME ZONE
);

-- Votes table (for comments, adages, blog posts, forum threads/replies)
-- DO NOT store raw counters - compute dynamically
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('adage', 'blog', 'comment', 'forum_thread', 'forum_reply', 'usage_example')),
  target_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id) -- one vote per user per target
);

-- Views tracking (separate from votes)
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('adage', 'blog', 'forum_thread')),
  target_id UUID NOT NULL,
  user_id UUID REFERENCES users(id), -- nullable for anonymous views
  ip_address INET,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'correction', 'event', 'partnership', 'donation', 'other')),
  priority INTEGER DEFAULT 0,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Mailing list
CREATE TABLE mailing_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(50) CHECK (source IN ('contact', 'signup', 'forum')),
  confirmed BOOLEAN DEFAULT FALSE,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- User collections (playlist-style saved adages)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Collection items (adages in collections)
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(collection_id, adage_id)
);

-- Citations and reader challenges
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adage_id UUID NOT NULL REFERENCES adages(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  source_url TEXT,
  source_type VARCHAR(50) CHECK (source_type IN ('academic', 'historical', 'literary', 'other')),
  submitted_by UUID REFERENCES users(id),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Reader challenges (accuracy flags)
CREATE TABLE reader_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('adage', 'blog', 'comment')),
  target_id UUID NOT NULL,
  challenger_id UUID REFERENCES users(id),
  challenge_reason TEXT NOT NULL,
  suggested_correction TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- User friendships (for social features)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Moderation actions log
CREATE TABLE moderation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('ban', 'soft_ban', 'unban', 'hide', 'unhide', 'lock', 'unlock', 'freeze', 'unfreeze', 'delete', 'restore')),
  target_type VARCHAR(20) NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  duration_hours INTEGER, -- for temporary actions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed (for admin dashboard)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(20),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_adages_featured ON adages(featured, featured_until) WHERE deleted_at IS NULL AND hidden_at IS NULL;
CREATE INDEX idx_adages_tags ON adages USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_target ON comments(target_type, target_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_votes_target ON votes(target_type, target_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_forum_threads_section ON forum_threads(section_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_forum_replies_thread ON forum_replies(thread_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contact_messages_unread ON contact_messages(read_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_views_target ON views(target_type, target_id);
CREATE INDEX idx_collections_user ON collections(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adages_updated_at BEFORE UPDATE ON adages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update forum thread reply counts
CREATE OR REPLACE FUNCTION update_forum_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET replies_count = replies_count + 1,
        last_reply_at = NOW()
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads 
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER forum_reply_count_trigger
AFTER INSERT OR DELETE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_forum_thread_reply_count();


