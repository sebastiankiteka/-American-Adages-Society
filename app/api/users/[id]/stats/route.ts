import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/users/[id]/stats - Get comprehensive user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verify user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Get reports received (challenges where this user's content was reported)
    // We'll find these by getting user's content first, then finding challenges on that content

    // Actually, we need to find reports on content created by this user
    // Get comments by this user that were reported
    const { data: userComments } = await supabase
      .from('comments')
      .select('id')
      .eq('user_id', id)
      .is('deleted_at', null)

    const commentIds = userComments?.map(c => c.id) || []

    // Get challenges on this user's comments
    const { data: commentReports } = commentIds.length > 0
      ? await supabase
          .from('reader_challenges')
          .select('id, status, created_at')
          .eq('target_type', 'comment')
          .in('target_id', commentIds)
          .is('deleted_at', null)
      : { data: null }

    // Get blog posts by this user that were reported
    const { data: userBlogs } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('author_id', id)
      .is('deleted_at', null)

    const blogIds = userBlogs?.map(b => b.id) || []

    const { data: blogReports } = blogIds.length > 0
      ? await supabase
          .from('reader_challenges')
          .select('id, status, created_at')
          .eq('target_type', 'blog')
          .in('target_id', blogIds)
          .is('deleted_at', null)
      : { data: null }

    // Get adages by this user that were reported
    const { data: userAdages } = await supabase
      .from('adages')
      .select('id')
      .eq('created_by', id)
      .is('deleted_at', null)

    const adageIds = userAdages?.map(a => a.id) || []

    const { data: adageReports } = adageIds.length > 0
      ? await supabase
          .from('reader_challenges')
          .select('id, status, created_at')
          .eq('target_type', 'adage')
          .in('target_id', adageIds)
          .is('deleted_at', null)
      : { data: null }

    // Combine all reports
    const allReports = [
      ...(commentReports || []),
      ...(blogReports || []),
      ...(adageReports || []),
    ]

    const reportsReceivedCount = allReports.length
    const reportsAcceptedCount = allReports.filter(r => r.status === 'accepted').length

    // Get forum replies by this user
    const { data: userForumReplies } = await supabase
      .from('forum_replies')
      .select('id')
      .eq('author_id', id)
      .is('deleted_at', null)

    const forumReplyIds = userForumReplies?.map(r => r.id) || []

    // Get forum threads by this user
    const { data: userForumThreads } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('author_id', id)
      .is('deleted_at', null)

    const forumThreadIds = userForumThreads?.map(t => t.id) || []

    // Get votes received on user's content
    // Votes on comments (only count votes on non-deleted, non-hidden comments)
    const { data: commentVotes } = commentIds.length > 0
      ? await supabase
          .from('votes')
          .select('value, target_id')
          .eq('target_type', 'comment')
          .in('target_id', commentIds)
      : { data: null }
    
    // Verify votes are on valid comments (not deleted/hidden)
    // This ensures we only count votes on comments that still exist
    const validCommentVotes = commentVotes?.filter(vote => {
      return commentIds.includes(vote.target_id)
    }) || []

    // Votes on blog posts
    const { data: blogVotes } = blogIds.length > 0
      ? await supabase
          .from('votes')
          .select('value')
          .eq('target_type', 'blog')
          .in('target_id', blogIds)
      : { data: null }

    // Votes on adages
    const { data: adageVotes } = adageIds.length > 0
      ? await supabase
          .from('votes')
          .select('value')
          .eq('target_type', 'adage')
          .in('target_id', adageIds)
      : { data: null }

    // Votes on forum replies
    const { data: forumReplyVotes } = forumReplyIds.length > 0
      ? await supabase
          .from('votes')
          .select('value')
          .eq('target_type', 'forum_reply')
          .in('target_id', forumReplyIds)
      : { data: null }

    // Votes on forum threads
    const { data: forumThreadVotes } = forumThreadIds.length > 0
      ? await supabase
          .from('votes')
          .select('value')
          .eq('target_type', 'forum_thread')
          .in('target_id', forumThreadIds)
      : { data: null }

    // Combine all votes (use validCommentVotes instead of commentVotes)
    const allVotes = [
      ...validCommentVotes,
      ...(blogVotes || []),
      ...(adageVotes || []),
      ...(forumReplyVotes || []),
      ...(forumThreadVotes || []),
    ]

    const upvotesReceived = allVotes.filter(v => v.value === 1).length
    const downvotesReceived = allVotes.filter(v => v.value === -1).length
    const netVotes = upvotesReceived - downvotesReceived

    // Get most popular posts (comments, blogs, adages, forum replies, forum threads) by vote count
    // Only include comments that are not deleted or hidden
    const popularComments = commentIds.length > 0
      ? await Promise.all(
          commentIds.map(async (commentId) => {
            const { data: votes, error: votesError } = await supabase
              .from('votes')
              .select('value')
              .eq('target_type', 'comment')
              .eq('target_id', commentId)

            const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
            
            // Only fetch comment if it has votes (optimization) or if we need the data
            const { data: comment } = await supabase
              .from('comments')
              .select('id, content, created_at, target_type, target_id, deleted_at, hidden_at')
              .eq('id', commentId)
              .single()

            // Skip deleted or hidden comments
            if (comment?.deleted_at || comment?.hidden_at) {
              return null
            }

            return {
              id: commentId,
              type: 'comment' as const,
              content: comment?.content?.substring(0, 100) || '',
              score,
              created_at: comment?.created_at,
              target_type: comment?.target_type,
              target_id: comment?.target_id,
            }
          })
        ).then(results => results.filter((r): r is NonNullable<typeof r> => r !== null))
      : []

    const popularForumReplies = forumReplyIds.length > 0
      ? await Promise.all(
          forumReplyIds.map(async (replyId) => {
            const { data: votes } = await supabase
              .from('votes')
              .select('value')
              .eq('target_type', 'forum_reply')
              .eq('target_id', replyId)

            const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
            const { data: reply } = await supabase
              .from('forum_replies')
              .select('id, content, created_at, thread_id')
              .eq('id', replyId)
              .single()

            return {
              id: replyId,
              type: 'forum_reply',
              content: reply?.content?.substring(0, 100) || '',
              score,
              created_at: reply?.created_at,
              thread_id: reply?.thread_id,
            }
          })
        )
      : []

    const popularForumThreads = forumThreadIds.length > 0
      ? await Promise.all(
          forumThreadIds.map(async (threadId) => {
            const { data: votes } = await supabase
              .from('votes')
              .select('value')
              .eq('target_type', 'forum_thread')
              .eq('target_id', threadId)

            const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
            const { data: thread } = await supabase
              .from('forum_threads')
              .select('id, title, created_at, slug')
              .eq('id', threadId)
              .single()

            return {
              id: threadId,
              type: 'forum_thread',
              title: thread?.title || '',
              score,
              created_at: thread?.created_at,
              slug: thread?.slug,
            }
          })
        )
      : []

    const popularBlogs = blogIds.length > 0
      ? await Promise.all(
          blogIds.map(async (blogId) => {
            const { data: votes } = await supabase
              .from('votes')
              .select('value')
              .eq('target_type', 'blog')
              .eq('target_id', blogId)

            const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
            const { data: blog } = await supabase
              .from('blog_posts')
              .select('id, title, created_at, slug')
              .eq('id', blogId)
              .single()

            return {
              id: blogId,
              type: 'blog',
              title: blog?.title || '',
              score,
              created_at: blog?.created_at,
              slug: blog?.slug,
            }
          })
        )
      : []

    const popularAdages = adageIds.length > 0
      ? await Promise.all(
          adageIds.map(async (adageId) => {
            const { data: votes } = await supabase
              .from('votes')
              .select('value')
              .eq('target_type', 'adage')
              .eq('target_id', adageId)

            const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0
            const { data: adage } = await supabase
              .from('adages')
              .select('id, adage, created_at')
              .eq('id', adageId)
              .single()

            return {
              id: adageId,
              type: 'adage',
              adage: adage?.adage || '',
              score,
              created_at: adage?.created_at,
            }
          })
        )
      : []

    // Combine and sort by score (filter out nulls and only show posts with votes > 0 or recent activity)
    const allPopular = [
      ...popularComments.filter(p => p !== null),
      ...popularBlogs.filter(p => p !== null),
      ...popularAdages.filter(p => p !== null),
      ...popularForumReplies.filter(p => p !== null),
      ...popularForumThreads.filter(p => p !== null),
    ]
      .filter(p => p !== null)
      .sort((a, b) => {
        // Sort by score first, then by date if scores are equal
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 10) // Top 10

    // Get contributions
    const { count: citationsSubmitted } = await supabase
      .from('citations')
      .select('*', { count: 'exact', head: true })
      .eq('submitted_by', id)
      .is('deleted_at', null)

    const { count: challengesMade } = await supabase
      .from('reader_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('challenger_id', id)
      .is('deleted_at', null)

    const { count: commentsPosted } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)
      .is('deleted_at', null)
      // Note: We count ALL comments (including hidden) for contributions, 
      // but only show non-hidden comments in "Most Popular Posts"

    const { count: blogPostsCreated } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', id)
      .is('deleted_at', null)

    const { count: adagesCreated } = await supabase
      .from('adages')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', id)
      .is('deleted_at', null)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        reports: {
          received: reportsReceivedCount,
          accepted: reportsAcceptedCount,
        },
        votes: {
          upvotes: upvotesReceived,
          downvotes: downvotesReceived,
          net: netVotes,
        },
        popularPosts: allPopular,
        contributions: {
          citations: citationsSubmitted || 0,
          challenges: challengesMade || 0,
          comments: commentsPosted || 0,
          blogPosts: blogPostsCreated || 0,
          adages: adagesCreated || 0,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch user stats',
    }, { status: 500 })
  }
}

