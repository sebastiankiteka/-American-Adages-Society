// API route for individual forum thread
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/forum/threads/[slug] - Get thread by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const searchParams = request.nextUrl.searchParams
    const sectionSlug = searchParams.get('section')

    // Build query to find thread
    let query = supabase
      .from('forum_threads')
      .select(`
        *,
        author:users!author_id (
          id,
          username,
          display_name,
          profile_image_url
        ),
        section:forum_sections!section_id (
          id,
          title,
          slug
        )
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .is('hidden_at', null)

    if (sectionSlug) {
      // Join with section to filter by section slug
      query = query.eq('section.slug', sectionSlug)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread not found',
      }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from('forum_threads')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id)

    // Get replies
    const { data: replies } = await supabase
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
      .eq('thread_id', data.id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: true })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...data,
        replies: replies || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch thread',
    }, { status: 500 })
  }
}

// PUT /api/forum/threads/[slug] - Update thread
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { slug } = params
    const body = await request.json()

    // Get thread to check ownership
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('author_id, locked, frozen')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (!thread) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread not found',
      }, { status: 404 })
    }

    // Check permissions (author or admin)
    if (thread.author_id !== user.id && (user as any).role !== 'admin' && (user as any).role !== 'moderator') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    // Check if thread is locked or frozen
    if (thread.locked || thread.frozen) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread is locked or frozen',
      }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
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
      message: 'Thread updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update thread',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/forum/threads/[slug] - Delete thread (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { slug } = params

    // Get thread to check ownership
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('author_id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (!thread) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread not found',
      }, { status: 404 })
    }

    // Check permissions (author or admin/moderator)
    if (thread.author_id !== user.id && (user as any).role !== 'admin' && (user as any).role !== 'moderator') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    const { error } = await supabase
      .from('forum_threads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('slug', slug)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Thread deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete thread',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















