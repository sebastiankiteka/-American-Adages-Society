'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost, type BlogPost } from '@/lib/adminData'

export default function AdminBlog() {
  const [authenticated, setAuthenticated] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<BlogPost>>({})
  const router = useRouter()

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuth) {
      router.push('/admin/login')
    } else {
      setAuthenticated(true)
      setPosts(getBlogPosts())
    }
  }, [router])

  const handleSave = () => {
    if (editing) {
      updateBlogPost(editing, formData)
    } else {
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: formData.title || '',
        excerpt: formData.excerpt || '',
        content: formData.content || '',
        date: formData.date || new Date().toISOString().split('T')[0],
        author: formData.author,
        tags: formData.tags || [],
      }
      addBlogPost(newPost)
    }
    setPosts(getBlogPosts())
    setEditing(null)
    setShowAddForm(false)
    setFormData({})
  }

  const handleEdit = (post: BlogPost) => {
    setEditing(post.id)
    setFormData(post)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      deleteBlogPost(id)
      setPosts(getBlogPosts())
    }
  }

  if (!authenticated) return null

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Author</label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  />
                </div>
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
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-serif mb-2 text-charcoal">{post.title}</h3>
                  <p className="text-charcoal-light mb-2">{post.excerpt}</p>
                  <div className="text-sm text-charcoal-light">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    {post.author && <span className="mx-2">•</span>}
                    {post.author && <span>{post.author}</span>}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

