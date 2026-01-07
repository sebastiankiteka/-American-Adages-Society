// API route for user's saved adages
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/users/saved-adages - Get current user's saved adages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Use supabaseAdmin to bypass RLS - we've validated the user above
    const { data, error } = await supabaseAdmin
      .from('saved_adages')
      .select(`
        id,
        adage_id,
        date_added
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('date_added', { ascending: false })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Fetch adage details for each saved adage
    const formatted = await Promise.all(
      (data || []).map(async (item: any) => {
        const { data: adage } = await supabaseAdmin
          .from('adages')
          .select('id, adage, definition')
          .eq('id', item.adage_id)
          .is('deleted_at', null)
          .single()

        return {
          id: item.id,
          adage_id: item.adage_id,
          date_added: item.date_added,
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
      error: error.message || 'Failed to fetch saved adages',
    }, { status: 500 })
  }
}

// POST /api/users/saved-adages - Save an adage
export async function POST(request: NextRequest) {
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
        error: 'Please verify your email before saving adages',
      }, { status: 403 })
    }

    const body = await request.json()
    const { adage_id } = body

    if (!adage_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage ID is required',
      }, { status: 400 })
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

    // Upsert to handle duplicates - use supabaseAdmin to bypass RLS
    // We've validated the user above, so this is safe
    const { data, error } = await supabaseAdmin
      .from('saved_adages')
      .upsert({
        user_id: user.id,
        adage_id,
        deleted_at: null,
      }, {
        onConflict: 'user_id,adage_id',
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
      message: 'Adage saved successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to save adage',
    }, { status: 500 })
  }
}
