import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/api-helpers'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// GET /api/challenges - List challenges (public, filtered by status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get('target_type')
    const targetId = searchParams.get('target_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('reader_challenges')
      .select(`
        *,
        challenger:users!challenger_id(id, username, display_name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (targetType) {
      query = query.eq('target_type', targetType)
    }

    if (targetId) {
      query = query.eq('target_id', targetId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Fetch target details for each challenge
    const challengesWithTargets = await Promise.all(
      (data || []).map(async (challenge) => {
        let target = null
        if (challenge.target_type === 'adage') {
          const { data: adage } = await supabase
            .from('adages')
            .select('id, adage')
            .eq('id', challenge.target_id)
            .single()
          target = adage
        } else if (challenge.target_type === 'blog') {
          const { data: blog } = await supabase
            .from('blog_posts')
            .select('id, title')
            .eq('id', challenge.target_id)
            .single()
          target = blog
        } else if (challenge.target_type === 'comment') {
          const { data: comment } = await supabase
            .from('comments')
            .select('id, content')
            .eq('id', challenge.target_id)
            .single()
          target = comment
        }

        return {
          ...challenge,
          target,
        }
      })
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      data: challengesWithTargets,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch challenges',
    }, { status: 500 })
  }
}

// POST /api/challenges - Submit a new challenge
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    if (!(user as any).email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please verify your email before submitting challenges',
      }, { status: 403 })
    }

    const body = await request.json()
    const { target_type, target_id, challenge_reason, suggested_correction } = body

    if (!target_type || !target_id || !challenge_reason || !challenge_reason.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Target type, target ID, and challenge reason are required',
      }, { status: 400 })
    }

    // Verify target exists
    let targetExists = false
    if (target_type === 'adage') {
      const { data } = await supabase
        .from('adages')
        .select('id')
        .eq('id', target_id)
        .is('deleted_at', null)
        .single()
      targetExists = !!data
    } else if (target_type === 'blog') {
      const { data } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('id', target_id)
        .is('deleted_at', null)
        .single()
      targetExists = !!data
    } else if (target_type === 'comment') {
      const { data } = await supabase
        .from('comments')
        .select('id')
        .eq('id', target_id)
        .is('deleted_at', null)
        .single()
      targetExists = !!data
    }

    if (!targetExists) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Target not found',
      }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('reader_challenges')
      .insert({
        target_type,
        target_id,
        challenger_id: user.id,
        challenge_reason: challenge_reason.trim(),
        suggested_correction: suggested_correction?.trim() || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Challenge submitted - stats will update on next refresh
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Challenge submitted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to submit challenge',
    }, { status: 500 })
  }
}

