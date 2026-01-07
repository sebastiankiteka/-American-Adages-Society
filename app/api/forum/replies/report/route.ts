// API route to report forum replies
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/forum/replies/report - Report a forum reply
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
    const { reply_id, reason } = body

    if (!reply_id || !reason || !reason.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'reply_id and reason are required',
      }, { status: 400 })
    }

    // Check if reply exists
    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .select('id, author_id, thread_id')
      .eq('id', reply_id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .single()

    if (replyError || !reply) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Reply not found',
      }, { status: 404 })
    }

    // Prevent self-reporting
    if (reply.author_id === user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You cannot report your own reply',
      }, { status: 400 })
    }

    // Check if already reported by this user
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('target_type', 'forum_reply')
      .eq('target_id', reply_id)
      .eq('reporter_id', user.id)
      .is('deleted_at', null)
      .maybeSingle()

    if (existingReport) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You have already reported this reply',
      }, { status: 400 })
    }

    // Create report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        target_type: 'forum_reply',
        target_id: reply_id,
        target_user_id: reply.author_id,
        reporter_id: user.id,
        reason: reason.trim(),
        status: 'pending',
      })
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
      message: 'Reply reported successfully. Our team will review it.',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to report reply',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}


