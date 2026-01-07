// API route to get featured adages history for calendar
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/featured-adages/calendar - Get all featured adages history including currently featured
export async function GET(request: NextRequest) {
  try {
    const now = new Date().toISOString()
    
    // Get featured history
    const { data: history, error: historyError } = await supabase
      .from('featured_adages_history')
      .select(`
        id,
        adage_id,
        featured_from,
        featured_until,
        reason,
        adages!inner(id, adage)
      `)
      .order('featured_from', { ascending: false })

    if (historyError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: historyError.message,
      }, { status: 500 })
    }

    // Get currently featured adages that might not be in history yet
    const { data: currentlyFeatured, error: featuredError } = await supabase
      .from('adages')
      .select('id, adage, featured_until')
      .eq('featured', true)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .or(`featured_until.is.null,featured_until.gt.${now}`)

    if (featuredError) {
      console.error('Error fetching currently featured:', featuredError)
    }

    // Format history data
    const formattedHistory = (history || []).map((item: any) => ({
      id: item.id,
      adage_id: item.adage_id,
      featured_from: item.featured_from,
      featured_until: item.featured_until,
      reason: item.reason,
      adage: {
        id: item.adages.id,
        adage: item.adages.adage,
      },
    }))

    // Add currently featured adages that aren't in history
    const historyAdageIds = new Set(formattedHistory.map((h: any) => h.adage_id))
    const additionalFeatured = (currentlyFeatured || [])
      .filter((adage: any) => !historyAdageIds.has(adage.id))
      .map((adage: any) => {
        // Get the most recent history entry for this adage to get reason and featured_from
        const adageHistory = formattedHistory
          .filter((h: any) => h.adage_id === adage.id)
          .sort((a: any, b: any) => 
            new Date(b.featured_from).getTime() - new Date(a.featured_from).getTime()
          )[0]

        return {
          id: `current-${adage.id}`,
          adage_id: adage.id,
          featured_from: adageHistory?.featured_from || new Date().toISOString(),
          featured_until: adage.featured_until || null,
          reason: adageHistory?.reason || null,
          adage: {
            id: adage.id,
            adage: adage.adage,
          },
        }
      })

    // Combine and return
    const allFeatured = [...formattedHistory, ...additionalFeatured]

    return NextResponse.json<ApiResponse>({
      success: true,
      data: allFeatured,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch featured history',
    }, { status: 500 })
  }
}

