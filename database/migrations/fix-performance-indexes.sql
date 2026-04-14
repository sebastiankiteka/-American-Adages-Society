-- Fix Supabase linter PERFORMANCE issues: unindexed_foreign_keys and unused_index.
-- Run in Supabase SQL Editor. Idempotent (IF NOT EXISTS / IF EXISTS).

-- =============================================================================
-- 1. ADD INDEXES for unindexed foreign keys (improves JOINs and CASCADE performance)
-- =============================================================================

-- activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);

-- adage_timeline
CREATE INDEX IF NOT EXISTS idx_adage_timeline_adage_id ON public.adage_timeline(adage_id);

-- adage_translations
CREATE INDEX IF NOT EXISTS idx_adage_translations_adage_id ON public.adage_translations(adage_id);

-- adage_usage_examples
CREATE INDEX IF NOT EXISTS idx_adage_usage_examples_adage_id ON public.adage_usage_examples(adage_id);
CREATE INDEX IF NOT EXISTS idx_adage_usage_examples_created_by ON public.adage_usage_examples(created_by);

-- adage_variants
CREATE INDEX IF NOT EXISTS idx_adage_variants_adage_id ON public.adage_variants(adage_id);

-- adages
CREATE INDEX IF NOT EXISTS idx_adages_updated_by ON public.adages(updated_by);

-- citations
CREATE INDEX IF NOT EXISTS idx_citations_adage_id ON public.citations(adage_id);
CREATE INDEX IF NOT EXISTS idx_citations_verified_by ON public.citations(verified_by);

-- collection_items (collection_id already covered by UNIQUE; adage_id was missing)
CREATE INDEX IF NOT EXISTS idx_collection_items_adage_id ON public.collection_items(adage_id);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_replied_by ON public.contact_messages(replied_by);

-- documents
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);

-- events
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_related_blog_post_id ON public.events(related_blog_post_id);

-- featured_adages_history
CREATE INDEX IF NOT EXISTS idx_featured_adages_history_created_by ON public.featured_adages_history(created_by);

-- forum_replies
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent_reply_id ON public.forum_replies(parent_reply_id);

-- forum_sections
CREATE INDEX IF NOT EXISTS idx_forum_sections_subsection_of ON public.forum_sections(subsection_of);

-- friendships
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);

-- message_replies
CREATE INDEX IF NOT EXISTS idx_message_replies_sender_id ON public.message_replies(sender_id);

-- moderation_log
CREATE INDEX IF NOT EXISTS idx_moderation_log_moderator_id ON public.moderation_log(moderator_id);

-- reader_challenges
CREATE INDEX IF NOT EXISTS idx_reader_challenges_reviewed_by ON public.reader_challenges(reviewed_by);

-- related_adages
CREATE INDEX IF NOT EXISTS idx_related_adages_related_adage_id ON public.related_adages(related_adage_id);

-- views
CREATE INDEX IF NOT EXISTS idx_views_user_id ON public.views(user_id);

-- =============================================================================
-- 2. DROP unused indexes (linter: "has not been used" – re-add if queries need them)
-- =============================================================================

-- adages
DROP INDEX IF EXISTS public.idx_adages_tags;

-- votes
DROP INDEX IF EXISTS public.idx_votes_user;

-- activity_log
DROP INDEX IF EXISTS public.idx_activity_log_created;

-- contact_messages
DROP INDEX IF EXISTS public.idx_contact_messages_user;
DROP INDEX IF EXISTS public.idx_contact_messages_reply;

-- comments
DROP INDEX IF EXISTS public.idx_comments_user_id;

-- message_replies
DROP INDEX IF EXISTS public.idx_message_replies_created;

-- blog_posts
DROP INDEX IF EXISTS public.idx_blog_posts_author_id;

-- notifications
DROP INDEX IF EXISTS public.idx_notifications_user;

-- forum_replies
DROP INDEX IF EXISTS public.idx_forum_replies_author_id;

-- forum_threads
DROP INDEX IF EXISTS public.idx_forum_threads_author_id;

-- reader_challenges
DROP INDEX IF EXISTS public.idx_reader_challenges_target;
DROP INDEX IF EXISTS public.idx_reader_challenges_challenger_id;
DROP INDEX IF EXISTS public.idx_challenges_appeal;

-- votes (type-specific partial indexes)
DROP INDEX IF EXISTS public.idx_votes_comment_target;
DROP INDEX IF EXISTS public.idx_votes_blog_target;
DROP INDEX IF EXISTS public.idx_votes_adage_target;
DROP INDEX IF EXISTS public.idx_votes_forum_reply_target;
DROP INDEX IF EXISTS public.idx_votes_forum_thread_target;

-- documents
DROP INDEX IF EXISTS public.idx_documents_category;
DROP INDEX IF EXISTS public.idx_documents_published;

-- users
DROP INDEX IF EXISTS public.idx_users_featured_comments;
DROP INDEX IF EXISTS public.idx_users_profile_private;
DROP INDEX IF EXISTS public.idx_users_banned;
DROP INDEX IF EXISTS public.idx_users_comments_friends_only;
DROP INDEX IF EXISTS public.idx_users_email_weekly_adage;
DROP INDEX IF EXISTS public.idx_users_email_events;
DROP INDEX IF EXISTS public.idx_users_email_site_updates;
DROP INDEX IF EXISTS public.idx_users_email_archive_additions;
DROP INDEX IF EXISTS public.idx_users_email_comment_notifications;
DROP INDEX IF EXISTS public.idx_users_email_inbox_only;

-- password_reset_tokens
DROP INDEX IF EXISTS public.idx_password_reset_tokens_token;
DROP INDEX IF EXISTS public.idx_password_reset_tokens_user;

-- mailing_list
DROP INDEX IF EXISTS public.idx_mailing_list_user;
