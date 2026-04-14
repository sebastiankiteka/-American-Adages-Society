-- =============================================================================
-- Remove overly permissive "Allow all access ..." RLS policies that were added
-- as a temporary fix and are now triggering Supabase's rls_policy_always_true
-- warnings. This migration ONLY drops those specific policies if they exist.
-- It does NOT disable RLS or remove any more-specific policies you already have.
-- =============================================================================

-- activity_log
DROP POLICY IF EXISTS "Allow all access activity_log" ON public.activity_log;

-- adage_timeline
DROP POLICY IF EXISTS "Allow all access adage_timeline" ON public.adage_timeline;

-- adage_translations
DROP POLICY IF EXISTS "Allow all access adage_translations" ON public.adage_translations;

-- adage_usage_examples
DROP POLICY IF EXISTS "Allow all access adage_usage_examples" ON public.adage_usage_examples;

-- adage_variants
DROP POLICY IF EXISTS "Allow all access adage_variants" ON public.adage_variants;

-- citations
DROP POLICY IF EXISTS "Allow all access citations" ON public.citations;

-- collection_items
DROP POLICY IF EXISTS "Allow all access collection_items" ON public.collection_items;

-- collections
DROP POLICY IF EXISTS "Allow all access collections" ON public.collections;

-- documents
DROP POLICY IF EXISTS "Allow all access documents" ON public.documents;

-- featured_adages_history
DROP POLICY IF EXISTS "Allow all access featured_adages_history" ON public.featured_adages_history;

-- mailing_list
DROP POLICY IF EXISTS "Allow all access mailing_list" ON public.mailing_list;

-- message_replies
DROP POLICY IF EXISTS "Allow all access message_replies" ON public.message_replies;

-- moderation_log
DROP POLICY IF EXISTS "Allow all access moderation_log" ON public.moderation_log;

-- notifications
DROP POLICY IF EXISTS "Allow all access notifications" ON public.notifications;

-- password_reset_tokens
DROP POLICY IF EXISTS "Allow all access password_reset_tokens" ON public.password_reset_tokens;

-- reader_challenges
DROP POLICY IF EXISTS "Allow all access reader_challenges" ON public.reader_challenges;

-- related_adages
DROP POLICY IF EXISTS "Allow all access related_adages" ON public.related_adages;

-- saved_adages
DROP POLICY IF EXISTS "Allow all access saved_adages" ON public.saved_adages;

