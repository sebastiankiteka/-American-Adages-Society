// API route to favorite/unfavorite an adage
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/adages/[id]/favorite - Toggle favorite status
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

    const { id } = params

    // Verify adage exists
    const { data: adage } = await supabaseAdmin
      .from('adages')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!adage) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage not found',
      }, { status: 404 })
    }

    // Check if already favorited - use supabaseAdmin to bypass RLS
    // We validate the user above, so this is safe
    const { data: existing } = await supabaseAdmin
      .from('saved_adages')
      .select('id, deleted_at')
      .eq('user_id', user.id)
      .eq('adage_id', id)
      .maybeSingle()

    let favorited: boolean
    let saveCount: number

    if (existing && !existing.deleted_at) {
      // Unfavorite (soft delete) - use supabaseAdmin to bypass RLS
      const { error } = await supabaseAdmin
        .from('saved_adages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message || 'Failed to unfavorite adage',
        }, { status: 400 })
      }

      favorited = false
    } else {
      // Favorite (create or restore) - use supabaseAdmin to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('saved_adages')
        .upsert({
          user_id: user.id,
          adage_id: id,
          deleted_at: null,
        }, {
          onConflict: 'user_id,adage_id',
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message || 'Failed to favorite adage',
        }, { status: 400 })
      }

      favorited = true
    }

    // Get updated save count
    const { count } = await supabaseAdmin
      .from('saved_adages')
      .select('id', { count: 'exact', head: true })
      .eq('adage_id', id)
      .is('deleted_at', null)

    saveCount = count || 0

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        favorited,
        save_count: saveCount,
      },
      message: favorited ? 'Adage favorited' : 'Adage unfavorited',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to toggle favorite',
    }, { status: 500 })
  }
}

// GET /api/adages/[id]/favorite - Check if adage is favorited by current user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { favorited: false },
      })
    }

    const { id } = params

    // Use supabaseAdmin to bypass RLS - we've validated the user above
    const { data } = await supabaseAdmin
      .from('saved_adages')
      .select('id')
      .eq('user_id', user.id)
      .eq('adage_id', id)
      .is('deleted_at', null)
      .maybeSingle()

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { favorited: !!data },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { favorited: false },
    })
  }
}


