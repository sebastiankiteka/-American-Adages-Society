// API route for forum threads
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/forum/threads - Get threads (optionally filtered by section)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sectionId = searchParams.get('section_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('forum_threads')
      .select(`
        *,
        author:users!author_id (
          id,
          username,
          display_name,
          profile_image_url
        ),
        section:forum_sections!section_id (
          id,
          title,
          slug
        )
      `)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('pinned', { ascending: false })
      .order('last_reply_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sectionId) {
      query = query.eq('section_id', sectionId)
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
      error: error.message || 'Failed to fetch threads',
    }, { status: 500 })
  }
}

// POST /api/forum/threads - Create new thread
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
        error: 'Please verify your email before posting',
      }, { status: 403 })
    }

    // Check role permissions
    const userRole = (user as any).role || 'user'
    if (userRole === 'banned' || userRole === 'restricted') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have permission to post',
      }, { status: 403 })
    }

    // Check probation cooldown (if probation user)
    if (userRole === 'probation') {
      // Get last post time for this user
      const { data: lastPost } = await supabase
        .from('forum_threads')
        .select('created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (lastPost) {
        const lastPostTime = new Date(lastPost.created_at)
        const cooldownMs = 60 * 60 * 1000 // 1 hour
        if (Date.now() - lastPostTime.getTime() < cooldownMs) {
          const minutesLeft = Math.ceil((cooldownMs - (Date.now() - lastPostTime.getTime())) / 60000)
          return NextResponse.json<ApiResponse>({
            success: false,
            error: `You are on probation. Please wait ${minutesLeft} more minute(s) before posting again.`,
          }, { status: 403 })
        }
      }
    }

    const body = await request.json()
    const { section_id, title, content } = body

    if (!section_id || !title || !content) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'section_id, title, and content are required',
      }, { status: 400 })
    }

    // Check for cooldown (last post within 30 seconds)
    const { data: recentPost } = await supabase
      .from('forum_threads')
      .select('created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (recentPost) {
      const lastPostTime = new Date(recentPost.created_at).getTime()
      const now = Date.now()
      const cooldownSeconds = 30
      
      if (now - lastPostTime < cooldownSeconds * 1000) {
        const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastPostTime)) / 1000)
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Please wait ${remaining} seconds before posting again`,
        }, { status: 429 })
      }
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if slug already exists in this section
    const { data: existing } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('section_id', section_id)
      .eq('slug', slug)
      .single()

    let finalSlug = slug
    if (existing) {
      finalSlug = `${slug}-${Date.now()}`
    }

    const { data, error } = await supabase
      .from('forum_threads')
      .insert({
        section_id,
        title: title.trim(),
        slug: finalSlug,
        content: content.trim(),
        author_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Update section's thread count (ignore errors if function doesn't exist)
    try {
      await supabase.rpc('increment', {
        table_name: 'forum_sections',
        column_name: 'threads_count',
        id: section_id,
      })
    } catch {
      // Ignore if function doesn't exist
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Thread created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create thread',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

