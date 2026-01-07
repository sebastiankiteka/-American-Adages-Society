'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'

interface AnalyticsData {
  totals: {
    adages: number
    blogs: number
    forums: number
    total: number
  }
  totalsAllTime?: {
    adages: number
    blogs: number
    forums: number
    total: number
  }
  viewsOverTime: Record<string, { adage: number; blog: number; forum: number; total: number }>
  topAdages: Array<{ id: string; adage: string; count: number }>
  topBlogs: Array<{ id: string; title: string; count: number }>
  uniqueVisitors: {
    uniqueIPs: number
    uniqueUsers: number
    total: number
  }
  viewsByHour: Record<number, number>
  period: {
    days: number
    startDate: string
    endDate: string
  }
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/analytics?days=${days}`)
        const result = await response.json()

        if (result.success && result.data) {
          setAnalytics(result.data)
          setError('')
        } else {
          setError(result.error || 'Failed to load analytics')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [session, status, days])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
        <p className="text-charcoal">Loading analytics...</p>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    return null
  }

  const viewsOverTimeArray = analytics
    ? Object.entries(analytics.viewsOverTime)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  const maxViews = analytics
    ? Math.max(...Object.values(analytics.viewsOverTime).map((v) => v.total), 1)
    : 1

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-charcoal mb-2">
              Analytics & Foot Traffic
            </h1>
            <p className="text-charcoal-light">
              View website traffic and engagement metrics
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-charcoal text-cream rounded-lg hover:bg-charcoal-light transition-colors"
          >
            Back to Admin Panel
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {analytics && (
          <>
            {/* Period Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray mb-6">
              <label className="block text-sm font-medium text-charcoal mb-2">
                Time Period
              </label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
                <h3 className="text-sm font-medium text-charcoal-light mb-2">Total Views (Period)</h3>
                <p className="text-3xl font-bold text-charcoal">{analytics.totals.total.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-charcoal-light mt-1">
                    {analytics.totalsAllTime.total.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
                <h3 className="text-sm font-medium text-charcoal-light mb-2">Adage Views (Period)</h3>
                <p className="text-3xl font-bold text-charcoal">{analytics.totals.adages.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-charcoal-light mt-1">
                    {analytics.totalsAllTime.adages.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
                <h3 className="text-sm font-medium text-charcoal-light mb-2">Blog Views (Period)</h3>
                <p className="text-3xl font-bold text-charcoal">{analytics.totals.blogs.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-charcoal-light mt-1">
                    {analytics.totalsAllTime.blogs.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
                <h3 className="text-sm font-medium text-charcoal-light mb-2">Unique Visitors</h3>
                <p className="text-3xl font-bold text-charcoal">{analytics.uniqueVisitors.total.toLocaleString()}</p>
                <p className="text-xs text-charcoal-light mt-1">
                  {analytics.uniqueVisitors.uniqueUsers} users, {analytics.uniqueVisitors.uniqueIPs} IPs
                </p>
              </div>
            </div>

            {/* Views Over Time Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray mb-6">
              <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
                Views Over Time
              </h2>
              {viewsOverTimeArray.length > 0 ? (
                <div className="space-y-2">
                  {viewsOverTimeArray.map((item) => (
                    <div key={item.date} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-charcoal-light">
                        {format(new Date(item.date), 'MMM d')}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className="bg-bronze h-6 rounded"
                          style={{ width: `${(item.total / maxViews) * 100}%` }}
                        />
                        <span className="text-sm text-charcoal font-medium min-w-[60px]">
                          {item.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-charcoal-light">No views in this period</p>
              )}
            </div>

            {/* Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Adages */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
                  Most Viewed Adages
                </h2>
                {analytics.topAdages.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topAdages.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-soft-gray rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-bronze font-bold w-6">{idx + 1}</span>
                          <Link
                            href={`/archive/${item.id}`}
                            className="text-charcoal hover:text-bronze hover:underline"
                          >
                            {item.adage}
                          </Link>
                        </div>
                        <span className="text-charcoal-light font-medium">{item.count} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal-light">No adage views in this period</p>
                )}
              </div>

              {/* Top Blog Posts */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
                  Most Viewed Blog Posts
                </h2>
                {analytics.topBlogs.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topBlogs.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-soft-gray rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-bronze font-bold w-6">{idx + 1}</span>
                          <Link
                            href={`/blog/${item.id}`}
                            className="text-charcoal hover:text-bronze hover:underline"
                          >
                            {item.title}
                          </Link>
                        </div>
                        <span className="text-charcoal-light font-medium">{item.count} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal-light">No blog views in this period</p>
                )}
              </div>
            </div>

            {/* Views by Hour */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
                Views by Hour of Day
              </h2>
              {Object.keys(analytics.viewsByHour).length > 0 ? (
                <div className="grid grid-cols-12 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const count = analytics.viewsByHour[hour] || 0
                    const maxHourViews = Math.max(...Object.values(analytics.viewsByHour), 1)
                    return (
                      <div key={hour} className="text-center">
                        <div
                          className="bg-bronze rounded-t"
                          style={{ height: `${(count / maxHourViews) * 100}px`, minHeight: count > 0 ? '4px' : '0' }}
                        />
                        <p className="text-xs text-charcoal-light mt-1">{hour}</p>
                        {count > 0 && (
                          <p className="text-xs text-charcoal font-medium">{count}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-charcoal-light">No view data available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

