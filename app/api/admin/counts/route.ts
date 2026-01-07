import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/admin/counts - Get counts of unread/new items for admin panel
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Get unread contact messages
    const { count: unreadMessages } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null)
      .is('deleted_at', null)

    // Get pending citations
    const { count: pendingCitations } = await supabase
      .from('citations')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false)
      .is('deleted_at', null)

    // Get pending challenges (only those not in deleted items)
    const { count: pendingChallenges } = await supabase
      .from('reader_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null)

    // Get deleted items count (only count appealed items for notification)
    // Count challenges with appeal decisions that are in deleted items
    const { count: appealedItems } = await supabase
      .from('reader_challenges')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)
      .not('appeal_decision', 'is', null) // Only items with appeal decisions

    // Get all deleted items count (for display)
    const { count: deletedItems } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    const { count: deletedAdages } = await supabase
      .from('adages')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    const { count: deletedBlogs } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    const { count: deletedThreads } = await supabase
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    const { count: deletedReplies } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    const totalDeleted = (deletedItems || 0) + (deletedAdages || 0) + (deletedBlogs || 0) + (deletedThreads || 0) + (deletedReplies || 0)

    // Get unread weekly email notifications for all admins
    // Check for unread system notifications about weekly featured adage for any admin
    const { data: adminUsers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .is('deleted_at', null)

    let weeklyEmailNotifications = 0
    if (adminUsers && adminUsers.length > 0) {
      const adminIds = adminUsers.map(a => a.id)
      // Check for unread system notifications about weekly featured adage
      const { count: weeklyNotifications } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .in('user_id', adminIds)
        .eq('type', 'system')
        .ilike('title', '%Weekly Featured Adage%')
        .is('read_at', null)
        .is('deleted_at', null)

      weeklyEmailNotifications = weeklyNotifications || 0
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        messages: unreadMessages || 0,
        citations: pendingCitations || 0,
        challenges: pendingChallenges || 0,
        deletedItems: totalDeleted,
        appealedItems: appealedItems || 0, // Notification count for deleted items panel
        weeklyEmailNotifications: weeklyEmailNotifications, // Notification count for mailing list panel
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch counts',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

