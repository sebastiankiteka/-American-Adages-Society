// API route for individual forum reply operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/forum/replies/[id] - Get a specific reply
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('forum_replies')
      .select(`
        *,
        author:users!author_id (
          id,
          username,
          display_name,
          profile_image_url
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Reply not found',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch reply',
    }, { status: 500 })
  }
}

// PUT /api/forum/replies/[id] - Update a reply (author only)
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
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Content is required',
      }, { status: 400 })
    }

    // Check if reply exists and user is the author
    const { data: reply, error: fetchError } = await supabase
      .from('forum_replies')
      .select('author_id, thread_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !reply) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Reply not found',
      }, { status: 404 })
    }

    if (reply.author_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only edit your own replies',
      }, { status: 403 })
    }

    // Check if thread is locked or frozen
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('locked, frozen')
      .eq('id', reply.thread_id)
      .is('deleted_at', null)
      .single()

    if (thread && (thread.locked || thread.frozen)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Cannot edit reply in a locked or frozen thread',
      }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('forum_replies')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
      message: 'Reply updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update reply',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/forum/replies/[id] - Delete a reply (author or admin)
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

    // Check if reply exists
    const { data: reply, error: fetchError } = await supabase
      .from('forum_replies')
      .select('author_id, thread_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !reply) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Reply not found',
      }, { status: 404 })
    }

    // Check if user is author or admin
    const isAdmin = (user as any).role === 'admin' || (user as any).role === 'moderator'
    if (reply.author_id !== user.id && !isAdmin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only delete your own replies',
      }, { status: 403 })
    }

    // Soft delete the reply
    const { error } = await supabase
      .from('forum_replies')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Update thread's replies_count
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('replies_count')
      .eq('id', reply.thread_id)
      .single()

    if (thread) {
      await supabase
        .from('forum_threads')
        .update({
          replies_count: Math.max(0, (thread.replies_count || 0) - 1),
        })
        .eq('id', reply.thread_id)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Reply deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete reply',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}














