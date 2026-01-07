// API route for current user profile operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/users/me - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Try to select profile_private, but handle if column doesn't exist yet
    let query = supabase
      .from('users')
      .select('id, email, username, display_name, bio, profile_image_url, role, email_verified, created_at')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single()

    const { data, error } = await query

    if (error || !data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Try to fetch profile_private, comments_friends_only, and email preferences separately if columns exist
    let profilePrivate = false
    let commentsFriendsOnly = false
    let emailPreferences = {
      email_weekly_adage: true,
      email_events: true,
      email_site_updates: true,
      email_archive_additions: true,
      email_comment_notifications: true,
    }
    try {
      // Try to fetch columns individually to avoid schema cache errors
      const columnsToFetch = [
        'profile_private',
        'comments_friends_only',
        'email_weekly_adage',
        'email_events',
        'email_site_updates',
        'email_archive_additions',
        'email_comment_notifications',
      ]
      
      // Build select query dynamically, only including columns that exist
      let selectQuery = supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      // Try to fetch all columns, but handle errors gracefully
      try {
        const { data: privacyData } = await supabaseAdmin
          .from('users')
          .select(columnsToFetch.join(', '))
          .eq('id', user.id)
          .single()
        
        if (privacyData) {
          if ('profile_private' in privacyData && privacyData.profile_private !== null) {
            profilePrivate = privacyData.profile_private === true
          }
          if ('comments_friends_only' in privacyData && privacyData.comments_friends_only !== null) {
            commentsFriendsOnly = privacyData.comments_friends_only === true
          }
          if ('email_weekly_adage' in privacyData && privacyData.email_weekly_adage !== null) {
            emailPreferences.email_weekly_adage = privacyData.email_weekly_adage !== false
          }
          if ('email_events' in privacyData && privacyData.email_events !== null) {
            emailPreferences.email_events = privacyData.email_events !== false
          }
          if ('email_site_updates' in privacyData && privacyData.email_site_updates !== null) {
            emailPreferences.email_site_updates = privacyData.email_site_updates !== false
          }
          if ('email_archive_additions' in privacyData && privacyData.email_archive_additions !== null) {
            emailPreferences.email_archive_additions = privacyData.email_archive_additions !== false
          }
          if ('email_comment_notifications' in privacyData && privacyData.email_comment_notifications !== null) {
            emailPreferences.email_comment_notifications = privacyData.email_comment_notifications !== false
          }
        }
      } catch (selectError: any) {
        // If column doesn't exist, try fetching columns one by one
        console.warn('Some columns may not exist, using defaults:', selectError.message)
        // Use defaults - columns don't exist yet
      }
    } catch (e) {
      // Columns don't exist yet, use defaults
      profilePrivate = false
      commentsFriendsOnly = false
    }

    // Ensure email_verified is a boolean (handle null values from database)
    const emailVerified = data.email_verified === true || data.email_verified === 1 || data.email_verified === 'true'
    const userData = {
      ...data,
      email_verified: emailVerified,
      profile_private: profilePrivate,
      comments_friends_only: commentsFriendsOnly,
      email_preferences: emailPreferences,
    }

    // Get user stats - use supabaseAdmin to bypass RLS
    const [savedCount, collectionsCount, commentsCount] = await Promise.all([
      supabaseAdmin
        .from('saved_adages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('collections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('deleted_at', null),
    ])

    // Get commendation stats - reports received - use supabaseAdmin to bypass RLS
    const { data: userComments } = await supabaseAdmin
      .from('comments')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    const commentIds = userComments?.map(c => c.id) || []

    const { data: userBlogs } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('author_id', user.id)
      .is('deleted_at', null)

    const blogIds = userBlogs?.map(b => b.id) || []

    const { data: userAdages } = await supabaseAdmin
      .from('adages')
      .select('id')
      .eq('created_by', user.id)
      .is('deleted_at', null)

    const adageIds = userAdages?.map(a => a.id) || []

    const { data: userForumReplies } = await supabaseAdmin
      .from('forum_replies')
      .select('id')
      .eq('author_id', user.id)
      .is('deleted_at', null)

    const forumReplyIds = userForumReplies?.map(r => r.id) || []

    const { data: userForumThreads } = await supabaseAdmin
      .from('forum_threads')
      .select('id')
      .eq('author_id', user.id)
      .is('deleted_at', null)

    const forumThreadIds = userForumThreads?.map(t => t.id) || []

    // Get reports on user's content
    const [commentReports, blogReports, adageReports] = await Promise.all([
      commentIds.length > 0
        ? supabaseAdmin
            .from('reader_challenges')
            .select('id, status')
            .eq('target_type', 'comment')
            .in('target_id', commentIds)
            .is('deleted_at', null)
        : { data: null },
      blogIds.length > 0
        ? supabaseAdmin
            .from('reader_challenges')
            .select('id, status')
            .eq('target_type', 'blog')
            .in('target_id', blogIds)
            .is('deleted_at', null)
        : { data: null },
      adageIds.length > 0
        ? supabaseAdmin
            .from('reader_challenges')
            .select('id, status')
            .eq('target_type', 'adage')
            .in('target_id', adageIds)
            .is('deleted_at', null)
        : { data: null },
    ])

    const allReports = [
      ...(commentReports.data || []),
      ...(blogReports.data || []),
      ...(adageReports.data || []),
    ]

    const reportsReceived = allReports.length
    const reportsAccepted = allReports.filter(r => r.status === 'accepted').length

    // Get votes received
    const [commentVotes, blogVotes, adageVotes, forumReplyVotes, forumThreadVotes] = await Promise.all([
      commentIds.length > 0
        ? supabaseAdmin
            .from('votes')
            .select('value')
            .eq('target_type', 'comment')
            .in('target_id', commentIds)
        : { data: null },
      blogIds.length > 0
        ? supabaseAdmin
            .from('votes')
            .select('value')
            .eq('target_type', 'blog')
            .in('target_id', blogIds)
        : { data: null },
      adageIds.length > 0
        ? supabaseAdmin
            .from('votes')
            .select('value')
            .eq('target_type', 'adage')
            .in('target_id', adageIds)
        : { data: null },
      forumReplyIds.length > 0
        ? supabaseAdmin
            .from('votes')
            .select('value')
            .eq('target_type', 'forum_reply')
            .in('target_id', forumReplyIds)
        : { data: null },
      forumThreadIds.length > 0
        ? supabaseAdmin
            .from('votes')
            .select('value')
            .eq('target_type', 'forum_thread')
            .in('target_id', forumThreadIds)
        : { data: null },
    ])

    const allVotes = [
      ...(commentVotes.data || []),
      ...(blogVotes.data || []),
      ...(adageVotes.data || []),
      ...(forumReplyVotes.data || []),
      ...(forumThreadVotes.data || []),
    ]

    const upvotes = allVotes.filter(v => v.value === 1).length
    const downvotes = allVotes.filter(v => v.value === -1).length
    const netVotes = upvotes - downvotes

    // Get contributions
    const [citationsCount, challengesCount, blogPostsCount, adagesCount] = await Promise.all([
      supabaseAdmin
        .from('citations')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('reader_challenges')
        .select('id', { count: 'exact', head: true })
        .eq('challenger_id', user.id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('blog_posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .is('deleted_at', null),
      supabaseAdmin
        .from('adages')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .is('deleted_at', null),
    ])

    // Get most popular posts (simplified - top 10 by score)
    const popularPosts = await Promise.all([
      ...commentIds.slice(0, 20).map(async (commentId) => {
        const { data: votes } = await supabaseAdmin
          .from('votes')
          .select('value')
          .eq('target_type', 'comment')
          .eq('target_id', commentId)
        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
        const { data: comment } = await supabaseAdmin
          .from('comments')
          .select('id, content, created_at, target_type, target_id, hidden_at')
          .eq('id', commentId)
          .single()
        if (comment?.hidden_at) return null
        return { id: commentId, type: 'comment' as const, content: comment?.content?.substring(0, 100) || '', score, created_at: comment?.created_at, target_type: comment?.target_type, target_id: comment?.target_id }
      }),
      ...blogIds.slice(0, 10).map(async (blogId) => {
        const { data: votes } = await supabaseAdmin
          .from('votes')
          .select('value')
          .eq('target_type', 'blog')
          .eq('target_id', blogId)
        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
        const { data: blog } = await supabaseAdmin
          .from('blog_posts')
          .select('id, title, created_at, slug')
          .eq('id', blogId)
          .single()
        return { id: blogId, type: 'blog' as const, title: blog?.title || '', score, created_at: blog?.created_at, slug: blog?.slug }
      }),
      ...adageIds.slice(0, 10).map(async (adageId) => {
        const { data: votes } = await supabaseAdmin
          .from('votes')
          .select('value')
          .eq('target_type', 'adage')
          .eq('target_id', adageId)
        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
        const { data: adage } = await supabaseAdmin
          .from('adages')
          .select('id, adage, created_at')
          .eq('id', adageId)
          .single()
        return { id: adageId, type: 'adage' as const, adage: adage?.adage || '', score, created_at: adage?.created_at }
      }),
      ...forumReplyIds.slice(0, 10).map(async (replyId) => {
        const { data: votes } = await supabaseAdmin
          .from('votes')
          .select('value')
          .eq('target_type', 'forum_reply')
          .eq('target_id', replyId)
        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
        const { data: reply } = await supabaseAdmin
          .from('forum_replies')
          .select('id, content, created_at, thread_id')
          .eq('id', replyId)
          .single()
        return { id: replyId, type: 'forum_reply' as const, content: reply?.content?.substring(0, 100) || '', score, created_at: reply?.created_at, thread_id: reply?.thread_id }
      }),
      ...forumThreadIds.slice(0, 10).map(async (threadId) => {
        const { data: votes } = await supabaseAdmin
          .from('votes')
          .select('value')
          .eq('target_type', 'forum_thread')
          .eq('target_id', threadId)
        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
        const { data: thread } = await supabaseAdmin
          .from('forum_threads')
          .select('id, title, created_at, slug')
          .eq('id', threadId)
          .single()
        return { id: threadId, type: 'forum_thread' as const, title: thread?.title || '', score, created_at: thread?.created_at, slug: thread?.slug }
      }),
    ])

    const allPopular = popularPosts
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 10)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...userData,
        stats: {
          saved_adages: savedCount.count || 0,
          collections: collectionsCount.count || 0,
          comments: commentsCount.count || 0,
        },
        commendationStats: {
          reports: {
            received: reportsReceived,
            accepted: reportsAccepted,
          },
          votes: {
            upvotes,
            downvotes,
            net: netVotes,
          },
          contributions: {
            citations: citationsCount.count || 0,
            challenges: challengesCount.count || 0,
            comments: commentsCount.count || 0,
            blogPosts: blogPostsCount.count || 0,
            adages: adagesCount.count || 0,
          },
          popularPosts: allPopular,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch user data',
    }, { status: 500 })
  }
}

// PUT /api/users/me - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    let { username, display_name, bio, profile_image_url, profile_private, comments_friends_only } = body

    // Check if profile_private and comments_friends_only columns exist before trying to update them
    let updateData: any = {
      username: username || null,
      display_name: display_name || null,
      bio: bio || null,
      profile_image_url: profile_image_url || null,
      updated_at: new Date().toISOString(),
    }

    // Include profile_private and comments_friends_only if provided
    // These will be ignored if columns don't exist yet
    if (profile_private !== undefined) {
      updateData.profile_private = profile_private
    }
    if (comments_friends_only !== undefined) {
      updateData.comments_friends_only = comments_friends_only
    }

    // Check username uniqueness if provided
    if (username) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .is('deleted_at', null)
        .single()

      if (existing) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'This username is already taken',
        }, { status: 400 })
      }
    }

    // Handle base64 image uploads (data URLs from cropping)
    // For now, we'll store data URLs directly. In production, you'd want to upload to Supabase Storage
    // and store the public URL instead
    if (profile_image_url && profile_image_url.startsWith('data:image/')) {
      // Data URL is already in the correct format, can be stored directly
      // Note: For production, consider uploading to Supabase Storage and storing the public URL
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      // Check if it's a column not found error - try without the missing columns
      if (error.message?.includes('column') || error.message?.includes('schema cache')) {
        // Build safe update data without potentially missing columns
        const safeUpdateData: any = {
          username: updateData.username,
          display_name: updateData.display_name,
          bio: updateData.bio,
          profile_image_url: updateData.profile_image_url,
          updated_at: updateData.updated_at,
        }
        
        // Try update without the potentially missing columns
        const { data: retryData, error: retryError } = await supabase
          .from('users')
          .update(safeUpdateData)
          .eq('id', user.id)
          .select()
          .single()
        
        if (retryError) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: retryError.message || 'Failed to update profile',
          }, { status: 400 })
        }
        
        // If profile_private or comments_friends_only were provided but columns don't exist, warn user
        if ((profile_private !== undefined || comments_friends_only !== undefined) && 
            (error.message?.includes('profile_private') || error.message?.includes('comments_friends_only'))) {
          return NextResponse.json<ApiResponse>({
            success: true,
            data: retryData,
            message: 'Profile updated, but privacy settings columns not found. Please run the migration: database/migrations/add-profile-features-and-ban-reason.sql',
          })
        }
        
        return NextResponse.json<ApiResponse>({
          success: true,
          data: retryData,
          message: 'Profile updated successfully',
        })
      }
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message || 'Failed to update profile',
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update profile',
    }, { status: 500 })
  }
}
