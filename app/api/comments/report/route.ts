import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/comments/report - Report a comment
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
    const { comment_id, reason } = body

    if (!comment_id || !reason || !reason.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment ID and reason are required',
      }, { status: 400 })
    }

    // Verify comment exists and get commenter's role - use supabaseAdmin to bypass RLS
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('id, user_id, content, commenter:users!user_id(role)')
      .eq('id', comment_id)
      .is('deleted_at', null)
      .single()

    if (commentError || !comment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment not found',
      }, { status: 404 })
    }

    // Check if user is reporting their own comment
    if (comment.user_id === user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You cannot report your own comment',
      }, { status: 400 })
    }

    // Get reporter's role
    const reporterRole = (user as any).role || 'user'
    const reportedUserRole = (comment.commenter as any)?.role || 'user'

    // Create a report entry with role correlation - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('reader_challenges')
      .insert({
        target_type: 'comment',
        target_id: comment_id,
        challenger_id: user.id,
        challenge_reason: `Comment Report: ${reason.trim()}\n\nReporter Role: ${reporterRole}\nReported User Role: ${reportedUserRole}`,
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
      message: 'Comment reported successfully. Our team will review it.',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to report comment',
    }, { status: 500 })
  }
}

