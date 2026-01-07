'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ForumSection {
  id: string
  title: string
  slug: string
  description?: string
  rules?: string
  subsection_of?: string
  order_index: number
  locked: boolean
  subsections?: ForumSection[]
}

interface ForumReply {
  id: string
  content: string
  created_at: string
  updated_at: string
  thread_id: string
  author_id: string
  author?: {
    id: string
    username?: string
    display_name?: string
    email?: string
  }
  thread?: {
    id: string
    title: string
    slug: string
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function AdminForum() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sections, setSections] = useState<ForumSection[]>([])
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    rules: '',
    subsection_of: '',
    order_index: 0,
    locked: false,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchSections = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/forum/sections')
        const result: ApiResponse<ForumSection[]> = await response.json()

        if (result.success && result.data) {
          // Flatten sections and subsections
          const allSections: ForumSection[] = []
          result.data.forEach(section => {
            allSections.push(section)
            if (section.subsections) {
              allSections.push(...section.subsections)
            }
          })
          setSections(allSections)
        } else {
          setError(result.error || 'Failed to load sections')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load sections')
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [session, status])

  useEffect(() => {
    if (showReplies && status !== 'loading' && session) {
      fetchReplies()
    }
  }, [showReplies, session, status])

  const fetchReplies = async () => {
    try {
      setLoadingReplies(true)
      const response = await fetch('/api/forum/replies')
      const result: ApiResponse<ForumReply[]> = await response.json()

      if (result.success && result.data) {
        setReplies(result.data)
      } else {
        setError(result.error || 'Failed to load replies')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load replies')
    } finally {
      setLoadingReplies(false)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setReplies(replies.filter(r => r.id !== replyId))
        alert('Reply deleted successfully')
      } else {
        alert(result.error || 'Failed to delete reply')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete reply')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.slug.trim()) {
      setError('Title and slug are required')
      return
    }

    try {
      const response = await fetch('/api/forum/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subsection_of: formData.subsection_of || null,
        }),
      })

      const result: ApiResponse<ForumSection> = await response.json()

      if (result.success && result.data) {
        setSections([...sections, result.data])
        setFormData({
          title: '',
          slug: '',
          description: '',
          rules: '',
          subsection_of: '',
          order_index: 0,
          locked: false,
        })
        setShowCreateForm(false)
        setError('')
      } else {
        setError(result.error || 'Failed to create section')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create section')
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this section? This will also delete all threads and replies in it.')) {
      return
    }

    try {
      const response = await fetch(`/api/forum/sections/${slug}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setSections(sections.filter(s => s.slug !== slug))
      } else {
        alert(result.error || 'Failed to delete section')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete section')
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
          <h1 className="text-4xl font-bold font-serif text-charcoal">Forum Management</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              {showReplies ? 'Hide Replies' : 'Manage Replies'}
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create Section'}
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Back to Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray mb-6">
            <h2 className="text-2xl font-bold font-serif mb-4 text-charcoal">Create New Section</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="section-slug"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Rules</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="Posting rules for this section..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-charcoal mb-2">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    checked={formData.locked}
                    onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                    className="w-4 h-4 text-bronze border-soft-gray rounded focus:ring-bronze"
                  />
                  <label className="ml-2 text-sm text-charcoal-light">Locked</label>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
              >
                Create Section
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light">Loading sections...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray text-center">
            <p className="text-charcoal-light">No forum sections found. Create your first section!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold font-serif text-charcoal">
                        {section.title}
                      </h3>
                      {section.locked && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Locked
                        </span>
                      )}
                      {section.subsection_of && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Subsection
                        </span>
                      )}
                    </div>
                    <p className="text-charcoal-light mb-2">Slug: {section.slug}</p>
                    {section.description && (
                      <p className="text-charcoal-light mb-2">{section.description}</p>
                    )}
                    <p className="text-sm text-charcoal-light">Order: {section.order_index}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/forum/${section.slug}`}
                      target="_blank"
                      className="px-3 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(section.slug)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Replies Management Section */}
        {showReplies && (
          <div className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden mt-6">
            <div className="p-6 border-b border-soft-gray">
              <h2 className="text-2xl font-bold font-serif text-charcoal">Forum Replies Management</h2>
              <p className="text-sm text-charcoal-light mt-1">View and manage all forum replies</p>
            </div>
            {loadingReplies ? (
              <div className="p-8 text-center">
                <p className="text-charcoal-light">Loading replies...</p>
              </div>
            ) : replies.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-charcoal-light">No replies found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft-gray">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                        Thread
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-soft-gray">
                    {replies.map((reply) => (
                      <tr key={reply.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                          {reply.author?.display_name || reply.author?.username || reply.author?.email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-light max-w-md">
                          <p className="line-clamp-2">{reply.content}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                          {reply.thread ? (
                            <Link
                              href={`/forum/${reply.thread.slug}`}
                              target="_blank"
                              className="text-bronze hover:underline"
                            >
                              {reply.thread.title}
                            </Link>
                          ) : (
                            'Unknown'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

