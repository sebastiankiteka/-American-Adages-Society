// API route for individual event operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, ApiResponse } from '@/lib/api-helpers'
import { Event } from '@/lib/db-types'

// GET /api/events/[id] - Get single event with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .single()

    if (error || !event) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Event not found',
      }, { status: 404 })
    }

    // Get related adages if any
    let relatedAdages: any[] = []
    if (event.related_adage_ids && event.related_adage_ids.length > 0) {
      const { data: adages } = await supabase
        .from('adages')
        .select('id, adage, definition')
        .in('id', event.related_adage_ids)
        .is('deleted_at', null)
      relatedAdages = adages || []
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...event,
        related_adages: relatedAdages,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch event',
    }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('events')
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

    await logActivity(user.id, 'update_event', 'event', id)

    return NextResponse.json<ApiResponse<Event>>({
      success: true,
      data,
      message: 'Event updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update event',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

// DELETE /api/events/[id] - Soft delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params

    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    await logActivity(user.id, 'delete_event', 'event', id)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Event deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete event',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

