// API route for adages CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, ApiResponse } from '@/lib/api-helpers'
import { Adage } from '@/lib/db-types'

// GET /api/adages - List all adages (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('adages')
      .select('*')
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`adage.ilike.%${search}%,definition.ilike.%${search}%`)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (featured === 'true') {
      const now = new Date().toISOString()
      query = query
        .eq('featured', true)
        .or(`featured_until.is.null,featured_until.gt.${now}`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get vote scores, save counts, and featured info for each adage
    const adagesWithScores = await Promise.all(
      (data || []).map(async (adage) => {
        const [votesResult, savedResult, featuredHistory] = await Promise.all([
          supabase
            .from('votes')
            .select('value')
            .eq('target_type', 'adage')
            .eq('target_id', adage.id),
          supabaseAdmin
            .from('saved_adages')
            .select('id', { count: 'exact', head: true })
            .eq('adage_id', adage.id)
            .is('deleted_at', null),
          // Get current featured reason and dates if featured
          adage.featured
            ? supabase
                .from('featured_adages_history')
                .select('reason, featured_from, featured_until')
                .eq('adage_id', adage.id)
                .or(`featured_until.is.null,featured_until.gt.${new Date().toISOString()}`)
                .order('featured_from', { ascending: false })
                .limit(1)
                .single()
            : Promise.resolve({ data: null, error: null }),
        ])

        const score = votesResult.data?.reduce((sum, v) => sum + v.value, 0) || 0
        const saveCount = savedResult.count || 0
        const featuredReason = featuredHistory.data?.reason || null
        const featuredFrom = featuredHistory.data?.featured_from || null
        const featuredUntil = featuredHistory.data?.featured_until || null

        return {
          ...adage,
          score,
          save_count: saveCount,
          featured_reason: featuredReason,
          featured_from: featuredFrom,
          featured_until: featuredUntil,
        }
      })
    )

    const response = NextResponse.json<ApiResponse<Adage[]>>({
      success: true,
      data: adagesWithScores,
    })

    // Cache for 5 minutes (300 seconds) for frequently accessed data
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch adages',
    }, { status: 500 })
  }
}

// POST /api/adages - Create new adage (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('adages')
      .insert({
        ...body,
        created_by: user.id,
        published_at: body.published_at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'create_adage', 'adage', data.id)

    return NextResponse.json<ApiResponse<Adage>>({
      success: true,
      data,
      message: 'Adage created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create adage',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


