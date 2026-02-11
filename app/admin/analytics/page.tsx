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
    pages: number
    total: number
  }
  totalsAllTime?: {
    adages: number
    blogs: number
    forums: number
    pages: number
    total: number
  }
  viewsOverTime: Record<string, { adage: number; blog: number; forum: number; total: number }>
  topAdages: Array<{ id: string; adage: string; count: number }>
  topBlogs: Array<{ id: string; title: string; count: number }>
  uniqueVisitors: {
    uniqueIPs: number
    uniqueUsers: number
    anonymousIPs: number
    total: number
    totalAllTime: number
    newVisitors7d: number
    newVisitors30d: number
    activeVisitors7d: number
    activeVisitors30d: number
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
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading analytics...</p>
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
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-text-primary mb-2">
              Analytics & Foot Traffic
            </h1>
            <p className="text-text-secondary">
              View website traffic and engagement metrics
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-text-primary text-text-inverse rounded-lg hover:bg-text-secondary transition-colors"
          >
            Back to Admin Panel
          </Link>
        </div>

        {error && (
          <div className="bg-error-bg border border-error-text/30 text-error-text p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {analytics && (
          <>
            {/* Period Selector */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Time Period
              </label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Total Views (Period)</h3>
                <p className="text-3xl font-bold text-text-primary">{analytics.totals.total.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-text-secondary mt-1">
                    {analytics.totalsAllTime.total.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Page Views (Period)</h3>
                <p className="text-3xl font-bold text-text-primary">{analytics.totals.pages.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-text-secondary mt-1">
                    {analytics.totalsAllTime.pages.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Adage Views (Period)</h3>
                <p className="text-3xl font-bold text-text-primary">{analytics.totals.adages.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-text-secondary mt-1">
                    {analytics.totalsAllTime.adages.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Blog Views (Period)</h3>
                <p className="text-3xl font-bold text-text-primary">{analytics.totals.blogs.toLocaleString()}</p>
                {analytics.totalsAllTime && (
                  <p className="text-xs text-text-secondary mt-1">
                    {analytics.totalsAllTime.blogs.toLocaleString()} all time
                  </p>
                )}
              </div>
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Unique Visitors</h3>
                <p className="text-3xl font-bold text-text-primary">{analytics.uniqueVisitors.total.toLocaleString()}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {analytics.uniqueVisitors.uniqueUsers} logged-in, {analytics.uniqueVisitors.anonymousIPs} anonymous
                </p>
                {analytics.uniqueVisitors.totalAllTime > 0 && (
                  <p className="text-xs text-text-secondary mt-1">
                    {analytics.uniqueVisitors.totalAllTime.toLocaleString()} total all time
                  </p>
                )}
              </div>
            </div>

            {/* Unique Visitors Stats */}
            {analytics.uniqueVisitors.totalAllTime > 0 && (
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-6">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                  Unique Visitors Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Total All Time</h3>
                    <p className="text-2xl font-bold text-text-primary">{analytics.uniqueVisitors.totalAllTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">New Visitors (7d)</h3>
                    <p className="text-2xl font-bold text-text-primary">{analytics.uniqueVisitors.newVisitors7d.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">New Visitors (30d)</h3>
                    <p className="text-2xl font-bold text-text-primary">{analytics.uniqueVisitors.newVisitors30d.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Active Visitors (7d)</h3>
                    <p className="text-2xl font-bold text-text-primary">{analytics.uniqueVisitors.activeVisitors7d.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Views Over Time Chart */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-6">
              <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                Views Over Time
              </h2>
              {viewsOverTimeArray.length > 0 ? (
                <div className="space-y-2">
                  {viewsOverTimeArray.map((item) => (
                    <div key={item.date} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-text-secondary">
                        {format(new Date(item.date), 'MMM d')}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div
                          className="bg-accent-primary h-6 rounded"
                          style={{ width: `${(item.total / maxViews) * 100}%` }}
                        />
                        <span className="text-sm text-text-primary font-medium min-w-[60px]">
                          {item.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">No views in this period</p>
              )}
            </div>

            {/* Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Adages */}
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                  Most Viewed Adages
                </h2>
                {analytics.topAdages.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topAdages.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-card-bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-accent-primary font-bold w-6">{idx + 1}</span>
                          <Link
                            href={`/archive/${item.id}`}
                            className="text-text-primary hover:text-accent-primary hover:underline"
                          >
                            {item.adage}
                          </Link>
                        </div>
                        <span className="text-text-secondary font-medium">{item.count} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No adage views in this period</p>
                )}
              </div>

              {/* Top Blog Posts */}
              <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                  Most Viewed Blog Posts
                </h2>
                {analytics.topBlogs.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topBlogs.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-card-bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-accent-primary font-bold w-6">{idx + 1}</span>
                          <Link
                            href={`/blog/${item.id}`}
                            className="text-text-primary hover:text-accent-primary hover:underline"
                          >
                            {item.title}
                          </Link>
                        </div>
                        <span className="text-text-secondary font-medium">{item.count} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No blog views in this period</p>
                )}
              </div>
            </div>

            {/* Views by Hour */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
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
                          className="bg-accent-primary rounded-t"
                          style={{ height: `${(count / maxHourViews) * 100}px`, minHeight: count > 0 ? '4px' : '0' }}
                        />
                        <p className="text-xs text-text-secondary mt-1">{hour}</p>
                        {count > 0 && (
                          <p className="text-xs text-text-primary font-medium">{count}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-text-secondary">No view data available</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

