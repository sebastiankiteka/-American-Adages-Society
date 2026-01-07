// API route for user's comments
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/users/comments - Get current user's comments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, content, target_type, target_id, created_at, updated_at, hidden_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Fetch target titles and URLs
    const formatted = await Promise.all(
      (comments || []).map(async (comment: any) => {
        let target_title = ''
        let target_url = ''

        if (comment.target_type === 'adage') {
          const { data: adage } = await supabase
            .from('adages')
            .select('adage')
            .eq('id', comment.target_id)
            .single()
          if (adage) {
            target_title = adage.adage
            target_url = `/archive/${comment.target_id}`
          }
        } else if (comment.target_type === 'blog') {
          const { data: post } = await supabase
            .from('blog_posts')
            .select('title, slug')
            .eq('id', comment.target_id)
            .single()
          if (post) {
            target_title = post.title
            target_url = `/blog/${post.slug || comment.target_id}`
          }
        } else if (comment.target_type === 'forum') {
          const { data: thread } = await supabase
            .from('forum_threads')
            .select('title, slug')
            .eq('id', comment.target_id)
            .single()
          if (thread) {
            target_title = thread.title
            target_url = `/forum/${thread.slug || comment.target_id}`
          }
        }

        return {
          ...comment,
          target_title,
          target_url,
        }
      })
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formatted,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch comments',
    }, { status: 500 })
  }
}



