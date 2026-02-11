// API route to get featured adages (supports rotation)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'
import { Adage } from '@/lib/db-types'

// GET /api/adages/featured - Get currently featured adages (up to 3 for rotation)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '3')
    const now = new Date().toISOString()

    // Get currently featured adages
    const { data: featuredAdages, error } = await supabase
      .from('adages')
      .select('*')
      .eq('featured', true)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .or(`featured_until.is.null,featured_until.gt.${now}`)
      .order('featured_until', { ascending: true, nullsFirst: false })
      .limit(limit)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get featured history and reasons for each adage
    const adagesWithHistory = await Promise.all(
      (featuredAdages || []).map(async (adage) => {
        // Get current featured reason
        const { data: currentHistory } = await supabase
          .from('featured_adages_history')
          .select('reason, featured_from, featured_until')
          .eq('adage_id', adage.id)
          .or(`featured_until.is.null,featured_until.gt.${now}`)
          .order('featured_from', { ascending: false })
          .limit(1)
          .single()

        // Get all featured dates for this adage
        const { data: allHistory } = await supabase
          .from('featured_adages_history')
          .select('featured_from, featured_until, reason')
          .eq('adage_id', adage.id)
          .order('featured_from', { ascending: false })

        // Get save count
        const { count: saveCount } = await supabase
          .from('saved_adages')
          .select('id', { count: 'exact', head: true })
          .eq('adage_id', adage.id)
          .is('deleted_at', null)

        return {
          ...adage,
          featured_reason: currentHistory?.reason || null,
          featured_dates: allHistory || [],
          save_count: saveCount || 0,
        }
      })
    )

    return NextResponse.json<ApiResponse<typeof adagesWithHistory>>({
      success: true,
      data: adagesWithHistory,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch featured adages',
    }, { status: 500 })
  }
}














