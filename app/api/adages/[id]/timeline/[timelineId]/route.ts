// API route for individual timeline entry operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// PUT /api/adages/[id]/timeline/[timelineId] - Update timeline entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; timelineId: string } }
) {
  try {
    const user = await requireAdmin()
    const { timelineId } = params
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
      .update({
        time_period_start,
        time_period_end: time_period_end || null,
        popularity_level,
        primary_location: primary_location || null,
        geographic_changes: geographic_changes || null,
        notes: notes || null,
        sources: sources || [],
      })
      .eq('id', timelineId)
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
      message: 'Timeline entry updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update timeline entry',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/adages/[id]/timeline/[timelineId] - Delete timeline entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; timelineId: string } }
) {
  try {
    const user = await requireAdmin()
    const { timelineId } = params

    const { error } = await supabase
      .from('adage_timeline')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', timelineId)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Timeline entry deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete timeline entry',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}


