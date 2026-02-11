import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/admin/analytics - Get analytics data for admin dashboard
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateISO = startDate.toISOString()

    // Get total views by type (ALL TIME - for reference)
    const [adageViewsAllTime, blogViewsAllTime, forumViewsAllTime] = await Promise.all([
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
        .eq('target_type', 'forum_thread'),
    ])

    // Get total views by type (FOR SELECTED PERIOD)
    const [adageViews, blogViews, forumViews] = await Promise.all([
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'adage')
        .gte('viewed_at', startDateISO),
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'blog')
        .gte('viewed_at', startDateISO),
      supabaseAdmin
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'forum_thread')
        .gte('viewed_at', startDateISO),
    ])

    // Get views over time (last N days)
    const { data: viewsOverTime } = await supabaseAdmin
      .from('views')
      .select('viewed_at, target_type')
      .gte('viewed_at', startDateISO)
      .order('viewed_at', { ascending: true })

    // Group views by date
    const viewsByDate: Record<string, { adage: number; blog: number; forum: number; total: number }> = {}
    if (viewsOverTime) {
      viewsOverTime.forEach((view) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0]
        if (!viewsByDate[date]) {
          viewsByDate[date] = { adage: 0, blog: 0, forum: 0, total: 0 }
        }
        if (view.target_type === 'adage') viewsByDate[date].adage++
        if (view.target_type === 'blog') viewsByDate[date].blog++
        if (view.target_type === 'forum_thread') viewsByDate[date].forum++
        viewsByDate[date].total++
      })
    }

    // Get most viewed adages (only for non-deleted adages)
    const { data: topAdages } = await supabaseAdmin
      .from('views')
      .select('target_id')
      .eq('target_type', 'adage')
      .gte('viewed_at', startDateISO)

    // Get adage details for the viewed adages
    const adageIds = [...new Set((topAdages || []).map((v: any) => v.target_id))]
    const { data: adagesData } = await supabaseAdmin
      .from('adages')
      .select('id, adage')
      .in('id', adageIds)
      .is('deleted_at', null)

    const adageMap = new Map((adagesData || []).map((a: any) => [a.id, a.adage]))

    const adageViewCounts: Record<string, { adage: string; count: number }> = {}
    if (topAdages) {
      topAdages.forEach((view: any) => {
        const adageId = view.target_id
        const adage = adageMap.get(adageId) || 'Unknown (deleted)'
        if (!adageViewCounts[adageId]) {
          adageViewCounts[adageId] = { adage, count: 0 }
        }
        adageViewCounts[adageId].count++
      })
    }

    const topAdagesList = Object.entries(adageViewCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get most viewed blog posts (only for non-deleted posts)
    const { data: topBlogs } = await supabaseAdmin
      .from('views')
      .select('target_id')
      .eq('target_type', 'blog')
      .gte('viewed_at', startDateISO)

    // Get blog post details for the viewed posts
    const blogIds = [...new Set((topBlogs || []).map((v: any) => v.target_id))]
    const { data: blogsData } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title')
      .in('id', blogIds)
      .is('deleted_at', null)

    const blogMap = new Map((blogsData || []).map((b: any) => [b.id, b.title]))

    const blogViewCounts: Record<string, { title: string; count: number }> = {}
    if (topBlogs) {
      topBlogs.forEach((view: any) => {
        const blogId = view.target_id
        const title = blogMap.get(blogId) || 'Unknown (deleted)'
        if (!blogViewCounts[blogId]) {
          blogViewCounts[blogId] = { title, count: 0 }
        }
        blogViewCounts[blogId].count++
      })
    }

    const topBlogsList = Object.entries(blogViewCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Get unique visitors from the unique_visitors table (more accurate)
    const { data: uniqueVisitorStats } = await supabaseAdmin
      .from('unique_visitor_stats')
      .select('*')
      .single()

    // Get unique visitors for the selected period
    const { data: periodUniqueVisitors } = await supabaseAdmin
      .from('unique_visitors')
      .select('user_id, ip_address, first_visit_at, last_visit_at')
      .gte('first_visit_at', startDateISO)

    // Also count visitors who visited during the period (even if they first visited earlier)
    const { data: activeVisitors } = await supabaseAdmin
      .from('unique_visitors')
      .select('user_id, ip_address')
      .gte('last_visit_at', startDateISO)

    const uniqueIPs = new Set<string>()
    const uniqueUsers = new Set<string>()
    const anonymousIPs = new Set<string>()
    const uniqueIdentifiers = new Set<string>()
    
    if (activeVisitors) {
      activeVisitors.forEach((visitor) => {
        if (visitor.user_id) {
          uniqueUsers.add(visitor.user_id)
          uniqueIdentifiers.add(`user:${visitor.user_id}`)
        }
        if (visitor.ip_address) {
          uniqueIPs.add(visitor.ip_address)
          if (!visitor.user_id) {
            anonymousIPs.add(visitor.ip_address)
            uniqueIdentifiers.add(`ip:${visitor.ip_address}`)
          }
        }
      })
    }

    const totalUniqueVisitors = uniqueIdentifiers.size
    const totalUniqueVisitorsAllTime = uniqueVisitorStats?.total_unique_visitors || 0

    // Get page views (target_type = 'page')
    const { count: pageViews } = await supabaseAdmin
      .from('views')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'page')
      .gte('viewed_at', startDateISO)

    const { count: pageViewsAllTime } = await supabaseAdmin
      .from('views')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'page')

    // Get views by hour of day
    const viewsByHour: Record<number, number> = {}
    if (viewsOverTime) {
      viewsOverTime.forEach((view) => {
        const hour = new Date(view.viewed_at).getHours()
        viewsByHour[hour] = (viewsByHour[hour] || 0) + 1
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        totals: {
          adages: adageViews.count || 0,
          blogs: blogViews.count || 0,
          forums: forumViews.count || 0,
          pages: pageViews || 0,
          total: (adageViews.count || 0) + (blogViews.count || 0) + (forumViews.count || 0) + (pageViews || 0),
        },
        totalsAllTime: {
          adages: adageViewsAllTime.count || 0,
          blogs: blogViewsAllTime.count || 0,
          forums: forumViewsAllTime.count || 0,
          pages: pageViewsAllTime || 0,
          total: (adageViewsAllTime.count || 0) + (blogViewsAllTime.count || 0) + (forumViewsAllTime.count || 0) + (pageViewsAllTime || 0),
        },
        viewsOverTime: viewsByDate,
        topAdages: topAdagesList,
        topBlogs: topBlogsList,
        uniqueVisitors: {
          uniqueIPs: uniqueIPs.size,
          uniqueUsers: uniqueUsers.size,
          anonymousIPs: anonymousIPs.size,
          total: totalUniqueVisitors,
          totalAllTime: totalUniqueVisitorsAllTime,
          newVisitors7d: uniqueVisitorStats?.new_visitors_7d || 0,
          newVisitors30d: uniqueVisitorStats?.new_visitors_30d || 0,
          activeVisitors7d: uniqueVisitorStats?.active_visitors_7d || 0,
          activeVisitors30d: uniqueVisitorStats?.active_visitors_30d || 0,
        },
        viewsByHour,
        period: {
          days,
          startDate: startDateISO,
          endDate: new Date().toISOString(),
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch analytics',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

