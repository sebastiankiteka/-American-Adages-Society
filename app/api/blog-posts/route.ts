// API route for blog posts CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, trackView, ApiResponse } from '@/lib/api-helpers'
import { BlogPost } from '@/lib/db-types'

// GET /api/blog-posts - List all blog posts (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const published = searchParams.get('published')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // For non-admin users, only show published posts
    const user = await getCurrentUser()
    if (!user || (user as any).role !== 'admin') {
      query = query
        .eq('published', true)
        .is('hidden_at', null)
        .not('published_at', 'is', null)
    } else {
      // Admin can see all, but can filter
      if (published === 'true') {
        query = query.eq('published', true)
      } else if (published === 'false') {
        query = query.eq('published', false)
      }
      if (published !== 'false') {
        query = query.is('hidden_at', null)
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (dateFrom) {
      query = query.gte('published_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('published_at', dateTo)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get vote scores, comment counts, and activity for each post
    const postsWithScores = await Promise.all(
      (data || []).map(async (post) => {
        const [votesResult, commentsResult] = await Promise.all([
          supabase
            .from('votes')
            .select('value')
            .eq('target_type', 'blog')
            .eq('target_id', post.id),
          supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('target_type', 'blog')
            .eq('target_id', post.id)
            .is('deleted_at', null)
            .is('hidden_at', null),
        ])

        const score = votesResult.data?.reduce((sum, v) => sum + v.value, 0) || 0
        const commentCount = commentsResult.count || 0
        const activityCount = commentCount + (score > 0 ? score : 0)

        return {
          ...post,
          score,
          comment_count: commentCount,
          activity_count: activityCount,
        }
      })
    )

    const response = NextResponse.json<ApiResponse<BlogPost[]>>({
      success: true,
      data: postsWithScores,
    })

    // Cache for 5 minutes (300 seconds) for frequently accessed data
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch blog posts',
    }, { status: 500 })
  }
}

// POST /api/blog-posts - Create new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...body,
        slug,
        author_id: user.id,
        published: body.published || false,
        published_at: body.published ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'create_blog_post', 'blog', data.id)

    return NextResponse.json<ApiResponse<BlogPost>>({
      success: true,
      data,
      message: 'Blog post created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create blog post',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

