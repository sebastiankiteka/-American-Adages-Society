// API route to get notification counts for user
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/users/notifications/counts - Get notification counts
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Get unread notifications count
    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .is('read_at', null)

    // Get unread messages count
    const { count: unreadMessages } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('email', user.email || '')
      .is('read_at', null)
      .is('deleted_at', null)

    // Get pending friend requests count
    const { count: pendingFriendRequests } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .is('deleted_at', null)

    // Get comments with reactions (votes) count
    const { data: userComments } = await supabase
      .from('comments')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const commentIds = userComments?.map(c => c.id) || []
    const { count: commentsWithReactions } = commentIds.length > 0
      ? await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('target_type', 'comment')
          .in('target_id', commentIds)
      : { count: 0 }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        notifications: unreadNotifications || 0,
        messages: unreadMessages || 0,
        friendRequests: pendingFriendRequests || 0,
        commentReactions: commentsWithReactions || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch notification counts',
    }, { status: 500 })
  }
}



