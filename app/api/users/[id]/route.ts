// API route to get public user profile
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/users/[id] - Get public user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 14 vs 15)
    const resolvedParams = params instanceof Promise ? await params : params
    const { id } = resolvedParams

    if (!id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    // Fetch public user data (exclude sensitive info, hide restricted/probation roles)
    // Note: profile_private may not exist yet if migration hasn't been run
    let query = supabase
      .from('users')
      .select('id, username, display_name, bio, profile_image_url, role, created_at')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    const { data: userData, error } = await query
    
    // Try to fetch profile_private separately if column exists
    let profilePrivate = false
    try {
      const { data: privacyData } = await supabase
        .from('users')
        .select('profile_private')
        .eq('id', id)
        .single()
      if (privacyData && 'profile_private' in privacyData) {
        profilePrivate = privacyData.profile_private === true
      }
    } catch (e) {
      // Column doesn't exist yet, use default
      profilePrivate = false
    }

    if (error) {
      console.error('Error fetching user:', error)
      // Check if it's a "not found" error or a different error
      if (error.code === 'PGRST116') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'User not found',
        }, { status: 404 })
      }
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message || 'Failed to fetch user',
      }, { status: 500 })
    }

    if (!userData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Map role to public role (hide restricted/probation)
    const publicRole = userData.role === 'restricted' || userData.role === 'probation' 
      ? 'user' 
      : (userData.role === 'banned' || userData.role === 'moderator' || userData.role === 'admin' 
          ? userData.role 
          : 'user')

    const data = {
      ...userData,
      role: publicRole,
      profile_private: profilePrivate,
    }


    // Get user stats (all collections, saved adages, comments) - use supabaseAdmin to bypass RLS
    const [savedCount, collectionsCount, commentsCount] = await Promise.all([
      supabaseAdmin
        .from('saved_adages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('collections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id)
        .is('deleted_at', null)
        .is('hidden_at', null),
    ])

    // Get public collections - use supabaseAdmin to bypass RLS
    const { data: publicCollections } = await supabaseAdmin
      .from('collections')
      .select('id, name, description, created_at')
      .eq('user_id', id)
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get featured comments if user has any
    let featuredComments: any[] = []
    try {
      const { data: userWithFeatured } = await supabase
        .from('users')
        .select('featured_comments')
        .eq('id', id)
        .single()

      if (userWithFeatured?.featured_comments && Array.isArray(userWithFeatured.featured_comments) && userWithFeatured.featured_comments.length > 0) {
        const { data: featured } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            target_type,
            target_id,
            created_at,
            user:users!user_id(id, username, display_name, profile_image_url)
          `)
          .in('id', userWithFeatured.featured_comments)
          .is('deleted_at', null)
          .is('hidden_at', null)

        if (featured) {
          // Fetch related data for featured comments
          featuredComments = await Promise.all(
            featured.map(async (comment: any) => {
              if (comment.target_type === 'adage') {
                const { data: adage } = await supabase
                  .from('adages')
                  .select('id, adage')
                  .eq('id', comment.target_id)
                  .is('deleted_at', null)
                  .single()
                return { ...comment, adage: adage || null }
              } else if (comment.target_type === 'blog') {
                const { data: blogPost } = await supabase
                  .from('blog_posts')
                  .select('id, title, slug')
                  .eq('id', comment.target_id)
                  .is('deleted_at', null)
                  .single()
                return { ...comment, blog_post: blogPost || null }
              }
              return comment
            })
          )
        }
      }
    } catch (e) {
      // featured_comments column might not exist yet
      console.error('Error fetching featured comments:', e)
    }

    // Get recent comments (public) - fetch separately for each type
    const { data: allComments } = await supabase
      .from('comments')
      .select('id, content, target_type, target_id, created_at')
      .eq('user_id', id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch related data for comments
    const recentComments = await Promise.all(
      (allComments || []).slice(0, 5).map(async (comment) => {
        if (comment.target_type === 'adage') {
          const { data: adage } = await supabase
            .from('adages')
            .select('id, adage')
            .eq('id', comment.target_id)
            .is('deleted_at', null)
            .single()
          return { ...comment, adage: adage || null }
        } else if (comment.target_type === 'blog') {
          const { data: blogPost } = await supabase
            .from('blog_posts')
            .select('id, title, slug')
            .eq('id', comment.target_id)
            .is('deleted_at', null)
            .single()
          return { ...comment, blog_post: blogPost || null }
        }
        return comment
      })
    )

    // Get friend count
    const { count: friendCount } = await supabase
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`and(user_id.eq.${id},status.eq.accepted),and(friend_id.eq.${id},status.eq.accepted)`)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...data,
        stats: {
          saved_adages: savedCount.count || 0,
          collections: collectionsCount.count || 0,
          comments: commentsCount.count || 0,
          friends: friendCount || 0,
        },
        public_collections: publicCollections || [],
        recent_comments: recentComments || [],
        featured_comments: featuredComments || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch user profile',
    }, { status: 500 })
  }
}

