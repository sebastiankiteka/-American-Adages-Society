'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface DeletedItem {
  id: string
  type: string
  title?: string
  content?: string
  adage?: string
  deleted_at: string
  deleted_by?: string
  original_data?: any
}

export default function AdminDeletedItems() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<DeletedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [appealedItemsCount, setAppealedItemsCount] = useState(0)
  const [notificationRead, setNotificationRead] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return
    fetchDeletedItems()
    fetchAppealedCount()
    // Check if notification was already read
    const readStatus = localStorage.getItem('admin_deleted_items_read')
    setNotificationRead(readStatus === 'true')
  }, [session, status, filterType])

  const fetchAppealedCount = async () => {
    try {
      const response = await fetch('/api/admin/counts')
      const result: ApiResponse<{ appealedItems: number }> = await response.json()
      if (result.success && result.data) {
        setAppealedItemsCount(result.data.appealedItems || 0)
      }
    } catch (err) {
      console.error('Failed to fetch appealed items count:', err)
    }
  }

  const markNotificationAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel: 'deleted_items' }),
      })
      localStorage.setItem('admin_deleted_items_read', 'true')
      setNotificationRead(true)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const fetchDeletedItems = async () => {
    setLoading(true)
    setError('')
    try {
      const url = `/api/admin/deleted-items${filterType !== 'all' ? `?type=${filterType}` : ''}`
      const response = await fetch(url)
      const result: ApiResponse<DeletedItem[]> = await response.json()

      if (result.success && result.data) {
        setItems(result.data)
      } else {
        setError(result.error || 'Failed to load deleted items')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load deleted items')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (itemId: string, itemType: string) => {
    if (!confirm('Are you sure you want to restore this item?')) return

    try {
      const response = await fetch(`/api/admin/deleted-items/${itemType}/${itemId}/restore`, {
        method: 'POST',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        alert('Item restored successfully')
        fetchDeletedItems()
      } else {
        alert(result.error || 'Failed to restore item')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore item')
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

  const getItemDisplay = (item: DeletedItem) => {
    switch (item.type) {
      case 'comment':
        return {
          title: 'Comment',
          preview: item.content?.substring(0, 100) || 'No content',
          link: null,
        }
      case 'adage':
        return {
          title: item.adage || 'Adage',
          preview: item.original_data?.definition?.substring(0, 100) || 'No definition',
          link: `/archive/${item.id}`,
        }
      case 'blog':
        return {
          title: item.title || 'Blog Post',
          preview: item.content?.substring(0, 100) || 'No content',
          link: `/blog/${item.id}`,
        }
      case 'forum_thread':
        return {
          title: item.title || 'Forum Thread',
          preview: item.content?.substring(0, 100) || 'No content',
          link: null,
        }
      case 'challenge':
        return {
          title: item.title || 'Appealed Challenge',
          preview: item.content?.substring(0, 100) || 'No content',
          link: null,
        }
      default:
        return {
          title: `${item.type} (${item.id.substring(0, 8)})`,
          preview: 'No preview available',
          link: null,
        }
    }
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-bronze hover:text-bronze/80 mb-4 inline-block"
          >
            ← Back to Admin Panel
          </Link>
          <h1 className="text-4xl font-bold font-serif text-charcoal">
            Deleted Items
          </h1>
          <p className="text-charcoal-light mt-2">
            Review and restore deleted content. Deletions can be reverted here.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-charcoal mb-2">
            Filter by Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
          >
            <option value="all">All Types</option>
            <option value="comment">Comments</option>
            <option value="adage">Adages</option>
            <option value="blog">Blog Posts</option>
            <option value="forum_thread">Forum Threads</option>
            <option value="forum_reply">Forum Replies</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {appealedItemsCount > 0 && !notificationRead && (
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-yellow-800 mb-1">
                New Appeal Decisions ({appealedItemsCount})
              </h3>
              <p className="text-yellow-700 text-sm">
                There are {appealedItemsCount} item(s) with appeal decisions that need your attention.
              </p>
            </div>
            <button
              onClick={markNotificationAsRead}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Mark as Read
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-charcoal-light">Loading deleted items...</p>
        ) : items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-soft-gray text-center">
            <p className="text-charcoal-light">No deleted items found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const display = getItemDisplay(item)
              return (
                <div key={`${item.type}-${item.id}`} className="bg-white p-6 rounded-lg border border-soft-gray">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium uppercase">
                          {item.type}
                        </span>
                        <span className="text-xs text-charcoal-light">
                          Deleted: {format(new Date(item.deleted_at), 'MMM d, yyyy HH:mm')}
                        </span>
                        {item.type === 'challenge' && (item as any).appeal_decision && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            (item as any).appeal_decision === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Appeal: {(item as any).appeal_decision}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold font-serif text-charcoal mb-2">
                        {display.title}
                      </h3>
                      <p className="text-sm text-charcoal-light mb-2">
                        {display.preview}
                        {display.preview.length >= 100 && '...'}
                      </p>
                      {display.link && (
                        <Link
                          href={display.link}
                          className="text-sm text-bronze hover:underline"
                          target="_blank"
                        >
                          View Original →
                        </Link>
                      )}
                    </div>
                    <button
                      onClick={() => handleRestore(item.id, item.type)}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

