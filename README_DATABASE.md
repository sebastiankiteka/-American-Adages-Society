# Database Architecture Overview

## Database: Supabase (Postgres)

All data is stored in a single Postgres database hosted on Supabase. This includes:
- User accounts and authentication
- Adages archive
- Blog posts
- Comments and discussions
- Forum threads and replies
- Contact messages
- Mailing list
- Collections and saved adages
- Citations and challenges
- Moderation logs
- Activity tracking

## Key Design Principles

### 1. Soft Delete Everywhere
All major tables include `deleted_at` and/or `hidden_at` fields:
- `deleted_at`: Marks items as deleted (preserved for analytics)
- `hidden_at`: Marks items as hidden (for moderation, can be restored)

This preserves data history for:
- Analytics and reporting
- Moderation audit trails
- Data recovery if needed

### 2. Dynamic Vote Scoring
Votes are stored in a separate `votes` table. Scores are calculated dynamically:
- No raw counters stored
- Prevents vote manipulation
- Accurate real-time scores
- Can track individual votes for moderation

### 3. Unified Comments System
A single `comments` table handles comments for:
- Blog posts
- Adages
- Forum threads

Special "commendations" (official AAS comments) are marked with `is_commendation = true`.

### 4. Role-Based Access Control
User roles with hierarchy:
- `banned`: Cannot log in
- `restricted`: Read-only access
- `probation`: Rate-limited, flagged
- `user`: Standard privileges
- `moderator`: Content moderation
- `admin`: Full access

## Core Tables

### Users
- Authentication and profile data
- Role-based permissions
- Email verification status

### Adages
- Core adage content
- Enhanced scholarly fields:
  - First known usage (with uncertainty flag)
  - Geographic spread
  - Timeline data for popularity visualization
- Related tables:
  - `adage_variants`: Different versions
  - `adage_translations`: Multi-language support
  - `related_adages`: Relationships (similar, opposing, etc.)
  - `adage_usage_examples`: Official and community examples
  - `adage_timeline`: Historical popularity data

### Blog Posts
- Published articles and announcements
- Slug-based URLs
- Author tracking

### Forum System
- `forum_sections`: Top-level categories
- `forum_threads`: Discussion topics
- `forum_replies`: Thread responses
- Supports nested replies
- Lock/freeze capabilities

### Comments
- Unified system for all content types
- Nested replies via `parent_id`
- Commendations (official AAS comments)

### Votes
- One vote per user per target
- Supports upvote (+1) and downvote (-1)
- Toggle behavior (clicking same vote removes it)

### Contact & Mailing List
- `contact_messages`: Form submissions
- `mailing_list`: Email subscriptions
- Automatic categorization

### Collections
- User-created playlists of adages
- Public or private
- Notes per item

### Citations & Challenges
- `citations`: Academic sources for adages
- `reader_challenges`: Accuracy flags and corrections
- Moderation workflow

## API Routes

All API routes follow RESTful conventions:

- `GET /api/adages` - List adages (with filters)
- `GET /api/adages/[id]` - Get adage details
- `POST /api/adages` - Create adage (admin)
- `PUT /api/adages/[id]` - Update adage (admin)
- `DELETE /api/adages/[id]` - Soft delete adage (admin)

Similar patterns for:
- `/api/blog-posts`
- `/api/comments`
- `/api/votes`
- `/api/contact`
- `/api/mailing-list`
- `/api/forum/*`

## Authentication

Uses NextAuth v5 with:
- Email/password authentication
- JWT sessions
- Role-based access control
- Email verification (for forum posting)

## Data Flow

1. **Frontend** → API Route → **Supabase** → **Postgres**
2. All mutations go through API routes
3. API routes enforce permissions
4. Soft deletes preserve data
5. Activity logged for audit trail

## Performance Considerations

- Indexes on frequently queried fields
- Denormalized counts (e.g., `replies_count` on threads)
- Efficient vote score calculation
- View tracking separate from votes
- Pagination on list endpoints

## Security

- Row Level Security (RLS) policies in Supabase
- API route authentication checks
- Role-based permissions
- Input validation
- SQL injection prevention (via Supabase client)
- Rate limiting (to be implemented)

## Future Enhancements

- Full-text search (Postgres `tsvector`)
- Caching layer (Redis)
- Real-time subscriptions (Supabase Realtime)
- Advanced analytics queries
- Automated backups
- Data export functionality


