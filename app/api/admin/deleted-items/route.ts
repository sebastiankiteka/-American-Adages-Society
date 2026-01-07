import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/admin/deleted-items - Get all deleted items
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const items: any[] = []

    // Fetch deleted comments
    if (!type || type === 'all' || type === 'comment') {
      const { data: comments } = await supabase
        .from('comments')
        .select('id, content, user_id, target_type, target_id, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(50)

      if (comments) {
        items.push(...comments.map(c => ({
          id: c.id,
          type: 'comment',
          content: c.content,
          deleted_at: c.deleted_at,
          original_data: c,
        })))
      }
    }

    // Fetch deleted adages
    if (!type || type === 'all' || type === 'adage') {
      const { data: adages } = await supabase
        .from('adages')
        .select('id, adage, definition, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(50)

      if (adages) {
        items.push(...adages.map(a => ({
          id: a.id,
          type: 'adage',
          adage: a.adage,
          deleted_at: a.deleted_at,
          original_data: a,
        })))
      }
    }

    // Fetch deleted blog posts
    if (!type || type === 'all' || type === 'blog') {
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, content, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(50)

      if (blogs) {
        items.push(...blogs.map(b => ({
          id: b.id,
          type: 'blog',
          title: b.title,
          content: b.content,
          deleted_at: b.deleted_at,
          original_data: b,
        })))
      }
    }

    // Fetch deleted forum threads
    if (!type || type === 'all' || type === 'forum_thread') {
      const { data: threads } = await supabase
        .from('forum_threads')
        .select('id, title, content, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(50)

      if (threads) {
        items.push(...threads.map(t => ({
          id: t.id,
          type: 'forum_thread',
          title: t.title,
          content: t.content,
          deleted_at: t.deleted_at,
          original_data: t,
        })))
      }
    }

    // Fetch deleted forum replies
    if (!type || type === 'all' || type === 'forum_reply') {
      const { data: replies } = await supabase
        .from('forum_replies')
        .select('id, content, deleted_at')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(50)

      if (replies) {
        items.push(...replies.map(r => ({
          id: r.id,
          type: 'forum_reply',
          content: r.content,
          deleted_at: r.deleted_at,
          original_data: r,
        })))
      }
    }

    // Fetch all challenges that have been decided (moved to deleted items)
    // This includes both accepted and rejected challenges, with or without appeals
    if (!type || type === 'all' || type === 'challenge') {
      const { data: challenges } = await supabase
        .from('reader_challenges')
        .select('id, target_type, target_id, challenge_reason, status, appeal_decision, deleted_at')
        .not('deleted_at', 'is', null)
        .in('status', ['accepted', 'rejected']) // Only challenges that have been decided
        .order('deleted_at', { ascending: false })
        .limit(50)

      if (challenges) {
        items.push(...challenges.map(c => ({
          id: c.id,
          type: 'challenge',
          title: `Challenge: ${c.target_type} (${c.status})`,
          content: c.challenge_reason,
          status: c.status,
          appeal_decision: c.appeal_decision,
          deleted_at: c.deleted_at,
          original_data: c,
        })))
      }
    }

    // Sort by deleted_at descending
    items.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime())

    return NextResponse.json<ApiResponse>({
      success: true,
      data: items,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch deleted items',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

