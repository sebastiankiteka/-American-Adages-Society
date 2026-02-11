// API route for individual adage operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, trackView, ApiResponse, getClientIP } from '@/lib/api-helpers'
import { errorLogger } from '@/lib/error-logger'
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
    const ipAddress = getClientIP(request)
    await trackView('adage', id, user?.id, ipAddress)

    // Get related data - use supabaseAdmin to bypass RLS
    const [variants, translations, related, usageExamples, timeline, allComments, citations] = await Promise.all([
      supabaseAdmin.from('adage_variants').select('*').eq('adage_id', id).is('deleted_at', null),
      supabaseAdmin.from('adage_translations').select('*').eq('adage_id', id).is('deleted_at', null),
      supabaseAdmin.from('related_adages').select('*,related_adage:adages!related_adage_id(*)').eq('adage_id', id),
      supabaseAdmin.from('adage_usage_examples').select('*,created_by_user:users!created_by(id,username,display_name)').eq('adage_id', id).is('deleted_at', null).is('hidden_at', null),
      supabaseAdmin.from('adage_timeline').select('*').eq('adage_id', id).is('deleted_at', null).order('time_period_start'),
      supabaseAdmin.from('comments').select('*,user:users!user_id(id,username,display_name,profile_image_url)').eq('target_type', 'adage').eq('target_id', id).is('deleted_at', null).is('hidden_at', null).order('created_at'),
      supabaseAdmin.from('citations').select('*,submitted_by_user:users!submitted_by(id,username,display_name)').eq('adage_id', id).is('deleted_at', null),
    ])

    // Separate commendations (admin/official comments) from regular comments
    const commentsData = allComments.data || []
    const commendations = commentsData.filter((c: any) => c.is_commendation === true)
    const regularComments = commentsData.filter((c: any) => c.is_commendation !== true)

    // Get vote score and save count
    const [votesResult, savedResult] = await Promise.all([
      supabase
        .from('votes')
        .select('value')
        .eq('target_type', 'adage')
        .eq('target_id', id),
      supabaseAdmin
        .from('saved_adages')
        .select('id', { count: 'exact', head: true })
        .eq('adage_id', id)
        .is('deleted_at', null),
    ])

    const score = votesResult.data?.reduce((sum, v) => sum + v.value, 0) || 0
    const saveCount = savedResult.count || 0

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

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...adage,
        score,
        save_count: saveCount,
        userVote,
        variants: variants.data || [],
        translations: translations.data || [],
        related: related.data || [],
        usageExamples: usageExamples.data || [],
        timeline: timeline.data || [],
        comments: regularComments,
        commendations: commendations,
        citations: citations.data || [],
      },
    })

    // Cache for 10 minutes (600 seconds) for individual adage pages
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    
    return response
  } catch (error: any) {
    const user = await getCurrentUser()
    const { id } = params
    errorLogger.logError(error, {
      userId: user?.id,
      url: `/api/adages/${id}`,
      action: 'GET',
    })
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

    // Add updated_by to track who made the change
    const updateData = {
      ...body,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('adages')
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

    await logActivity(user.id, 'update_adage', 'adage', id)

    return NextResponse.json<ApiResponse<Adage>>({
      success: true,
      data,
      message: 'Adage updated successfully',
    })
  } catch (error: any) {
    const { id } = params
    errorLogger.logError(error, {
      userId: (await requireAdmin()).id,
      url: `/api/adages/${id}`,
      action: 'PUT',
    })
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
