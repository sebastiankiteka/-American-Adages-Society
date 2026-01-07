import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/friends - Get user's friends list
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'accepted', 'all'

    // Get friendships where user is the requester
    // Use supabaseAdmin to bypass RLS since we're using NextAuth (not Supabase Auth)
    // We've already validated the user above, and we're filtering by user.id
    let query1 = supabaseAdmin
      .from('friendships')
      .select(`
        *,
        friend:users!friend_id(id, username, display_name, profile_image_url, role)
      `)
      .eq('user_id', user.id)

    if (status && status !== 'all') {
      query1 = query1.eq('status', status)
    }

    const { data: friendships1, error: error1 } = await query1

    // Get friendships where user is the friend (recipient)
    let query2 = supabaseAdmin
      .from('friendships')
      .select(`
        *,
        user:users!user_id(id, username, display_name, profile_image_url, role)
      `)
      .eq('friend_id', user.id)

    if (status && status !== 'all') {
      query2 = query2.eq('status', status)
    }

    const { data: friendships2, error: error2 } = await query2

    if (error1 || error2) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error1?.message || error2?.message || 'Failed to fetch friends',
      }, { status: 500 })
    }

    // Combine and format friendships
    const allFriendships = [
      ...(friendships1?.map(f => ({
        ...f,
        other_user: f.friend,
        direction: 'outgoing' as const,
      })) || []),
      ...(friendships2?.map(f => ({
        ...f,
        other_user: f.user,
        direction: 'incoming' as const,
      })) || []),
    ]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: allFriendships,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch friends',
    }, { status: 500 })
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const { friend_id } = body

    if (!friend_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Friend ID is required',
      }, { status: 400 })
    }

    if (friend_id === user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You cannot friend yourself',
      }, { status: 400 })
    }

    // Check if target user exists
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', friend_id)
      .is('deleted_at', null)
      .single()

    if (!targetUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Check if target user has private profile (if column exists)
    try {
      const { data: privacyData } = await supabase
        .from('users')
        .select('profile_private')
        .eq('id', friend_id)
        .single()
      
      if (privacyData && 'profile_private' in privacyData && privacyData.profile_private === true) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'This user has a private profile and does not accept friend requests',
        }, { status: 403 })
      }
    } catch (e) {
      // Column doesn't exist yet, allow friend requests
    }

    // Check if friendship already exists or if user is blocked
    // Use supabaseAdmin to bypass RLS
    const { data: existing } = await supabaseAdmin
      .from('friendships')
      .select('id, status, user_id, friend_id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user.id})`)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'You are already friends with this user',
        }, { status: 400 })
      } else if (existing.status === 'pending') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Friend request already pending',
        }, { status: 400 })
      } else if (existing.status === 'blocked') {
        // Check if current user is blocked by the target user
        if (existing.friend_id === user.id && existing.user_id === friend_id) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'You cannot send a friend request to this user',
          }, { status: 403 })
        }
        // If current user blocked the target, they can't send a request
        if (existing.user_id === user.id && existing.friend_id === friend_id) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: 'You have blocked this user',
          }, { status: 403 })
        }
      }
    }

    // Create friendship request
    // Use supabaseAdmin to bypass RLS since we're using NextAuth (not Supabase Auth)
    // We've already validated that user.id matches the authenticated user above
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message || 'Failed to create friendship request',
      }, { status: 400 })
    }

    // Get requester's display name for notification
    const { data: requesterData } = await supabase
      .from('users')
      .select('display_name, username')
      .eq('id', user.id)
      .single()

    const requesterName = requesterData?.display_name || requesterData?.username || 'Someone'

    // Create notification for the friend request recipient
    const { sendNotification } = await import('@/lib/notifications')
    await sendNotification({
      user_id: friend_id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${requesterName} sent you a friend request.`,
      related_id: data.id,
      related_type: 'friendship',
    }, true) // Send email notification

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Friend request sent',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to send friend request',
    }, { status: 500 })
  }
}

