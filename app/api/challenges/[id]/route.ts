import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'
import { sendNotification } from '@/lib/notifications'

// PATCH /api/challenges/[id] - Update challenge status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const { status, challenge_reason, suggested_correction } = body

    // Get the challenge with user info
    const { data: challenge, error: fetchError } = await supabase
      .from('reader_challenges')
      .select('*, challenger:users!challenger_id(id, email), target_type, target_id')
      .eq('id', id)
      .single()

    if (fetchError || !challenge) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Challenge not found',
      }, { status: 404 })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (challenge_reason !== undefined) updateData.challenge_reason = challenge_reason.trim()
    if (suggested_correction !== undefined) updateData.suggested_correction = suggested_correction?.trim() || null

    // If a decision is being made (accepted or rejected), move to deleted items
    const isDecisionMade = status && (status === 'accepted' || status === 'rejected') && challenge.status === 'pending'
    if (isDecisionMade) {
      updateData.deleted_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('reader_challenges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Send notifications based on status change
    if (status && status !== challenge.status && challenge.challenger) {
      const challengerId = (challenge.challenger as any).id
      
      if (status === 'accepted') {
        // Build URL to reported content
        let contentUrl = ''
        if (challenge.target_type === 'comment') {
          const { data: comment } = await supabase
            .from('comments')
            .select('target_type, target_id')
            .eq('id', challenge.target_id)
            .single()
          
          if (comment) {
            if (comment.target_type === 'adage') {
              contentUrl = `/archive/${comment.target_id}#comment-${challenge.target_id}`
            } else if (comment.target_type === 'blog') {
              contentUrl = `/blog/${comment.target_id}#comment-${challenge.target_id}`
            }
          }
        } else if (challenge.target_type === 'adage') {
          contentUrl = `/archive/${challenge.target_id}`
        } else if (challenge.target_type === 'blog') {
          contentUrl = `/blog/${challenge.target_id}`
        }

        // Notify reporter that report was accepted with thank you message
        await sendNotification({
          user_id: challengerId,
          type: 'report_accepted',
          title: 'Thank You - Report Accepted',
          message: `Thank you for your report! Your challenge has been reviewed and accepted. Our team has taken appropriate action based on your report.\n\nWe appreciate your help in maintaining the quality and accuracy of our content. Your contribution helps make the American Adages Society a better resource for everyone.${contentUrl ? `\n\nView reported content: ${contentUrl}` : ''}`,
          related_id: id,
          related_type: 'challenge',
        })

        // If it's a comment report, notify the reported user
        if (challenge.target_type === 'comment') {
          const { data: comment } = await supabase
            .from('comments')
            .select('user_id, target_type, target_id, content')
            .eq('id', challenge.target_id)
            .single()

          if (comment && comment.user_id && comment.user_id !== challengerId) {
            // Build URL to the reported comment
            let contentUrl = ''
            if (comment.target_type === 'adage') {
              contentUrl = `/archive/${comment.target_id}#comment-${challenge.target_id}`
            } else if (comment.target_type === 'blog') {
              contentUrl = `/blog/${comment.target_id}#comment-${challenge.target_id}`
            } else if (comment.target_type === 'forum') {
              // For forum comments, we'd need to get the thread_id
              contentUrl = `/forum#comment-${challenge.target_id}`
            }

            // Soft-delete the comment when report is accepted
            await supabase
              .from('comments')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', challenge.target_id)

            // Store challenge ID in the message for easier lookup during appeals
            await sendNotification({
              user_id: comment.user_id,
              type: 'report_warning',
              title: 'Content Warning',
              message: `Your comment has been reported and reviewed. We've determined that it violates our community guidelines. This serves as a warning.\n\nYour reported comment:\n"${comment.content}"\n\nView: ${contentUrl}\n\nIf you believe this decision is incorrect, you can appeal using the button below.\n\nChallenge ID: ${id}`,
              related_id: challenge.target_id, // This is the comment ID
              related_type: 'comment',
            })
          }
        }
      } else if (status === 'rejected') {
        // Don't notify on rejection - only notify when an appeal is made
        // The challenge will be moved to deleted items and can be appealed if needed
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Challenge updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update challenge',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

// DELETE /api/challenges/[id] - Soft delete challenge (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params

    const { error } = await supabase
      .from('reader_challenges')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Challenge deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete challenge',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

