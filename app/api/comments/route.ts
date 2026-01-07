// API route for comments
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

// Validation helpers
function sanitizeContent(content: string): string {
  return content.trim().slice(0, 5000) // Max 5000 characters
}

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

    const user = await getCurrentUser().catch(() => null)
    
    // Build query - include deleted comments only for the current user
    // Use supabaseAdmin to bypass RLS
    let query = supabaseAdmin
      .from('comments')
      .select(`
        id,
        content,
        user_id,
        parent_id,
        is_commendation,
        created_at,
        updated_at,
        hidden_at,
        deleted_at,
        user:users!user_id (
          username,
          display_name,
          profile_image_url
        )
      `)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: true })

    // If user is logged in, include their deleted comments; otherwise filter them out
    if (user?.id) {
      // Get all non-deleted comments OR deleted comments by this user
      // Use supabaseAdmin to bypass RLS
      const { data: nonDeleted } = await supabaseAdmin
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          parent_id,
          is_commendation,
          created_at,
          updated_at,
          hidden_at,
          deleted_at,
          user:users!user_id (
            username,
            display_name,
            profile_image_url
          )
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      const { data: myDeleted } = await supabaseAdmin
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          parent_id,
          is_commendation,
          created_at,
          updated_at,
          hidden_at,
          deleted_at,
          user:users!user_id (
            username,
            display_name,
            profile_image_url
          )
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('created_at', { ascending: true })

      const comments = [...(nonDeleted || []), ...(myDeleted || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      
      // Continue with vote processing below
      const commentIds = comments.map(c => c.id)
      
      // Get votes for comments
      let voteMap = new Map<string, number>()
      let scoreMap = new Map<string, number>()

      if (commentIds.length > 0) {
        // Get current user's votes (for showing which comments they've voted on)
        if (user?.id) {
          const { data: userVotes } = await supabase
            .from('votes')
            .select('target_id, value')
            .eq('target_type', 'comment')
            .in('target_id', commentIds)
            .eq('user_id', user.id)

          voteMap = new Map((userVotes || []).map(v => [v.target_id, v.value]))
        }

        // Calculate scores from ALL votes (not just current user's)
        const { data: allVotes, error: votesError } = await supabase
          .from('votes')
          .select('target_id, value')
          .eq('target_type', 'comment')
          .in('target_id', commentIds)

        if (!votesError && allVotes) {
          allVotes.forEach(v => {
            const current = scoreMap.get(v.target_id) || 0
            scoreMap.set(v.target_id, current + v.value)
          })
        }
      }

      // Add votes and scores to comments (always include scores, default to 0)
      const formatted = comments.map((comment: any) => ({
        ...comment,
        user_vote: voteMap.get(comment.id) || null,
        score: scoreMap.get(comment.id) || 0,
      }))

      return NextResponse.json<ApiResponse>({
        success: true,
        data: formatted,
      })
    }

    // For non-logged-in users, only get non-deleted comments
    query = query.is('deleted_at', null)
    const { data: comments, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get votes for comments
    const commentIds = (comments || []).map(c => c.id)

    // Always calculate scores, even if no comments
    let voteMap = new Map<string, number>()
    let scoreMap = new Map<string, number>()

    if (commentIds.length > 0) {
      // Calculate scores from ALL votes (not just current user's)
      const { data: allVotes, error: votesError } = await supabase
        .from('votes')
        .select('target_id, value')
        .eq('target_type', 'comment')
        .in('target_id', commentIds)

      if (!votesError && allVotes) {
        allVotes.forEach(v => {
          const current = scoreMap.get(v.target_id) || 0
          scoreMap.set(v.target_id, current + v.value)
        })
      }
    }

    // Add votes and scores to comments (always include scores, default to 0)
    const formatted = (comments || []).map((comment: any) => ({
      ...comment,
      user_vote: null, // No user logged in
      score: scoreMap.get(comment.id) || 0,
    }))

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

// POST /api/comments - Create a comment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Rate limiting: 10 comments per 15 minutes per user
    const rateLimit = checkRateLimit(`comments:${user.id}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Too many comments. Please wait a moment before commenting again.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    // Check if email is verified
    if (!('email_verified' in user) || !user.email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please verify your email before commenting',
      }, { status: 403 })
    }

    // Check role permissions
    const userRole = (user as any).role || 'user'
    if (userRole === 'banned' || userRole === 'restricted') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have permission to comment',
      }, { status: 403 })
    }

    const body = await request.json()
    let { target_type, target_id, content, parent_id } = body

    // Validate required fields
    if (!target_type || !target_id || !content) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'target_type, target_id, and content are required',
      }, { status: 400 })
    }

    // Validate target_type
    const validTargetTypes = ['adage', 'blog', 'user']
    if (!validTargetTypes.includes(target_type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid target_type',
      }, { status: 400 })
    }

    // Sanitize and validate content
    content = sanitizeContent(content)
    if (content.length < 3) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment must be at least 3 characters',
      }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Comment must be less than 5000 characters',
      }, { status: 400 })
    }

    if (!target_type || !target_id || !content) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'target_type, target_id, and content are required',
      }, { status: 400 })
    }

    // Check if content owner has friends-only comments enabled
    // Use supabaseAdmin to bypass RLS for all queries
    let contentOwnerId: string | null = null
    if (target_type === 'adage') {
      const { data: adage } = await supabaseAdmin
        .from('adages')
        .select('created_by')
        .eq('id', target_id)
        .is('deleted_at', null)
        .single()
      contentOwnerId = adage?.created_by || null
    } else if (target_type === 'blog') {
      const { data: blogPost } = await supabaseAdmin
        .from('blog_posts')
        .select('author_id')
        .eq('id', target_id)
        .is('deleted_at', null)
        .single()
      contentOwnerId = blogPost?.author_id || null
    } else if (target_type === 'user') {
      // For profile comments, the target_id is the user's ID
      contentOwnerId = target_id
      
      // Check if profile is private
      try {
        const { data: profileData } = await supabaseAdmin
          .from('users')
          .select('profile_private')
          .eq('id', target_id)
          .single()

        if (profileData && 'profile_private' in profileData && profileData.profile_private === true) {
          // Check if users are friends or if it's the user's own profile
          if (target_id !== user.id) {
            const { data: friendship } = await supabaseAdmin
              .from('friendships')
              .select('status')
              .or(`and(user_id.eq.${user.id},friend_id.eq.${target_id}),and(user_id.eq.${target_id},friend_id.eq.${user.id})`)
              .eq('status', 'accepted')
              .maybeSingle()

            if (!friendship) {
              return NextResponse.json<ApiResponse>({
                success: false,
                error: 'This user has a private profile. You must be friends to comment.',
              }, { status: 403 })
            }
          }
        }
      } catch (e) {
        // Column might not exist yet, allow comment
        console.error('Error checking profile privacy:', e)
      }
    }

    // If content has an owner and it's not the commenter, check friends-only setting
    if (contentOwnerId && contentOwnerId !== user.id) {
      try {
        const { data: ownerData } = await supabaseAdmin
          .from('users')
          .select('comments_friends_only')
          .eq('id', contentOwnerId)
          .single()

        if (ownerData && 'comments_friends_only' in ownerData && ownerData.comments_friends_only === true) {
          // Check if users are friends
          const { data: friendship } = await supabaseAdmin
            .from('friendships')
            .select('status')
            .or(`and(user_id.eq.${user.id},friend_id.eq.${contentOwnerId}),and(user_id.eq.${contentOwnerId},friend_id.eq.${user.id})`)
            .eq('status', 'accepted')
            .maybeSingle()

          if (!friendship) {
            return NextResponse.json<ApiResponse>({
              success: false,
              error: 'This user only allows comments from friends. Please send a friend request first.',
            }, { status: 403 })
          }
        }
      } catch (e) {
        // Column might not exist yet, allow comment
        console.error('Error checking friends-only comments:', e)
      }
    }

    // Insert comment - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        target_type,
        target_id,
        content: content.trim(),
        user_id: user.id,
        parent_id: parent_id || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Send comment notification email (non-blocking)
    if (contentOwnerId && contentOwnerId !== user.id) {
      try {
        const { sendCommentNotificationEmail } = await import('@/lib/email-helpers')
        sendCommentNotificationEmail(
          user.id,
          contentOwnerId,
          data.id,
          target_type,
          target_id,
          content.trim()
        ).catch(err => console.error('Failed to send comment notification:', err))
      } catch (err) {
        // Email helper might not be available, continue
        console.error('Error importing email helper:', err)
      }
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Comment posted successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to post comment',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}
