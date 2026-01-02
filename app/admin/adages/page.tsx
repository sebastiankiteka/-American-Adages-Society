'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAdages, saveAdages, addAdage, updateAdage, deleteAdage, type Adage } from '@/lib/adminData'

export default function AdminAdages() {
  const [authenticated, setAuthenticated] = useState(false)
  const [adages, setAdages] = useState<Adage[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Adage>>({})
  const router = useRouter()

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuth) {
      router.push('/admin/login')
    } else {
      setAuthenticated(true)
      setAdages(getAdages())
    }
  }, [router])

  const handleSave = () => {
    if (editing) {
      updateAdage(editing, formData)
    } else {
      const newAdage: Adage = {
        id: Date.now().toString(),
        adage: formData.adage || '',
        definition: formData.definition || '',
        origin: formData.origin,
        etymology: formData.etymology,
        historicalContext: formData.historicalContext,
        interpretation: formData.interpretation,
        modernPracticality: formData.modernPracticality,
        tags: formData.tags || [],
      }
      addAdage(newAdage)
    }
    setAdages(getAdages())
    setEditing(null)
    setShowAddForm(false)
    setFormData({})
  }

  const handleEdit = (adage: Adage) => {
    setEditing(adage.id)
    setFormData(adage)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this adage?')) {
      deleteAdage(id)
      setAdages(getAdages())
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setShowAddForm(false)
    setFormData({})
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">Manage Adages</h1>
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
              Add New Adage
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray mb-8">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">
              {editing ? 'Edit Adage' : 'Add New Adage'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Adage *</label>
                <input
                  type="text"
                  value={formData.adage || ''}
                  onChange={(e) => setFormData({ ...formData, adage: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="e.g., A penny saved is a penny earned"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Definition *</label>
                <textarea
                  value={formData.definition || ''}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Origin</label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Etymology</label>
                <textarea
                  value={formData.etymology || ''}
                  onChange={(e) => setFormData({ ...formData, etymology: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Historical Context</label>
                <textarea
                  value={formData.historicalContext || ''}
                  onChange={(e) => setFormData({ ...formData, historicalContext: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Interpretation</label>
                <textarea
                  value={formData.interpretation || ''}
                  onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Modern Practicality</label>
                <textarea
                  value={formData.modernPracticality || ''}
                  onChange={(e) => setFormData({ ...formData, modernPracticality: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="finance, wisdom, frugality"
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
                  onClick={handleCancel}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {adages.map((adage) => (
            <div key={adage.id} className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-serif mb-2 text-charcoal">
                    "{adage.adage}"
                  </h3>
                  <p className="text-charcoal-light mb-2">{adage.definition}</p>
                  {adage.origin && (
                    <p className="text-sm text-bronze italic">Origin: {adage.origin}</p>
                  )}
                  {adage.tags && adage.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {adage.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-soft-gray text-charcoal-light rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(adage)}
                    className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(adage.id)}
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

