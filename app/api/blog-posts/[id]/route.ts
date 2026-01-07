// API route for individual blog post operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, trackView, ApiResponse } from '@/lib/api-helpers'
import { errorLogger } from '@/lib/error-logger'
import { BlogPost } from '@/lib/db-types'

// GET /api/blog-posts/[id] - Get single blog post with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await getCurrentUser()

    // Get blog post
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)

    // Non-admin users can only see published posts
    if (!user || (user as any).role !== 'admin') {
      query = query
        .eq('published', true)
        .is('hidden_at', null)
        .not('published_at', 'is', null)
    }

    const { data: post, error } = await query.single()

    if (error || !post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Blog post not found',
      }, { status: 404 })
    }

    // Track view
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await trackView('blog', id, user?.id, ipAddress)

    // Get related data
    const [commentsResult, votesResult, viewsResult] = await Promise.all([
      supabase
        .from('comments')
        .select('*,user:users!user_id(id,username,display_name,profile_image_url)')
        .eq('target_type', 'blog')
        .eq('target_id', id)
        .is('deleted_at', null)
        .is('hidden_at', null)
        .order('created_at'),
      supabase
        .from('votes')
        .select('value')
        .eq('target_type', 'blog')
        .eq('target_id', id),
      supabase
        .from('views')
        .select('id', { count: 'exact', head: true })
        .eq('target_type', 'blog')
        .eq('target_id', id),
    ])

    const comments = commentsResult.data || []
    const votes = votesResult.data
    const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
    const commentCount = comments.length
    const viewCount = viewsResult.count || 0
    const activityCount = commentCount + (score > 0 ? score : 0) // Comments + positive votes

    // Get user's vote if logged in
    let userVote = null
    if (user) {
      const { data: vote } = await supabase
        .from('votes')
        .select('value')
        .eq('target_type', 'blog')
        .eq('target_id', id)
        .eq('user_id', user.id)
        .single()
      userVote = vote?.value || null
    }

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...post,
        score,
        userVote,
        comments,
        comment_count: commentCount,
        view_count: viewCount,
        activity_count: activityCount,
      },
    })

    // Cache for 10 minutes (600 seconds) for individual blog posts
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    
    return response
  } catch (error: any) {
    errorLogger.logError(error, {
      userId: (await getCurrentUser())?.id,
      url: `/api/blog-posts/${params.id}`,
      action: 'GET',
    })
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch blog post',
    }, { status: 500 })
  }
}

// PUT /api/blog-posts/[id] - Update blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
    const body = await request.json()

    // Update published_at if publishing
    const updates: any = {
      ...body,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }
    if (body.published && !body.published_at) {
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'update_blog_post', 'blog', id)

    return NextResponse.json<ApiResponse<BlogPost>>({
      success: true,
      data,
      message: 'Blog post updated successfully',
    })
  } catch (error: any) {
    errorLogger.logError(error, {
      userId: (await requireAdmin()).id,
      url: `/api/blog-posts/${params.id}`,
      action: 'PUT',
    })
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update blog post',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

// DELETE /api/blog-posts/[id] - Soft delete blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params

    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'delete_blog_post', 'blog', id)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Blog post deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete blog post',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

