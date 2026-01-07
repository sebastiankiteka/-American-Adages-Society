import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'
import { sendNotification } from '@/lib/notifications'

// PATCH /api/admin/appeals/[id] - Update appeal decision (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const { decision, message_id } = body // decision: 'accepted' | 'rejected'

    if (!decision || !['accepted', 'rejected'].includes(decision)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Valid decision (accepted/rejected) is required',
      }, { status: 400 })
    }

    // Get the contact message (appeal)
    const { data: contactMessage } = await supabase
      .from('contact_messages')
      .select('id, user_id, message')
      .eq('id', message_id || id)
      .single()

    if (!contactMessage || !contactMessage.user_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Appeal message not found',
      }, { status: 404 })
    }

    // Extract related_id from the appeal message
    const messageText = contactMessage.message
    const relatedIdMatch = messageText.match(/ID: ([a-f0-9-]+)/i)
    const relatedTypeMatch = messageText.match(/Related to: (\w+)/i)
    
    if (!relatedIdMatch || !relatedTypeMatch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Could not extract appeal details from message',
      }, { status: 400 })
    }

    const relatedId = relatedIdMatch[1]
    const relatedType = relatedTypeMatch[1].toLowerCase()

    // Find the challenge and update appeal decision
    // Challenge may be in deleted items, so don't filter by deleted_at
    const { data: challenges, error: challengeError } = await supabase
      .from('reader_challenges')
      .select('id, target_id, target_type, status, challenger_id')
      .eq('target_type', relatedType)
      .eq('target_id', relatedId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1)

    if (challengeError || !challenges || challenges.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Challenge not found',
      }, { status: 404 })
    }

    const challenge = challenges[0]

    // Update appeal decision
    // If appeal is accepted, we can reverse the challenge back to pending (restore from deleted)
    // If appeal is rejected, keep it in deleted items
    const updateData: any = {
      appeal_decision: decision,
    }

    if (decision === 'accepted') {
      // Reverse the challenge: restore from deleted items and set status back to pending
      updateData.deleted_at = null
      updateData.status = 'pending'
    }
    // If rejected, keep deleted_at as is (already in deleted items)

    await supabase
      .from('reader_challenges')
      .update(updateData)
      .eq('id', challenge.id)

    // If appeal is accepted, we need to notify the originally reported user
    // that the report acceptance has been reverted
    if (decision === 'accepted' && challenge.status === 'accepted') {
      // Get the reported user (the one who was warned)
      let reportedUserId: string | null = null
      
      if (relatedType === 'comment') {
        const { data: comment } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', relatedId)
          .single()
        
        if (comment) {
          reportedUserId = comment.user_id
        }
      }

      if (reportedUserId && reportedUserId !== contactMessage.user_id) {
        // Notify the originally reported user that the acceptance was reverted
        await sendNotification({
          user_id: reportedUserId,
          type: 'appeal_response',
          title: 'Report Decision Reverted',
          message: `The report that was previously accepted against your content has been reviewed again through an appeal process. After careful reconsideration, we've determined that the original decision was incorrect. The report acceptance has been reverted and your warning has been removed.\n\nWe apologize for any inconvenience this may have caused.`,
          related_id: relatedId,
          related_type: relatedType,
        })
      }
    }

    // Get comment content if it's a comment appeal
    let commentContent = ''
    if (relatedType === 'comment') {
      const { data: comment } = await supabase
        .from('comments')
        .select('content')
        .eq('id', relatedId)
        .single()
      
      if (comment) {
        commentContent = comment.content
      }
    }

    // Send notification to the user who appealed
    if (decision === 'accepted') {
      await sendNotification({
        user_id: contactMessage.user_id,
        type: 'appeal_response',
        title: 'Appeal Accepted',
        message: `We apologize for the inconvenience. After reviewing your appeal, we've determined that our initial decision was incorrect. Your appeal has been accepted and the warning has been removed.\n\nYour comment:\n"${commentContent}"\n\nWe apologize for any confusion this may have caused.`,
        related_id: relatedId,
        related_type: relatedType,
      })
    } else {
      // Appeal rejected - notify the user who appealed
      await sendNotification({
        user_id: contactMessage.user_id,
        type: 'appeal_response',
        title: 'Appeal Decision',
        message: `After careful review, we've determined that our initial decision was correct. Your appeal has been rejected.\n\nYour comment:\n"${commentContent}"\n\nThis decision is final and no further appeals are allowed.`,
        related_id: relatedId,
        related_type: relatedType,
      })

      // Also notify the original reporter that their rejection was upheld (only when appeal is made)
      if (challenge.challenger_id) {
        await sendNotification({
          user_id: challenge.challenger_id,
          type: 'report_rejected',
          title: 'Report Review Complete',
          message: `Thank you for your report. After review (including an appeal process), we've determined that the content does not violate our guidelines. We appreciate your vigilance in helping maintain our community standards.`,
          related_id: challenge.id,
          related_type: 'challenge',
        })
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Appeal decision updated and user notified',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update appeal decision',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

