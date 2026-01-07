'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Adage } from '@/lib/db-types'
import AdageDetailsManager from '@/components/AdageDetailsManager'
import ContentPreview from '@/components/ContentPreview'
import VersionHistory from '@/components/VersionHistory'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-32 bg-card-bg-muted rounded-lg animate-pulse" />
})

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function AdminAdagesPage() {
  const { data: session, status } = useSession()
  const [adages, setAdages] = useState<Adage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Adage>>({})
  const [expandedAdageId, setExpandedAdageId] = useState<string | null>(null)
  const [selectedAdages, setSelectedAdages] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'delete' | 'feature' | 'unfeature' | null>(null)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  // Fetch adages from API
  useEffect(() => {
    if (status === 'loading' || !session) return
    
    const fetchAdages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/adages')
        const result: ApiResponse<Adage[]> = await response.json()
        
        if (result.success && result.data) {
          setAdages(result.data)
        } else {
          setError(result.error || 'Failed to load adages')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load adages')
      } finally {
        setLoading(false)
      }
    }

    fetchAdages()
  }, [session, status])

  const handleSave = async () => {
    if (!formData.adage || !formData.definition) {
      setError('Adage and definition are required')
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        adage: formData.adage,
        definition: formData.definition,
        origin: formData.origin || null,
        etymology: formData.etymology || null,
        historical_context: formData.historical_context || null,
        interpretation: formData.interpretation || null,
        modern_practicality: formData.modern_practicality || null,
        first_known_usage: formData.first_known_usage || null,
        first_known_usage_date: formData.first_known_usage_date || null,
        first_known_usage_uncertain: formData.first_known_usage_uncertain || false,
        geographic_spread: formData.geographic_spread || null,
        tags: formData.tags || [],
        featured: formData.featured || false,
        featured_until: formData.featured_until || null,
        published_at: formData.published_at || new Date().toISOString(),
      }

      let response: Response
      if (editing) {
        response = await fetch(`/api/adages/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/adages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const result: ApiResponse<Adage> = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/adages')
        const refreshResult: ApiResponse<Adage[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setAdages(refreshResult.data)
        }
        setEditing(null)
        setShowAddForm(false)
        setFormData({})
      } else {
        setError(result.error || 'Failed to save adage')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save adage')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (adage: Adage) => {
    setEditing(adage.id)
    setFormData({
      adage: adage.adage,
      definition: adage.definition,
      origin: adage.origin,
      etymology: adage.etymology,
      historical_context: adage.historical_context,
      interpretation: adage.interpretation,
      modern_practicality: adage.modern_practicality,
      first_known_usage: adage.first_known_usage,
      first_known_usage_date: adage.first_known_usage_date,
      first_known_usage_uncertain: adage.first_known_usage_uncertain || false,
      geographic_spread: adage.geographic_spread,
      tags: adage.tags,
      featured: adage.featured,
      featured_until: adage.featured_until,
      published_at: adage.published_at || adage.created_at,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this adage?')) return

    try {
      const response = await fetch(`/api/adages/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Refresh the list
        const refreshResponse = await fetch('/api/adages')
        const refreshResult: ApiResponse<Adage[]> = await refreshResponse.json()
        if (refreshResult.success && refreshResult.data) {
          setAdages(refreshResult.data)
        }
      } else {
        setError(result.error || 'Failed to delete adage')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete adage')
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setShowAddForm(false)
    setFormData({})
    setError('')
  }

  const toggleSelectAdage = (adageId: string) => {
    const newSelected = new Set(selectedAdages)
    if (newSelected.has(adageId)) {
      newSelected.delete(adageId)
    } else {
      newSelected.add(adageId)
    }
    setSelectedAdages(newSelected)
  }

  const selectAll = () => {
    if (selectedAdages.size === adages.length) {
      setSelectedAdages(new Set())
    } else {
      setSelectedAdages(new Set(adages.map(a => a.id)))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAdages.size === 0) return

    try {
      setSaving(true)
      setError('')

      if (bulkAction === 'delete') {
        // Delete each selected adage
        for (const id of selectedAdages) {
          await fetch(`/api/adages/${id}`, { method: 'DELETE' })
        }
      } else if (bulkAction === 'feature') {
        // Feature each selected adage
        for (const id of selectedAdages) {
          await fetch(`/api/adages/${id}/set-featured`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Bulk featured' }),
          })
        }
      } else if (bulkAction === 'unfeature') {
        // Unfeature each selected adage
        for (const id of selectedAdages) {
          const adage = adages.find(a => a.id === id)
          if (adage) {
            await fetch(`/api/adages/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ featured: false, featured_until: null }),
            })
          }
        }
      }

      // Refresh the list
      const refreshResponse = await fetch('/api/adages')
      const refreshResult: ApiResponse<Adage[]> = await refreshResponse.json()
      if (refreshResult.success && refreshResult.data) {
        setAdages(refreshResult.data)
      }
      setSelectedAdages(new Set())
      setBulkAction(null)
    } catch (err: any) {
      setError(err.message || 'Failed to perform bulk action')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  if ((session.user as any)?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary">Manage Adages</h1>
          <div className="flex gap-4">
            <a
              href="/api/adages/export?format=csv"
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
              download
            >
              Export CSV
            </a>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
            >
              Back to Admin
            </button>
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditing(null)
                setFormData({})
              }}
              className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Add New Adage
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAdages.size > 0 && (
          <div className="bg-card-bg p-4 rounded-lg shadow-sm border border-border-medium mb-6 flex items-center justify-between">
            <span className="text-text-primary font-medium">
              {selectedAdages.size} adage(s) selected
            </span>
            <div className="flex gap-3">
              <select
                value={bulkAction || ''}
                onChange={(e) => setBulkAction(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              >
                <option value="">Select action...</option>
                <option value="feature">Feature</option>
                <option value="unfeature">Unfeature</option>
                <option value="delete">Delete</option>
              </select>
              {bulkAction && (
                <button
                  onClick={handleBulkAction}
                  disabled={saving}
                  className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedAdages(new Set())
                  setBulkAction(null)
                }}
                className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium mb-8">
            <h2 className="text-2xl font-bold font-serif mb-6 text-text-primary">
              {editing ? 'Edit Adage' : 'Add New Adage'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Adage *</label>
                <input
                  type="text"
                  value={formData.adage || ''}
                  onChange={(e) => setFormData({ ...formData, adage: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  placeholder="e.g., A penny saved is a penny earned"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Definition *</label>
                <RichTextEditor
                  value={formData.definition || ''}
                  onChange={(value) => setFormData({ ...formData, definition: value })}
                  placeholder="Enter the definition of the adage..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Origin</label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Etymology</label>
                <RichTextEditor
                  value={formData.etymology || ''}
                  onChange={(value) => setFormData({ ...formData, etymology: value })}
                  placeholder="Enter the etymology and word origins..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Historical Context</label>
                <RichTextEditor
                  value={formData.historical_context || ''}
                  onChange={(value) => setFormData({ ...formData, historical_context: value })}
                  placeholder="Enter historical context and background..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Interpretation</label>
                <RichTextEditor
                  value={formData.interpretation || ''}
                  onChange={(value) => setFormData({ ...formData, interpretation: value })}
                  placeholder="Enter interpretation and meaning..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Modern Practicality</label>
                <RichTextEditor
                  value={formData.modern_practicality || ''}
                  onChange={(value) => setFormData({ ...formData, modern_practicality: value })}
                  placeholder="Enter modern applications and relevance..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">First Known Usage</label>
                <textarea
                  value={formData.first_known_usage || ''}
                  onChange={(e) => setFormData({ ...formData, first_known_usage: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  placeholder="e.g., First appeared in Benjamin Franklin's 'Poor Richard's Almanack' in 1737"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">First Known Usage Date</label>
                  <input
                    type="date"
                    value={formData.first_known_usage_date ? new Date(formData.first_known_usage_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, first_known_usage_date: e.target.value || undefined })}
                    className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.first_known_usage_uncertain || false}
                      onChange={(e) => setFormData({ ...formData, first_known_usage_uncertain: e.target.checked })}
                      className="w-4 h-4 text-accent-primary border-border-medium rounded focus:ring-accent-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">First known usage date is uncertain</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Geographic Spread</label>
                <input
                  type="text"
                  value={formData.geographic_spread || ''}
                  onChange={(e) => setFormData({ ...formData, geographic_spread: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  placeholder="e.g., United States, United Kingdom, Canada"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Published Date</label>
                  <input
                    type="datetime-local"
                    value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() })}
                    className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Featured Until (optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.featured_until ? new Date(formData.featured_until).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, featured_until: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                    placeholder="Leave empty for permanent"
                  />
                  <p className="text-xs text-text-metadata mt-1">Set when this featured adage should expire (for weekly rotation)</p>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-accent-primary border-border-medium rounded focus:ring-accent-primary"
                  />
                  <span className="text-sm font-medium text-text-primary">Featured (for weekly adage on homepage)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  placeholder="finance, wisdom, frugality"
                />
              </div>
              {error && (
                <div className="bg-error-bg border border-error-text/30 text-error-text px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <ContentPreview
                  title={formData.adage || 'Untitled Adage'}
                  content={formData.definition || ''}
                  type="adage"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">Loading adages...</p>
          </div>
        ) : adages.length === 0 ? (
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-text-secondary">No adages found. Create your first adage!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <button
                onClick={selectAll}
                className="text-sm text-accent-primary hover:underline"
              >
                {selectedAdages.size === adages.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            {adages.map((adage) => {
              const isExpanded = expandedAdageId === adage.id
              const isSelected = selectedAdages.has(adage.id)
              return (
                <div key={adage.id} className={`bg-card-bg p-6 rounded-lg shadow-sm border ${isSelected ? 'border-accent-primary' : 'border-border-medium'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectAdage(adage.id)}
                        className="mt-1 w-4 h-4 text-accent-primary border-border-medium rounded focus:ring-accent-primary"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold font-serif mb-2 text-text-primary">
                          "{adage.adage}"
                        </h3>
                        <p className="text-text-secondary mb-2">{adage.definition}</p>
                        {adage.origin && (
                          <p className="text-sm text-accent-primary italic">Origin: {adage.origin}</p>
                        )}
                        {adage.featured && (
                          <span className="inline-block text-xs px-2 py-1 bg-accent-primary text-text-inverse rounded ml-2">Featured</span>
                        )}
                        {adage.tags && adage.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {adage.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-1 bg-card-bg-muted text-text-metadata rounded border border-border-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!adage.featured && (
                          <button
                            onClick={async () => {
                              const reason = prompt('Why is this adage being featured? (Optional reason)')
                              if (reason === null) return
                              
                              const featuredUntil = prompt('Featured until (YYYY-MM-DD format, or leave empty for permanent):')
                              if (featuredUntil === null) return
                              
                              try {
                                const response = await fetch(`/api/adages/${adage.id}/set-featured`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    reason: reason || undefined,
                                    featured_until: featuredUntil || undefined,
                                  }),
                                })
                                const result: ApiResponse = await response.json()
                                if (result.success) {
                                  const refreshResponse = await fetch('/api/adages')
                                  const refreshResult: ApiResponse<Adage[]> = await refreshResponse.json()
                                  if (refreshResult.success && refreshResult.data) {
                                    setAdages(refreshResult.data)
                                  }
                                } else {
                                  alert(result.error || 'Failed to set featured adage')
                                }
                              } catch (err: any) {
                                alert(err.message || 'Failed to set featured adage')
                              }
                            }}
                            className="px-4 py-2 bg-success-text text-text-inverse rounded-lg hover:bg-success-text/90 transition-colors text-sm"
                          >
                            Set as Featured
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(adage)}
                          className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(adage.id)}
                          className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setExpandedAdageId(isExpanded ? null : adage.id)
                          }}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                            isExpanded
                              ? 'bg-info-text text-text-inverse'
                              : 'bg-info-text text-text-inverse hover:bg-info-text/90'
                          }`}
                        >
                          {isExpanded ? 'Hide Details' : 'Manage Details'}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <>
                        <AdageDetailsManager adageId={adage.id} adages={adages} />
                        <div className="mt-6 pt-6 border-t border-border-medium">
                          <VersionHistory targetType="adage" targetId={adage.id} />
                        </div>
                      </>
                    )}
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

