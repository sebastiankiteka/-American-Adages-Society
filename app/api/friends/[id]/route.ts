import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// PATCH /api/friends/[id] - Accept/reject/block friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { action } = body // 'accept', 'reject', 'block', 'unblock'

    if (!['accept', 'reject', 'block', 'unblock'].includes(action)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Valid action is required',
      }, { status: 400 })
    }

    // Find the friendship - use supabaseAdmin to bypass RLS
    // We validate the user above, so this is safe
    const { data: friendship } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${user.id})`)
      .single()

    if (!friendship) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Friendship not found',
      }, { status: 404 })
    }

    // Validate that the user has permission to perform this action
    // For accept/reject: user must be the recipient (friend_id)
    // For block/unblock/remove: user must be either party
    if ((action === 'accept' || action === 'reject') && friendship.friend_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only accept or reject requests sent to you',
      }, { status: 403 })
    }

    let newStatus: string
    if (action === 'accept') {
      newStatus = 'accepted'
    } else if (action === 'reject') {
      // Delete the friendship request
      const { error } = await supabaseAdmin
        .from('friendships')
        .delete()
        .eq('id', friendship.id)

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message,
        }, { status: 400 })
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Friend request rejected',
      })
    } else if (action === 'block') {
      newStatus = 'blocked'
    } else {
      // unblock - delete blocked friendship
      const { error } = await supabaseAdmin
        .from('friendships')
        .delete()
        .eq('id', friendship.id)

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message,
        }, { status: 400 })
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'User unblocked',
      })
    }

    // Update friendship status - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', friendship.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: `Friend request ${action}ed`,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update friendship',
    }, { status: 500 })
  }
}

// DELETE /api/friends/[id] - Remove friend
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { id } = params

    // Verify friendship exists and user has permission
    const { data: friendship } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${user.id})`)
      .single()

    if (!friendship) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Friendship not found',
      }, { status: 404 })
    }

    // Delete the friendship - use supabaseAdmin to bypass RLS
    // We've validated above that the user is involved in this friendship
    const { error } = await supabaseAdmin
      .from('friendships')
      .delete()
      .eq('id', friendship.id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Friend removed',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to remove friend',
    }, { status: 500 })
  }
}



