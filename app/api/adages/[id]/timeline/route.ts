// API route for managing adage timeline
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/adages/[id]/timeline - Get timeline data for an adage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('adage_timeline')
      .select('*')
      .eq('adage_id', id)
      .is('deleted_at', null)
      .order('time_period_start', { ascending: true })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch timeline',
    }, { status: 500 })
  }
}

// POST /api/adages/[id]/timeline - Create a timeline entry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
    const body = await request.json()
    const { time_period_start, time_period_end, popularity_level, primary_location, geographic_changes, notes, sources } = body

    if (!time_period_start || !popularity_level) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Time period start and popularity level are required',
      }, { status: 400 })
    }

    const validLevels = ['ubiquitous', 'very_common', 'common', 'uncommon', 'rare']
    if (!validLevels.includes(popularity_level)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Popularity level must be one of: ${validLevels.join(', ')}`,
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('adage_timeline')
      .insert({
        adage_id: id,
        time_period_start,
        time_period_end: time_period_end || null,
        popularity_level,
        primary_location: primary_location || null,
        geographic_changes: geographic_changes || null,
        notes: notes || null,
        sources: sources || [],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Timeline entry created successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create timeline entry',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}


