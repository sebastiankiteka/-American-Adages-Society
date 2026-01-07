'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Event } from '@/lib/db-types'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function AdminEvents() {
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Event & { time?: string }>>({})
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  // Fetch events from API
  useEffect(() => {
    if (status === 'loading' || !session) return
    
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/events')
        const result: ApiResponse<Event[]> = await response.json()
        
        if (result.success && result.data) {
          setEvents(result.data)
        } else {
          setError(result.error || 'Failed to load events')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [session, status])

  const handleSave = async () => {
    if (!formData.title || !formData.event_date) {
      setError('Title and event date are required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        end_date: formData.end_date || null,
        location: formData.location || null,
        event_type: formData.event_type || 'other',
      }

      let response: Response
      if (editing) {
        response = await fetch(`/api/events/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const result: ApiResponse<Event> = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/events')
        const refreshResult: ApiResponse<Event[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setEvents(refreshResult.data)
        }
        setEditing(null)
        setShowAddForm(false)
        setFormData({})
      } else {
        setError(result.error || 'Failed to save event')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditing(event.id)
    setFormData({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      end_date: event.end_date,
      location: event.location,
      event_type: event.event_type,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/events')
        const refreshResult: ApiResponse<Event[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setEvents(refreshResult.data)
        }
      } else {
        setError(result.error || 'Failed to delete event')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete event')
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

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">Manage Events</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Back to Admin
            </button>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditing(null)
                setFormData({})
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Add New Event
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray mb-8">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">
              {editing ? 'Edit Event' : 'Add New Event'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Event Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.event_date ? new Date(formData.event_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date ? new Date(formData.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Type</label>
                <select
                  value={formData.event_type || 'other'}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as Event['event_type'] })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                >
                  <option value="discussion">Discussion</option>
                  <option value="workshop">Workshop</option>
                  <option value="speaker">Speaker</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(null)
                    setShowAddForm(false)
                    setFormData({})
                    setError('')
                  }}
                  disabled={saving}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light">Loading events...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray text-center">
                <p className="text-charcoal-light">No events found. Create your first event!</p>
              </div>
            ) : (
              events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-serif mb-2 text-charcoal">{event.title}</h3>
                  <p className="text-charcoal-light mb-2">{event.description}</p>
                  <div className="text-sm text-charcoal-light space-y-1">
                    <p><strong>Date:</strong> {new Date(event.event_date).toLocaleString()}</p>
                    {event.end_date && <p><strong>End Date:</strong> {new Date(event.end_date).toLocaleString()}</p>}
                    {event.location && <p><strong>Location:</strong> {event.location}</p>}
                    {event.event_type && <p><strong>Type:</strong> {event.event_type}</p>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

