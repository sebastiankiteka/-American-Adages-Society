// API route to check friendship status between current user and another user
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/friends/status?user_id=xxx - Check friendship status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const otherUserId = searchParams.get('user_id')

    if (!otherUserId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id is required',
      }, { status: 400 })
    }

    if (otherUserId === user.id) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { status: 'self' },
      })
    }

    // Check if friendship exists (including blocked status)
    // Use supabaseAdmin to bypass RLS since we're using NextAuth (not Supabase Auth)
    const { data: friendship } = await supabaseAdmin
      .from('friendships')
      .select('id, status, user_id, friend_id, updated_at')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${user.id})`)
      .maybeSingle()

    if (!friendship) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { status: 'none' },
      })
    }

    // Determine direction
    const direction = friendship.user_id === user.id ? 'outgoing' : 'incoming'

    // For accepted friendships, use updated_at as the "friends since" date
    const friendsSince = friendship.status === 'accepted' ? friendship.updated_at : undefined

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        status: friendship.status,
        direction,
        friendship_id: friendship.id,
        friends_since: friendsSince,
      },
    })
  } catch (error: any) {
    // If no friendship found, return 'none' status
    if (error.message?.includes('No rows')) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { status: 'none' },
      })
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to check friendship status',
    }, { status: 500 })
  }
}

