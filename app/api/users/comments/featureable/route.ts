// API route to get comments from other users that can be featured on profile
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/users/comments/featureable - Get comments from other users that can be featured
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Get user's featured comments
    const { data: userData } = await supabase
      .from('users')
      .select('featured_comments')
      .eq('id', user.id)
      .single()

    const featuredIds = (userData?.featured_comments || []) as string[]

    // Get comments from other users on adages and blog posts
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        target_type,
        target_id,
        created_at,
        user:users!user_id(id, username, display_name, profile_image_url)
      `)
      .neq('user_id', user.id)
      .in('target_type', ['adage', 'blog'])
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Fetch related data for comments
    const commentsWithData = await Promise.all(
      (comments || []).map(async (comment: any) => {
        let targetData = null
        if (comment.target_type === 'adage') {
          const { data: adage } = await supabase
            .from('adages')
            .select('id, adage')
            .eq('id', comment.target_id)
            .is('deleted_at', null)
            .single()
          targetData = adage ? { adage: adage.adage, url: `/archive/${adage.id}` } : null
        } else if (comment.target_type === 'blog') {
          const { data: blogPost } = await supabase
            .from('blog_posts')
            .select('id, title, slug')
            .eq('id', comment.target_id)
            .is('deleted_at', null)
            .single()
          targetData = blogPost ? { title: blogPost.title, url: `/blog/${blogPost.slug || blogPost.id}` } : null
        }

        return {
          ...comment,
          target_data: targetData,
          is_featured: featuredIds.includes(comment.id),
        }
      })
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      data: commentsWithData,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch featureable comments',
    }, { status: 500 })
  }
}














