'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Document {
  id: string
  title: string
  description?: string
  file_url: string
  file_name: string
  category: string
  published: boolean
  order_index: number
  created_at: string
  updated_at: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function AdminDocuments() {
  const { data: session, status } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Document>>({
    category: 'general',
    published: true,
    order_index: 0,
  })
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  // Fetch documents from API
  useEffect(() => {
    if (status === 'loading' || !session) return
    
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/documents?include_hidden=true')
        const result: ApiResponse<Document[]> = await response.json()
        
        if (result.success && result.data) {
          setDocuments(result.data)
        } else {
          setError(result.error || 'Failed to load documents')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [session, status])

  const handleSave = async () => {
    if (!formData.title || !formData.file_url || !formData.file_name) {
      setError('Title, file URL, and file name are required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        title: formData.title,
        description: formData.description || null,
        file_url: formData.file_url,
        file_name: formData.file_name,
        category: formData.category || 'general',
        published: formData.published !== undefined ? formData.published : true,
        order_index: formData.order_index || 0,
      }

      let response: Response
      if (editing) {
        response = await fetch(`/api/documents/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const result: ApiResponse<Document> = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/documents?include_hidden=true')
        const refreshResult: ApiResponse<Document[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setDocuments(refreshResult.data)
        }
        setEditing(null)
        setShowAddForm(false)
        setFormData({ category: 'general', published: true, order_index: 0 })
      } else {
        setError(result.error || 'Failed to save document')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (doc: Document) => {
    setEditing(doc.id)
    setFormData({
      title: doc.title,
      description: doc.description,
      file_url: doc.file_url,
      file_name: doc.file_name,
      category: doc.category,
      published: doc.published,
      order_index: doc.order_index,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/documents?include_hidden=true')
        const refreshResult: ApiResponse<Document[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setDocuments(refreshResult.data)
        }
      } else {
        setError(result.error || 'Failed to delete document')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete document')
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setShowAddForm(false)
    setFormData({ category: 'general', published: true, order_index: 0 })
    setError('')
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

  const categories = ['general', 'constitution', 'bylaws', 'financial', 'meeting-minutes', 'policies']

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">Manage Documents</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Back to Admin
            </Link>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditing(null)
                setFormData({ category: 'general', published: true, order_index: 0 })
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Add New Document
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray mb-8">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">
              {editing ? 'Edit Document' : 'Add New Document'}
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
                <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">File URL *</label>
                  <input
                    type="text"
                    value={formData.file_url || ''}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                    placeholder="/path/to/file.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">File Name *</label>
                  <input
                    type="text"
                    value={formData.file_name || ''}
                    onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                    placeholder="document.pdf"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Category</label>
                  <select
                    value={formData.category || 'general'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index || 0}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published || false}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-bronze border-soft-gray rounded focus:ring-bronze"
                  />
                  <span className="text-sm font-medium text-charcoal">Published (visible to public)</span>
                </label>
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
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Document' : 'Create Document'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-charcoal">Loading documents...</p>
        ) : error && !showAddForm ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden">
            <table className="w-full">
              <thead className="bg-soft-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-gray">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-cream">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-charcoal">{doc.title}</div>
                      {doc.description && (
                        <div className="text-xs text-charcoal-light mt-1">{doc.description.substring(0, 50)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded bg-soft-gray text-charcoal">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                      {doc.file_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded ${
                        doc.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="text-bronze hover:text-bronze/80 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.length === 0 && (
              <div className="px-6 py-12 text-center text-charcoal-light">
                No documents found. Click "Add New Document" to create one.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


