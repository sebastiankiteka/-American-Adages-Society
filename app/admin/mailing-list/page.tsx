'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface MailingListEntry {
  id: string
  email: string
  source: string
  confirmed: boolean
  date_added: string
  unsubscribed_at?: string
}


interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function AdminMailingList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<MailingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weeklyEmailNotifications, setWeeklyEmailNotifications] = useState(0)
  const [notificationRead, setNotificationRead] = useState(false)
  const [weeklyNotifications, setWeeklyNotifications] = useState<any[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchMailingList = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/mailing-list')
        const result: ApiResponse<MailingListEntry[]> = await response.json()

        if (result.success && result.data) {
          setEntries(result.data)
        } else {
          setError(result.error || 'Failed to load mailing list')
        }
        
      } catch (err: any) {
        setError(err.message || 'Failed to load mailing list')
      } finally {
        setLoading(false)
      }
    }

    fetchMailingList()
    fetchWeeklyEmailNotifications()
    // Check if notification was already read
    const readStatus = localStorage.getItem('admin_mailing_list_read') === 'true'
    setNotificationRead(readStatus)
  }, [session, status])

  const fetchWeeklyEmailNotifications = async () => {
    try {
      // Get count from admin counts API
      const countsResponse = await fetch('/api/admin/counts')
      const countsResult: ApiResponse<{ weeklyEmailNotifications: number }> = await countsResponse.json()
      if (countsResult.success && countsResult.data) {
        setWeeklyEmailNotifications(countsResult.data.weeklyEmailNotifications || 0)
      }

      // Also fetch actual notifications for display
      const userId = (session?.user as any)?.id
      if (userId) {
        const response = await fetch(`/api/notifications?unread=true`)
        const result: ApiResponse<any[]> = await response.json()

        if (result.success && result.data) {
          // Filter for weekly featured adage notifications
          const weeklyNotifs = result.data.filter(n => 
            n.type === 'system' && 
            n.title && 
            n.title.includes('Weekly Featured Adage') && 
            !n.read_at
          )
          setWeeklyNotifications(weeklyNotifs)
        }
      }
    } catch (err) {
      console.error('Failed to fetch weekly email notifications:', err)
    }
  }

  const markNotificationAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel: 'mailing_list' }),
      })
      localStorage.setItem('admin_mailing_list_read', 'true')
      setNotificationRead(true)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
        <p className="text-charcoal">Loading...</p>
      </div>
    )
  }

  if ((session.user as any)?.role !== 'admin') {
    return null
  }

  const activeSubscribers = entries.filter(e => !e.unsubscribed_at)
  const confirmedCount = activeSubscribers.filter(e => e.confirmed).length

  // Get user subscribers count
  const [userSubscriberCount, setUserSubscriberCount] = useState<number | null>(null)
  useEffect(() => {
    if (status === 'loading' || !session) return
    fetch('/api/admin/users?subscribed=true')
      .then(res => res.json())
      .then((result: ApiResponse<{ count: number }>) => {
        if (result.success && result.data) {
          setUserSubscriberCount(result.data.count)
        }
      })
      .catch(() => {})
  }, [session, status])

  const totalSubscribers = confirmedCount + (userSubscriberCount || 0)

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-charcoal">Mailing List</h1>
            <p className="text-charcoal-light mt-2">
              {totalSubscribers} total subscribers ({confirmedCount} from mailing list{userSubscriberCount ? `, ${userSubscriberCount} registered users` : ''})
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/mailing-list/send-weekly')}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Send Weekly Email
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Back to Admin
            </button>
          </div>
        </div>

        {/* Weekly Email Notification Banner */}
        {weeklyEmailNotifications > 0 && !notificationRead && (
          <div className="bg-bronze/10 border-2 border-bronze rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold font-serif text-charcoal mb-2">
                  📧 Weekly Email Ready to Send
                </h3>
                <p className="text-charcoal-light mb-4">
                  {weeklyEmailNotifications === 1 
                    ? 'A new weekly featured adage is ready. You can send the weekly email to all subscribers.'
                    : `${weeklyEmailNotifications} weekly featured adages are ready. You can send the weekly email to all subscribers.`}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      markNotificationAsRead()
                      router.push('/admin/mailing-list/send-weekly')
                    }}
                    className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-semibold"
                  >
                    Send Weekly Email →
                  </button>
                  <button
                    onClick={markNotificationAsRead}
                    className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light">Loading mailing list...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray text-center">
            <p className="text-charcoal-light">No mailing list entries found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft-gray">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                      Date Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-soft-gray">
                  {entries.map((entry) => (
                    <tr key={entry.id} className={entry.unsubscribed_at ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                        {entry.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                        {entry.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.unsubscribed_at ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Unsubscribed
                          </span>
                        ) : entry.confirmed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                        {new Date(entry.date_added).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!entry.unsubscribed_at && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to remove ${entry.email} from the mailing list?`)) {
                                try {
                                  const response = await fetch(`/api/mailing-list/${entry.id}`, {
                                    method: 'DELETE',
                                  })
                                  const result = await response.json()
                                  if (result.success) {
                                    setEntries(entries.map(e => 
                                      e.id === entry.id ? { ...e, unsubscribed_at: new Date().toISOString() } : e
                                    ))
                                  } else {
                                    alert(result.error || 'Failed to remove from mailing list')
                                  }
                                } catch (err: any) {
                                  alert(err.message || 'Failed to remove from mailing list')
                                }
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

