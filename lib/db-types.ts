// TypeScript types matching the database schema

export type UserRole = 'admin' | 'moderator' | 'user' | 'restricted' | 'probation' | 'banned'

export interface User {
  id: string
  email: string
  email_verified: boolean
  password_hash?: string
  username?: string
  display_name?: string
  bio?: string
  profile_image_url?: string
  role: UserRole
  created_at: string
  updated_at: string
  deleted_at?: string
  last_login_at?: string
}

export interface Adage {
  id: string
  adage: string
  definition: string
  origin?: string
  etymology?: string
  historical_context?: string
  interpretation?: string
  modern_practicality?: string
  first_known_usage?: string
  first_known_usage_date?: string
  first_known_usage_uncertain: boolean
  geographic_spread?: string
  tags?: string[]
  featured: boolean
  featured_until?: string
  published_at?: string
  views_count: number
  created_at: string
  updated_at: string
  created_by?: string
  deleted_at?: string
  hidden_at?: string
}

export interface AdageVariant {
  id: string
  adage_id: string
  variant_text: string
  notes?: string
  created_at: string
  deleted_at?: string
}

export interface AdageTranslation {
  id: string
  adage_id: string
  language_code: string
  translated_text: string
  translator_notes?: string
  created_at: string
  deleted_at?: string
}

export interface RelatedAdage {
  id: string
  adage_id: string
  related_adage_id: string
  relationship_type: 'similar' | 'opposing' | 'commonly_paired' | 'variant' | 'derived_from'
  notes?: string
  created_at: string
}

export interface AdageUsageExample {
  id: string
  adage_id: string
  example_text: string
  context?: string
  source_type: 'official' | 'community'
  created_by?: string
  created_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface AdageTimeline {
  id: string
  adage_id: string
  time_period_start: string
  time_period_end?: string
  popularity_level: 'rare' | 'uncommon' | 'common' | 'very_common' | 'ubiquitous'
  primary_location?: string
  geographic_changes?: string
  notes?: string
  sources?: string[]
  created_at: string
  deleted_at?: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt?: string
  content: string
  slug: string
  author_id?: string
  author_name?: string
  tags?: string[]
  published: boolean
  published_at?: string
  views_count: number
  created_at: string
  updated_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  end_date?: string
  location?: string
  event_type?: 'discussion' | 'workshop' | 'speaker' | 'other'
  ical_link?: string
  google_calendar_link?: string
  photo_gallery_urls?: string[]
  related_adage_ids?: string[]
  related_forum_thread_id?: string
  related_blog_post_id?: string
  created_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface ForumSection {
  id: string
  title: string
  slug: string
  description?: string
  rules?: string
  subsection_of?: string
  order_index: number
  locked: boolean
  moderation_permissions?: Record<string, any>
  created_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface ForumThread {
  id: string
  section_id: string
  title: string
  slug: string
  content: string
  author_id: string
  pinned: boolean
  locked: boolean
  frozen: boolean
  views_count: number
  replies_count: number
  last_reply_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface ForumReply {
  id: string
  thread_id: string
  parent_reply_id?: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface Comment {
  id: string
  target_type: 'blog' | 'adage' | 'forum' | 'user'
  target_id: string
  parent_id?: string
  user_id?: string
  content: string
  is_commendation: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
  hidden_at?: string
}

export interface Vote {
  id: string
  user_id: string
  target_type: 'adage' | 'blog' | 'comment' | 'forum_thread' | 'forum_reply' | 'usage_example'
  target_id: string
  value: -1 | 1
  created_at: string
  updated_at: string
}

export interface View {
  id: string
  target_type: 'adage' | 'blog' | 'forum_thread'
  target_id: string
  user_id?: string
  ip_address?: string
  viewed_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  category: 'general' | 'correction' | 'event' | 'partnership' | 'donation' | 'other'
  priority: number
  read_at?: string
  created_at: string
  deleted_at?: string
}

export interface MailingListEntry {
  id: string
  email: string
  source?: 'contact' | 'signup' | 'forum'
  confirmed: boolean
  date_added: string
  unsubscribed_at?: string
  deleted_at?: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CollectionItem {
  id: string
  collection_id: string
  adage_id: string
  date_added: string
  notes?: string
}

export interface Citation {
  id: string
  adage_id: string
  source_text: string
  source_url?: string
  source_type?: 'academic' | 'historical' | 'literary' | 'other'
  submitted_by?: string
  verified: boolean
  verified_by?: string
  verified_at?: string
  created_at: string
  deleted_at?: string
}

export interface ReaderChallenge {
  id: string
  target_type: 'adage' | 'blog' | 'comment'
  target_id: string
  challenger_id?: string
  challenge_reason: string
  suggested_correction?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  deleted_at?: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
}

export interface ModerationLog {
  id: string
  moderator_id: string
  action_type: 'ban' | 'soft_ban' | 'unban' | 'hide' | 'unhide' | 'lock' | 'unlock' | 'freeze' | 'unfreeze' | 'delete' | 'restore'
  target_type: string
  target_id: string
  reason?: string
  duration_hours?: number
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id?: string
  action_type: string
  target_type?: string
  target_id?: string
  details?: Record<string, any>
  created_at: string
}


