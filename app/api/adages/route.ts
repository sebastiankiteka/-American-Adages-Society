// API route for adages CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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
      query = query.eq('featured', true)
        .or(`featured_until.is.null,featured_until.gt.${new Date().toISOString()}`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get vote scores for each adage
    const adagesWithScores = await Promise.all(
      (data || []).map(async (adage) => {
        const { data: votes } = await supabase
          .from('votes')
          .select('value')
          .eq('target_type', 'adage')
          .eq('target_id', adage.id)

        const score = votes?.reduce((sum, v) => sum + v.value, 0) || 0

        return {
          ...adage,
          score,
        }
      })
    )

    return NextResponse.json<ApiResponse<Adage[]>>({
      success: true,
      data: adagesWithScores,
    })
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


