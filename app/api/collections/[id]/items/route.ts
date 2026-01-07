// API route for collection items
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/collections/[id]/items - Get items in a collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { id } = params

    // Verify collection access - use supabaseAdmin to bypass RLS
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('user_id, is_public')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!collection) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Collection not found',
      }, { status: 404 })
    }

    if (collection.user_id !== user.id && !collection.is_public) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    // Get collection items - use supabaseAdmin to bypass RLS
    const { data: items, error } = await supabaseAdmin
      .from('collection_items')
      .select('id, adage_id, date_added, notes')
      .eq('collection_id', id)
      .order('date_added', { ascending: false })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Fetch adage details for each item
    const formatted = await Promise.all(
      (items || []).map(async (item: any) => {
        const { data: adage } = await supabaseAdmin
          .from('adages')
          .select('id, adage, definition')
          .eq('id', item.adage_id)
          .is('deleted_at', null)
          .single()

        return {
          ...item,
          adage: adage || { id: item.adage_id, adage: 'Adage not found', definition: '' },
        }
      })
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formatted,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch collection items',
    }, { status: 500 })
  }
}

// POST /api/collections/[id]/items - Add item to collection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Check if email is verified
    if (!('email_verified' in user) || !user.email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please verify your email before adding to collections',
      }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { adage_id, notes } = body

    if (!adage_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage ID is required',
      }, { status: 400 })
    }

    // Verify collection ownership - use supabaseAdmin to bypass RLS
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!collection || collection.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    // Check if adage exists
    const { data: adage } = await supabaseAdmin
      .from('adages')
      .select('id')
      .eq('id', adage_id)
      .is('deleted_at', null)
      .single()

    if (!adage) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage not found',
      }, { status: 404 })
    }

    // Add to collection (upsert to handle duplicates) - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('collection_items')
      .upsert({
        collection_id: id,
        adage_id,
        notes: notes || null,
      }, {
        onConflict: 'collection_id,adage_id',
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
      message: 'Adage added to collection',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to add to collection',
    }, { status: 500 })
  }
}
