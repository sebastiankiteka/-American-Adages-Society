// API route to get blog post by slug
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, trackView, ApiResponse, getClientIP } from '@/lib/api-helpers'
import { BlogPost } from '@/lib/db-types'

// GET /api/blog-posts/slug/[slug] - Get blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const user = await getCurrentUser()

    // Get blog post by slug
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
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
    const ipAddress = getClientIP(request)
    await trackView('blog', post.id, user?.id, ipAddress)

    // Get vote score
    const { data: votes } = await supabase
      .from('votes')
      .select('value')
      .eq('target_type', 'blog')
      .eq('target_id', post.id)

    const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0

    return NextResponse.json<ApiResponse<BlogPost & { score: number }>>({
      success: true,
      data: { ...post, score },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch blog post',
    }, { status: 500 })
  }
}











