// Public analytics API - provides progress data for agenda/growth pages
// This uses the same data source as admin analytics but only returns public stats
// Returns ALL-TIME data (no date filters)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/analytics/public - Get public analytics for agenda/growth pages (ALL-TIME)
export async function GET(request: NextRequest) {
  try {
    // Get total views (all types) - ALL TIME
    const { count: totalViews } = await supabaseAdmin
      .from('views')
      .select('*', { count: 'exact', head: true })

    // Get views by type - ALL TIME
    const [adageViews, blogViews, pageViews, forumViews] = await Promise.all([
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'adage'),
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'blog'),
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'page'),
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'forum_thread'),
    ])

    // Get adages count: use site_metrics (kept in sync by DB trigger) so dashboard matches Archive
    let adagesCount: number | null = null
    const { data: metricsRow } = await supabaseAdmin
      .from('site_metrics')
      .select('value')
      .eq('key', 'total_adages')
      .maybeSingle()
    if (metricsRow != null && metricsRow.value != null) {
      adagesCount = Number(metricsRow.value)
    }
    // Fallback: live count (same visibility as Archive: deleted_at and hidden_at null)
    if (adagesCount == null) {
      const { count: liveCount } = await supabaseAdmin
        .from('adages')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .is('hidden_at', null)
      adagesCount = liveCount ?? 0
    }

    // Get unique visitors stats - try view first, fallback to direct query
    let uniqueVisitorStats: any = null
    try {
      const { data } = await supabaseAdmin
        .from('unique_visitor_stats')
        .select('*')
        .single()
      uniqueVisitorStats = data
    } catch (error) {
      // View might not exist yet, calculate directly from unique_visitors table
      const { data: visitors } = await supabaseAdmin
        .from('unique_visitors')
        .select('user_id, ip_address, first_visit_at, last_visit_at')
      
      if (visitors) {
        const loggedIn = visitors.filter(v => v.user_id).length
        const anonymous = visitors.filter(v => !v.user_id).length
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        uniqueVisitorStats = {
          total_unique_visitors: visitors.length,
          total_logged_in_visitors: loggedIn,
          total_anonymous_visitors: anonymous,
          new_visitors_7d: visitors.filter(v => new Date(v.first_visit_at) >= sevenDaysAgo).length,
          new_visitors_30d: visitors.filter(v => new Date(v.first_visit_at) >= thirtyDaysAgo).length,
          active_visitors_7d: visitors.filter(v => new Date(v.last_visit_at) >= sevenDaysAgo).length,
          active_visitors_30d: visitors.filter(v => new Date(v.last_visit_at) >= thirtyDaysAgo).length,
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totalViews: totalViews || 0,
        adageViews: adageViews.count || 0,
        blogViews: blogViews.count || 0,
        pageViews: pageViews.count || 0,
        forumViews: forumViews.count || 0,
        adagesCount: adagesCount || 0,
        uniqueVisitors: {
          total: uniqueVisitorStats?.total_unique_visitors || 0,
          loggedIn: uniqueVisitorStats?.total_logged_in_visitors || 0,
          anonymous: uniqueVisitorStats?.total_anonymous_visitors || 0,
        },
      },
    })
  } catch (error: any) {
    console.error('[analytics/public] Error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch analytics',
    }, { status: 500 })
  }
}

