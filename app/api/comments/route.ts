// API route for comments (unified system for blogs, adages, forum)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireModerator, logActivity, ApiResponse } from '@/lib/api-helpers'
import { Comment } from '@/lib/db-types'

// GET /api/comments - Get comments for a target
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')

    if (!targetType || !targetId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'target_type and target_id are required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*,user:users!user_id(id,username,display_name,profile_image_url)')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get vote scores for each comment
    const commentsWithScores = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: votes } = await supabase
          .from('votes')
          .select('value')
          .eq('target_type', 'comment')
          .eq('target_id', comment.id)

        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
        return { ...comment, score }
      })
    )

    return NextResponse.json<ApiResponse<Comment[]>>({
      success: true,
      data: commentsWithScores,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch comments',
    }, { status: 500 })
  }
}

// POST /api/comments - Create comment (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required',
      }, { status: 401 })
    }

    // Check if user is restricted or banned
    const { data: userData } = await supabase
      .from('users')
      .select('role, email_verified')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'banned' || userData?.role === 'restricted') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have permission to comment',
      }, { status: 403 })
    }

    // For forum, require verified email
    const body = await request.json()
    if (body.target_type === 'forum' && !userData?.email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email verification required to post in forum',
      }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...body,
        user_id: user.id,
      })
      .select('*,user:users!user_id(id,username,display_name,profile_image_url)')
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'create_comment', 'comment', data.id, {
      target_type: body.target_type,
      target_id: body.target_id,
    })

    return NextResponse.json<ApiResponse<Comment>>({
      success: true,
      data,
      message: 'Comment created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create comment',
    }, { status: 500 })
  }
}


