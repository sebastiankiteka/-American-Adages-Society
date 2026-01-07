// API route for individual comment operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, requireModerator, logActivity, ApiResponse } from '@/lib/api-helpers'

// PUT /api/comments/[id] - Update comment (author or moderator)
export async function PUT(
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

    // Check if user is author or moderator - use supabaseAdmin to bypass RLS
    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('user_id, is_commendation')
      .eq('id', id)
      .single()

    if (!comment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment not found',
      }, { status: 404 })
    }

    // Commendations cannot be edited by regular users
    if (comment.is_commendation && comment.user_id !== user.id) {
      const moderator = await requireModerator().catch(() => null)
      if (!moderator) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Cannot edit official commendations',
        }, { status: 403 })
      }
    }

    // Check if user is author or moderator
    if (comment.user_id !== user.id) {
      await requireModerator()
    }

    // Update comment - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('comments')
      .update(body)
      .eq('id', id)
      .select('*,user:users!user_id(id,username,display_name,profile_image_url)')
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'update_comment', 'comment', id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Comment updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update comment',
    }, { status: 500 })
  }
}

// DELETE /api/comments/[id] - Soft delete comment (author or moderator)
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

    // Check if user is author or moderator - use supabaseAdmin to bypass RLS
    const { data: comment } = await supabaseAdmin
      .from('comments')
      .select('user_id, is_commendation')
      .eq('id', id)
      .single()

    if (!comment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment not found',
      }, { status: 404 })
    }

    // Commendations cannot be deleted by regular users
    if (comment.is_commendation) {
      await requireModerator()
    } else if (comment.user_id !== user.id) {
      await requireModerator()
    }

    // Delete comment - use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'delete_comment', 'comment', id)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Comment deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete comment',
    }, { status: 500 })
  }
}


