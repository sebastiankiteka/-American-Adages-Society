'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
  description?: string
  is_public: boolean
  adage_count: number
  created_at: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function MyCollections() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', is_public: false })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ name: '', description: '', is_public: false })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchCollections = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/collections')
        const result: ApiResponse<Collection[]> = await response.json()

        if (result.success && result.data) {
          setCollections(result.data)
        } else {
          setError(result.error || 'Failed to load collections')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load collections')
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [session, status, router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Collection name is required')
      return
    }

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result: ApiResponse<Collection> = await response.json()

      if (result.success && result.data) {
        setCollections([...collections, result.data])
        setFormData({ name: '', description: '', is_public: false })
        setShowCreateForm(false)
        setError('')
      } else {
        setError(result.error || 'Failed to create collection')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create collection')
    }
  }

  const handleEdit = (collection: Collection) => {
    setEditingId(collection.id)
    setEditFormData({
      name: collection.name,
      description: collection.description || '',
      is_public: collection.is_public,
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !editFormData.name.trim()) {
      setError('Collection name is required')
      return
    }

    try {
      const response = await fetch(`/api/collections/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      const result: ApiResponse<Collection> = await response.json()

      if (result.success && result.data) {
        setCollections(collections.map(c => c.id === editingId ? result.data! : c))
        setEditingId(null)
        setEditFormData({ name: '', description: '', is_public: false })
        setError('')
      } else {
        setError(result.error || 'Failed to update collection')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update collection')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setCollections(collections.filter(c => c.id !== id))
      } else {
        alert(result.error || 'Failed to delete collection')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete collection')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary">My Collections</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
            >
              Back to Profile
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create Collection'}
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-6">
            <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">Create New Collection</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Collection Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 text-accent-primary border-border-medium rounded focus:ring-accent-primary"
                />
                <label htmlFor="is_public" className="ml-2 text-sm text-text-metadata">
                  Make this collection public
                </label>
              </div>
              {error && (
                <div className="bg-error-bg border border-error-text/30 text-error-text p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
              >
                Create Collection
              </button>
            </form>
          </div>
        )}

        {error && !showCreateForm && (
          <div className="bg-error-bg border border-error-text/30 text-error-text p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {collections.length === 0 ? (
          <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-lg text-text-secondary mb-4">You don't have any collections yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all"
              >
                {editingId === collection.id ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                      required
                    />
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.is_public}
                        onChange={(e) => setEditFormData({ ...editFormData, is_public: e.target.checked })}
                        className="w-4 h-4 text-accent-primary border-border-medium rounded focus:ring-accent-primary"
                      />
                      <label className="ml-2 text-sm text-text-metadata">Public</label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <Link
                        href={`/profile/collections/${collection.id}`}
                        className="flex-1"
                      >
                        <h3 className="text-xl font-bold font-serif text-text-primary hover:text-accent-primary transition-colors">{collection.name}</h3>
                      </Link>
                      {collection.is_public && (
                        <span className="px-2 py-1 bg-success-bg text-success-text rounded-full text-xs border border-success-text/30">
                          Public
                        </span>
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">{collection.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-text-metadata mb-3">
                      <span>{collection.adage_count} adage{collection.adage_count !== 1 ? 's' : ''}</span>
                      <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/profile/collections/${collection.id}`}
                        className="flex-1 px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-center text-sm"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleEdit(collection)}
                        className="px-3 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(collection.id)}
                        className="px-3 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

