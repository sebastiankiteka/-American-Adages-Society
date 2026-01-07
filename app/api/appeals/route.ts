import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'
import { sendNotification } from '@/lib/notifications'

// POST /api/appeals - Submit an appeal for a report decision
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const { notification_id, appeal_message, related_id, related_type } = body

    if (!notification_id || !appeal_message || !appeal_message.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Notification ID and appeal message are required',
      }, { status: 400 })
    }

    // Verify notification belongs to user and is a warning
    const { data: notification } = await supabase
      .from('notifications')
      .select('id, user_id, type, related_id, related_type')
      .eq('id', notification_id)
      .eq('user_id', user.id)
      .eq('type', 'report_warning')
      .single()

    if (!notification) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Notification not found or not eligible for appeal',
      }, { status: 404 })
    }

    // Find the challenge/report associated with this notification
    // First, try to extract challenge ID from the notification message (if stored there)
    let challengeId: string | null = null
    if (notification.message) {
      const challengeIdMatch = notification.message.match(/Challenge ID: ([a-f0-9-]+)/i)
      if (challengeIdMatch) {
        challengeId = challengeIdMatch[1]
      }
    }

    let challenge: any = null

    // If we have the challenge ID, look it up directly (even if in deleted items)
    if (challengeId) {
      // Select only columns that exist (appeal_count might not exist if migration not run)
      const { data: foundChallenge, error: directError } = await supabase
        .from('reader_challenges')
        .select('id, target_type, target_id, status, deleted_at')
        .eq('id', challengeId)
        .eq('status', 'accepted')
        .single()

      if (!directError && foundChallenge) {
        challenge = foundChallenge
        // Set defaults for appeal fields if they don't exist
        challenge.appeal_count = challenge.appeal_count || 0
        challenge.appeal_allowed = challenge.appeal_allowed !== undefined ? challenge.appeal_allowed : true
      }
    }

    // Fallback: Find by target_id and target_type (the comment ID)
    if (!challenge) {
      // Try to find by the exact match (including deleted items - no deleted_at filter)
      // Select only columns that definitely exist (appeal_count might not exist)
      let { data: challenges, error: challengeError } = await supabase
        .from('reader_challenges')
        .select('id, target_type, target_id, status, deleted_at, created_at')
        .eq('target_type', notification.related_type || 'comment')
        .eq('target_id', notification.related_id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })

      // If not found, try without status filter (in case it was changed)
      if (!challenges || challenges.length === 0) {
        const { data: allChallenges } = await supabase
          .from('reader_challenges')
          .select('id, target_type, target_id, status, deleted_at, created_at')
          .eq('target_type', notification.related_type || 'comment')
          .eq('target_id', notification.related_id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        // Filter to find accepted ones (even if in deleted items)
        challenges = allChallenges?.filter(c => c.status === 'accepted') || []
      }

      if (challengeError) {
        console.error('Error finding challenge:', challengeError)
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Error finding associated report: ${challengeError.message}`,
        }, { status: 500 })
      }

      if (challenges && challenges.length > 0) {
        challenge = challenges[0]
        // Set defaults for appeal fields if they don't exist
        challenge.appeal_count = challenge.appeal_count || 0
        challenge.appeal_allowed = challenge.appeal_allowed !== undefined ? challenge.appeal_allowed : true
      }
    }

    if (!challenge) {
      console.error('Challenge not found for appeal. Notification:', {
        notification_id: notification.id,
        related_type: notification.related_type,
        related_id: notification.related_id,
        challenge_id_from_message: challengeId,
      })
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Associated report not found. The challenge may have been deleted or the status may have changed. Please contact support if you believe this is an error.',
      }, { status: 404 })
    }

    // Check if appeal is allowed
    if (!challenge.appeal_allowed || (challenge.appeal_count && challenge.appeal_count >= 1)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You have already submitted an appeal for this report. Further appeals are not allowed.',
      }, { status: 400 })
    }

    // Get the comment content for the appeal message
    let commentContent = ''
    if (notification.related_type === 'comment') {
      const { data: comment } = await supabase
        .from('comments')
        .select('content')
        .eq('id', notification.related_id)
        .single()
      
      if (comment) {
        commentContent = comment.content
      }
    }

    // Create a contact message for the appeal
    const { data: contactMessage, error: contactError } = await supabase
      .from('contact_messages')
      .insert({
        name: user.display_name || user.username || user.email,
        email: user.email,
        message: `APPEAL REQUEST\n\nRelated to: ${notification.related_type} (ID: ${notification.related_id || related_id})\n${commentContent ? `\nReported Content:\n"${commentContent}"\n` : ''}\nAppeal Message:\n${appeal_message.trim()}`,
        category: 'correction',
        user_id: user.id,
      })
      .select()
      .single()

    if (contactError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: contactError.message,
      }, { status: 400 })
    }

    // Update challenge appeal tracking
    // Check if appeal columns exist by trying to select them first
    try {
      const { data: checkChallenge, error: checkError } = await supabase
        .from('reader_challenges')
        .select('appeal_count, appeal_allowed')
        .eq('id', challenge.id)
        .single()

      // If we can select these columns, they exist - update them
      if (!checkError && checkChallenge) {
        const updateData: any = {
          appeal_count: ((checkChallenge as any).appeal_count || 0) + 1,
          appeal_allowed: false,
        }

        // Try to add last_appeal_at if it exists
        try {
          updateData.last_appeal_at = new Date().toISOString()
        } catch (e) {
          // Column might not exist, skip it
        }

        await supabase
          .from('reader_challenges')
          .update(updateData)
          .eq('id', challenge.id)
      }
    } catch (appealUpdateError: any) {
      // If columns don't exist, that's okay - migration may not have been run
      // Log warning but continue - the appeal will still be created
      console.warn('Appeal tracking columns may not exist - migration may need to be run. Appeal will still be processed.')
    }

    // Notify user that appeal was submitted
    await sendNotification({
      user_id: user.id,
      type: 'general',
      title: 'Appeal Submitted',
      message: `Your appeal has been submitted and will be reviewed by our team. We'll notify you once a decision has been made.`,
      related_id: contactMessage.id,
      related_type: 'contact_message',
    })

    // Notify all admins about the appeal request
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .is('deleted_at', null)

    if (admins && admins.length > 0) {
      // Send notification to each admin
      await Promise.all(admins.map(admin => 
        sendNotification({
          user_id: admin.id,
          type: 'general',
          title: 'New Appeal Request',
          message: `A user has submitted an appeal for a challenge decision. Please review the appeal in the contact messages panel.\n\nAppeal ID: ${contactMessage.id}\nRelated to: ${notification.related_type} (ID: ${notification.related_id})`,
          related_id: contactMessage.id,
          related_type: 'contact_message',
        })
      ))
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: contactMessage,
      message: 'Appeal submitted successfully. Our team will review it and get back to you.',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to submit appeal',
    }, { status: 500 })
  }
}

