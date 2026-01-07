'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BlogPost } from '@/lib/db-types'
import ContentPreview from '@/components/ContentPreview'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function AdminBlog() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<BlogPost>>({})
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  // Fetch posts from API
  useEffect(() => {
    if (status === 'loading' || !session) return
    
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blog-posts')
        const result: ApiResponse<BlogPost[]> = await response.json()
        
        if (result.success && result.data) {
          setPosts(result.data)
        } else {
          setError(result.error || 'Failed to load blog posts')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [session, status])

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setError('Title and content are required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        title: formData.title,
        excerpt: formData.excerpt || null,
        content: formData.content,
        tags: formData.tags || [],
        published: formData.published || false,
      }

      let response: Response
      if (editing) {
        response = await fetch(`/api/blog-posts/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/blog-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const result: ApiResponse<BlogPost> = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/blog-posts')
        const refreshResult: ApiResponse<BlogPost[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setPosts(refreshResult.data)
        }
        setEditing(null)
        setShowAddForm(false)
        setFormData({})
      } else {
        setError(result.error || 'Failed to save blog post')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditing(post.id)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags,
      published: post.published,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/blog-posts')
        const refreshResult: ApiResponse<BlogPost[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setPosts(refreshResult.data)
        }
      } else {
        setError(result.error || 'Failed to delete blog post')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete blog post')
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
          <h1 className="text-4xl font-bold font-serif text-charcoal">Manage Blog Posts</h1>
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
              Add New Post
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray mb-8">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">
              {editing ? 'Edit Blog Post' : 'Add New Blog Post'}
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
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Excerpt *</label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Content *</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published || false}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-bronze border-soft-gray rounded focus:ring-bronze"
                  />
                  <span className="text-sm font-medium text-charcoal">Published</span>
                </label>
                <p className="text-xs text-charcoal-light mt-1">
                  Uncheck to save as draft (drafts are only visible to admins)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="culture, history, philosophy"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <ContentPreview
                  title={formData.title || 'Untitled Post'}
                  content={formData.content || ''}
                  excerpt={formData.excerpt}
                  type="blog"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : formData.published ? 'Publish' : 'Save Draft'}
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
            <p className="text-charcoal-light">Loading blog posts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray text-center">
                <p className="text-charcoal-light">No blog posts found. Create your first post!</p>
              </div>
            ) : (
              posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-serif mb-2 text-charcoal">{post.title}</h3>
                  <p className="text-charcoal-light mb-2">{post.excerpt}</p>
                  <div className="text-sm text-charcoal-light">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    {post.published ? (
                      <span className="inline-block text-xs px-2 py-1 bg-green-100 text-green-800 rounded ml-2">Published</span>
                    ) : (
                      <span className="inline-block text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded ml-2">Draft</span>
                    )}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-soft-gray text-charcoal-light rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editing === post.id && (
                <div className="mt-6 pt-6 border-t border-soft-gray">
                  <VersionHistory targetType="blog" targetId={post.id} />
                </div>
              )}
            </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

