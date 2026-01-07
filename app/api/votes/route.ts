// API route for votes
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'
import { checkRateLimit } from '@/lib/rate-limit'

// POST /api/votes - Create or update a vote
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Rate limiting: 30 votes per 15 minutes per user
    const rateLimit = checkRateLimit(`votes:${user.id}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 30,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Too many votes. Please wait a moment before voting again.',
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
        error: 'Please verify your email before voting',
      }, { status: 403 })
    }

    const body = await request.json()
    const { target_type, target_id, value } = body

    // Validate required fields
    if (!target_type || !target_id || value === undefined) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'target_type, target_id, and value are required',
      }, { status: 400 })
    }

    // Validate target_type
    const validTargetTypes = ['adage', 'blog', 'comment']
    if (!validTargetTypes.includes(target_type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid target_type',
      }, { status: 400 })
    }

    // Validate value
    if (value !== -1 && value !== 1 && value !== 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'value must be -1, 0, or 1',
      }, { status: 400 })
    }

    if (value === 0) {
      // Remove vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', target_type)
        .eq('target_id', target_id)

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message,
        }, { status: 400 })
      }
    } else {
      // First, check if vote exists
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id, value')
        .eq('user_id', user.id)
        .eq('target_type', target_type)
        .eq('target_id', target_id)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
        return NextResponse.json<ApiResponse>({
          success: false,
          error: checkError.message,
        }, { status: 400 })
      }

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('votes')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id)

        if (error) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message,
          }, { status: 400 })
        }
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('votes')
          .insert({
            user_id: user.id,
            target_type,
            target_id,
            value,
          })

        if (error) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message,
          }, { status: 400 })
        }
      }
    }

    // Return updated vote count for immediate UI update
    const { data: allVotes } = await supabase
      .from('votes')
      .select('value')
      .eq('target_type', target_type)
      .eq('target_id', target_id)

    const score = allVotes?.reduce((sum, v) => sum + v.value, 0) || 0

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Vote recorded',
      data: {
        score,
        voteCount: allVotes?.length || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to record vote',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}
