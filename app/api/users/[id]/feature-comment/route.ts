// API route to feature/unfeature comments on user profile
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/users/[id]/feature-comment - Feature or unfeature a comment on user profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const resolvedParams = params instanceof Promise ? await params : params
    const { id: userId } = resolvedParams

    // User can only feature comments on their own profile
    if (user.id !== userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You can only feature comments on your own profile',
      }, { status: 403 })
    }

    const body = await request.json()
    const { comment_id, featured } = body

    if (!comment_id || typeof featured !== 'boolean') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'comment_id and featured (boolean) are required',
      }, { status: 400 })
    }

    // Verify comment exists and belongs to another user
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', comment_id)
      .is('deleted_at', null)
      .single()

    if (commentError || !comment) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment not found',
      }, { status: 404 })
    }

    // Can't feature your own comments
    if (comment.user_id === userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You cannot feature your own comments',
      }, { status: 400 })
    }

    // Get current featured comments
    const { data: userData } = await supabase
      .from('users')
      .select('featured_comments')
      .eq('id', userId)
      .single()

    const currentFeatured = (userData?.featured_comments || []) as string[]

    let newFeatured: string[]
    if (featured) {
      // Add comment if not already featured
      if (!currentFeatured.includes(comment_id)) {
        newFeatured = [...currentFeatured, comment_id]
      } else {
        return NextResponse.json<ApiResponse>({
          success: true,
          message: 'Comment already featured',
        })
      }
    } else {
      // Remove comment from featured
      newFeatured = currentFeatured.filter((id: string) => id !== comment_id)
    }

    // Update featured comments
    const { error: updateError } = await supabase
      .from('users')
      .update({ featured_comments: newFeatured })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: updateError.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: featured ? 'Comment featured successfully' : 'Comment unfeatured successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update featured comment',
    }, { status: 500 })
  }
}














