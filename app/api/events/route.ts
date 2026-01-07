// API route for events CRUD operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, logActivity, ApiResponse } from '@/lib/api-helpers'
import { Event } from '@/lib/db-types'

// GET /api/events - List all events (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const upcoming = searchParams.get('upcoming')
    const past = searchParams.get('past')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('events')
      .select('*')
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1)

    const now = new Date().toISOString()

    if (upcoming === 'true') {
      query = query.gte('event_date', now)
    } else if (past === 'true') {
      query = query.lt('event_date', now)
    }

    if (type) {
      query = query.eq('event_type', type)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    if (dateFrom) {
      query = query.gte('event_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('event_date', dateTo)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<Event[]>>({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch events',
    }, { status: 500 })
  }
}

// POST /api/events - Create new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const body = await request.json()

    const { data, error } = await supabase
      .from('events')
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

    await logActivity(user.id, 'create_event', 'event', data.id)

    return NextResponse.json<ApiResponse<Event>>({
      success: true,
      data,
      message: 'Event created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create event',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

