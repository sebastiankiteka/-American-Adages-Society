// API route for individual adage operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, trackView, ApiResponse } from '@/lib/api-helpers'
import { Adage } from '@/lib/db-types'

// GET /api/adages/[id] - Get single adage with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get adage
    const { data: adage, error } = await supabase
      .from('adages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !adage) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage not found',
      }, { status: 404 })
    }

    // Track view
    const user = await getCurrentUser()
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    await trackView('adage', id, user?.id, ipAddress)

    // Get related data
    const [variants, translations, related, usageExamples, timeline, comments, citations] = await Promise.all([
      supabase.from('adage_variants').select('*').eq('adage_id', id).is('deleted_at', null),
      supabase.from('adage_translations').select('*').eq('adage_id', id).is('deleted_at', null),
      supabase.from('related_adages').select('*,related_adage:adages!related_adage_id(*)').eq('adage_id', id),
      supabase.from('adage_usage_examples').select('*,created_by_user:users!created_by(id,username,display_name)').eq('adage_id', id).is('deleted_at', null).is('hidden_at', null),
      supabase.from('adage_timeline').select('*').eq('adage_id', id).is('deleted_at', null).order('time_period_start'),
      supabase.from('comments').select('*,user:users!user_id(id,username,display_name,profile_image_url)').eq('target_type', 'adage').eq('target_id', id).is('deleted_at', null).is('hidden_at', null).order('created_at'),
      supabase.from('citations').select('*,submitted_by_user:users!submitted_by(id,username,display_name)').eq('adage_id', id).is('deleted_at', null),
    ])

    // Get vote score
    const { data: votes } = await supabase
      .from('votes')
      .select('value')
      .eq('target_type', 'adage')
      .eq('target_id', id)

    const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0

    // Get user's vote if logged in
    let userVote = null
    if (user) {
      const { data: vote } = await supabase
        .from('votes')
        .select('value')
        .eq('target_type', 'adage')
        .eq('target_id', id)
        .eq('user_id', user.id)
        .single()
      userVote = vote?.value || null
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...adage,
        score,
        userVote,
        variants: variants.data || [],
        translations: translations.data || [],
        related: related.data || [],
        usageExamples: usageExamples.data || [],
        timeline: timeline.data || [],
        comments: comments.data || [],
        citations: citations.data || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch adage',
    }, { status: 500 })
  }
}

// PUT /api/adages/[id] - Update adage (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('adages')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'update_adage', 'adage', id)

    return NextResponse.json<ApiResponse<Adage>>({
      success: true,
      data,
      message: 'Adage updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update adage',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

// DELETE /api/adages/[id] - Soft delete adage (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params

    const { error } = await supabase
      .from('adages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'delete_adage', 'adage', id)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Adage deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete adage',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


