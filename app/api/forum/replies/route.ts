// API route for forum replies
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/forum/replies - Get replies (optionally filtered by thread)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const threadId = searchParams.get('thread_id')

    // Check if admin is requesting (for admin panel)
    const user = await getCurrentUser().catch(() => null)
    const isAdmin = user && ((user as any).role === 'admin' || (user as any).role === 'moderator')
    
    let query = supabase
      .from('forum_replies')
      .select(`
        *,
        author:users!author_id (
          id,
          username,
          display_name,
          profile_image_url,
          email
        ),
        thread:forum_threads!thread_id (
          id,
          title,
          slug
        )
      `)
    
    // Only show non-deleted replies for non-admins
    if (!isAdmin) {
      query = query.is('deleted_at', null).is('hidden_at', null)
    }

    if (threadId) {
      query = query.eq('thread_id', threadId).order('created_at', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch replies',
    }, { status: 500 })
  }
}

// POST /api/forum/replies - Create new reply
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Check if email is verified
    if (!('email_verified' in user) || !user.email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please verify your email before replying',
      }, { status: 403 })
    }

    // Check role permissions
    const userRole = (user as any).role || 'user'
    if (userRole === 'banned' || userRole === 'restricted') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have permission to reply',
      }, { status: 403 })
    }

    const body = await request.json()
    const { thread_id, content, parent_reply_id } = body

    if (!thread_id || !content) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'thread_id and content are required',
      }, { status: 400 })
    }

    // Check if thread exists and is not locked/frozen
    const { data: thread } = await supabase
      .from('forum_threads')
      .select('id, locked, frozen')
      .eq('id', thread_id)
      .is('deleted_at', null)
      .single()

    if (!thread) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread not found',
      }, { status: 404 })
    }

    if (thread.locked || thread.frozen) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread is locked or frozen',
      }, { status: 403 })
    }

    // Check for cooldown (last reply within 15 seconds)
    const { data: recentReply } = await supabase
      .from('forum_replies')
      .select('created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (recentReply) {
      const lastReplyTime = new Date(recentReply.created_at).getTime()
      const now = Date.now()
      const cooldownSeconds = 15
      
      if (now - lastReplyTime < cooldownSeconds * 1000) {
        const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastReplyTime)) / 1000)
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Please wait ${remaining} seconds before replying again`,
        }, { status: 429 })
      }
    }

    // Check thread length (max 1000 replies)
    const { count } = await supabase
      .from('forum_replies')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', thread_id)
      .is('deleted_at', null)

    if ((count || 0) >= 1000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Thread has reached maximum length (1000 replies)',
      }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        thread_id,
        content: content.trim(),
        author_id: user.id,
        parent_reply_id: parent_reply_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Update thread's last_reply_at and replies_count
    await supabase
      .from('forum_threads')
      .update({
        last_reply_at: new Date().toISOString(),
        replies_count: ((thread as any).replies_count || 0) + 1,
      })
      .eq('id', thread_id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Reply posted successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to post reply',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

