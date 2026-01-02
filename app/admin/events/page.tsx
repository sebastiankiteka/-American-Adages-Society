'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEvents, addEvent, updateEvent, deleteEvent, type Event } from '@/lib/adminData'

export default function AdminEvents() {
  const [authenticated, setAuthenticated] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Event>>({})
  const router = useRouter()

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuth) {
      router.push('/admin/login')
    } else {
      setAuthenticated(true)
      setEvents(getEvents())
    }
  }, [router])

  const handleSave = () => {
    if (editing) {
      updateEvent(editing, formData)
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: formData.title || '',
        date: formData.date || '',
        time: formData.time,
        location: formData.location,
        description: formData.description || '',
        type: formData.type || 'other',
      }
      addEvent(newEvent)
    }
    setEvents(getEvents())
    setEditing(null)
    setShowAddForm(false)
    setFormData({})
  }

  const handleEdit = (event: Event) => {
    setEditing(event.id)
    setFormData(event)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id)
      setEvents(getEvents())
    }
  }

  if (!authenticated) return null

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
                  <label className="block text-sm font-medium text-charcoal mb-2">Date *</label>
                  <input
                    type="text"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                    placeholder="February 15, 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Time</label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                    placeholder="6:00 PM - 7:30 PM"
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
                  value={formData.type || 'other'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
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
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(null)
                    setShowAddForm(false)
                    setFormData({})
                  }}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-serif mb-2 text-charcoal">{event.title}</h3>
                  <p className="text-charcoal-light mb-2">{event.description}</p>
                  <div className="text-sm text-charcoal-light space-y-1">
                    <p><strong>Date:</strong> {event.date}</p>
                    {event.time && <p><strong>Time:</strong> {event.time}</p>}
                    {event.location && <p><strong>Location:</strong> {event.location}</p>}
                    {event.type && <p><strong>Type:</strong> {event.type}</p>}
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
          ))}
        </div>
      </div>
    </div>
  )
}

