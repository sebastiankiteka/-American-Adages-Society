'use client'

import { useState, useEffect } from 'react'
import { AdageVariant, AdageTranslation, AdageUsageExample, AdageTimeline, Adage } from '@/lib/db-types'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface AdageDetailsManagerProps {
  adageId: string
  adages: Adage[] // For selecting related adages
}

export default function AdageDetailsManager({ adageId, adages }: AdageDetailsManagerProps) {
  const [variants, setVariants] = useState<AdageVariant[]>([])
  const [translations, setTranslations] = useState<AdageTranslation[]>([])
  const [related, setRelated] = useState<any[]>([])
  const [usageExamples, setUsageExamples] = useState<AdageUsageExample[]>([])
  const [timeline, setTimeline] = useState<AdageTimeline[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'variants' | 'translations' | 'related' | 'examples' | 'timeline'>('variants')

  // Form states
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [showTranslationForm, setShowTranslationForm] = useState(false)
  const [showRelatedForm, setShowRelatedForm] = useState(false)
  const [showExampleForm, setShowExampleForm] = useState(false)
  const [showTimelineForm, setShowTimelineForm] = useState(false)

  const [editingVariant, setEditingVariant] = useState<string | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<string | null>(null)
  const [editingExample, setEditingExample] = useState<string | null>(null)
  const [editingTimeline, setEditingTimeline] = useState<string | null>(null)

  const [variantForm, setVariantForm] = useState({ variant_text: '', notes: '' })
  const [translationForm, setTranslationForm] = useState({ language_code: '', translated_text: '', translator_notes: '' })
  const [relatedForm, setRelatedForm] = useState({ related_adage_id: '', relationship_type: 'similar', notes: '' })
  const [exampleForm, setExampleForm] = useState({ example_text: '', context: '', source_type: 'official' })
  const [timelineForm, setTimelineForm] = useState({ time_period_start: '', time_period_end: '', popularity_level: 'common', primary_location: '', geographic_changes: '', notes: '', sources: '' })

  useEffect(() => {
    fetchAllData()
  }, [adageId])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [variantsRes, translationsRes, relatedRes, examplesRes, timelineRes] = await Promise.all([
        fetch(`/api/adages/${adageId}/variants`),
        fetch(`/api/adages/${adageId}/translations`),
        fetch(`/api/adages/${adageId}/related`),
        fetch(`/api/adages/${adageId}/usage-examples`),
        fetch(`/api/adages/${adageId}/timeline`),
      ])

      const [variantsData, translationsData, relatedData, examplesData, timelineData] = await Promise.all([
        variantsRes.json(),
        translationsRes.json(),
        relatedRes.json(),
        examplesRes.json(),
        timelineRes.json(),
      ])

      if (variantsData.success) setVariants(variantsData.data || [])
      if (translationsData.success) setTranslations(translationsData.data || [])
      if (relatedData.success) setRelated(relatedData.data || [])
      if (examplesData.success) setUsageExamples(examplesData.data || [])
      if (timelineData.success) setTimeline(timelineData.data || [])
    } catch (err) {
      console.error('Failed to fetch adage details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVariant = async () => {
    if (!variantForm.variant_text.trim()) {
      alert('Variant text is required')
      return
    }

    try {
      const url = editingVariant
        ? `/api/adages/${adageId}/variants/${editingVariant}`
        : `/api/adages/${adageId}/variants`
      const method = editingVariant ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantForm),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        fetchAllData()
        setShowVariantForm(false)
        setEditingVariant(null)
        setVariantForm({ variant_text: '', notes: '' })
      } else {
        alert(result.error || 'Failed to save variant')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save variant')
    }
  }

  const handleSaveTranslation = async () => {
    if (!translationForm.language_code.trim() || !translationForm.translated_text.trim()) {
      alert('Language code and translated text are required')
      return
    }

    try {
      const url = editingTranslation
        ? `/api/adages/${adageId}/translations/${editingTranslation}`
        : `/api/adages/${adageId}/translations`
      const method = editingTranslation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(translationForm),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        fetchAllData()
        setShowTranslationForm(false)
        setEditingTranslation(null)
        setTranslationForm({ language_code: '', translated_text: '', translator_notes: '' })
      } else {
        alert(result.error || 'Failed to save translation')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save translation')
    }
  }

  const handleSaveRelated = async () => {
    if (!relatedForm.related_adage_id) {
      alert('Please select a related adage')
      return
    }

    try {
      const response = await fetch(`/api/adages/${adageId}/related`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(relatedForm),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        fetchAllData()
        setShowRelatedForm(false)
        setRelatedForm({ related_adage_id: '', relationship_type: 'similar', notes: '' })
      } else {
        alert(result.error || 'Failed to add related adage')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add related adage')
    }
  }

  const handleSaveExample = async () => {
    if (!exampleForm.example_text.trim()) {
      alert('Example text is required')
      return
    }

    try {
      const url = editingExample
        ? `/api/adages/${adageId}/usage-examples/${editingExample}`
        : `/api/adages/${adageId}/usage-examples`
      const method = editingExample ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exampleForm),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        fetchAllData()
        setShowExampleForm(false)
        setEditingExample(null)
        setExampleForm({ example_text: '', context: '', source_type: 'official' })
      } else {
        alert(result.error || 'Failed to save usage example')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save usage example')
    }
  }

  const handleSaveTimeline = async () => {
    if (!timelineForm.time_period_start || !timelineForm.popularity_level) {
      alert('Time period start and popularity level are required')
      return
    }

    try {
      const payload = {
        ...timelineForm,
        sources: timelineForm.sources ? timelineForm.sources.split(',').map(s => s.trim()).filter(s => s) : [],
      }

      const url = editingTimeline
        ? `/api/adages/${adageId}/timeline/${editingTimeline}`
        : `/api/adages/${adageId}/timeline`
      const method = editingTimeline ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        fetchAllData()
        setShowTimelineForm(false)
        setEditingTimeline(null)
        setTimelineForm({ time_period_start: '', time_period_end: '', popularity_level: 'common', primary_location: '', geographic_changes: '', notes: '', sources: '' })
      } else {
        alert(result.error || 'Failed to save timeline entry')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save timeline entry')
    }
  }

  const handleDelete = async (type: 'variant' | 'translation' | 'related' | 'example' | 'timeline', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const endpoints: Record<string, string> = {
        variant: `/api/adages/${adageId}/variants/${id}`,
        translation: `/api/adages/${adageId}/translations/${id}`,
        related: `/api/adages/${adageId}/related/${id}`,
        example: `/api/adages/${adageId}/usage-examples/${id}`,
        timeline: `/api/adages/${adageId}/timeline/${id}`,
      }

      const response = await fetch(endpoints[type], {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        fetchAllData()
      } else {
        alert(result.error || 'Failed to delete item')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete item')
    }
  }

  if (loading) {
    return <div className="p-4 text-charcoal-light">Loading details...</div>
  }

  return (
    <div className="mt-4 border-t border-soft-gray pt-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-soft-gray">
        {(['variants', 'translations', 'related', 'examples', 'timeline'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition-colors capitalize ${
              activeTab === tab
                ? 'text-bronze border-b-2 border-bronze'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
          >
            {tab === 'examples' ? 'Usage Examples' : tab}
          </button>
        ))}
      </div>

      {/* Variants Tab */}
      {activeTab === 'variants' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Variants ({variants.length})</h3>
            <button
              onClick={() => {
                setShowVariantForm(true)
                setEditingVariant(null)
                setVariantForm({ variant_text: '', notes: '' })
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
            >
              Add Variant
            </button>
          </div>

          {showVariantForm && (
            <div className="bg-cream p-4 rounded-lg border border-soft-gray mb-4">
              <h4 className="font-semibold text-charcoal mb-2">{editingVariant ? 'Edit' : 'Add'} Variant</h4>
              <div className="space-y-2">
                <textarea
                  value={variantForm.variant_text}
                  onChange={(e) => setVariantForm({ ...variantForm, variant_text: e.target.value })}
                  placeholder="Variant text"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <textarea
                  value={variantForm.notes}
                  onChange={(e) => setVariantForm({ ...variantForm, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveVariant}
                    className="px-4 py-2 bg-bronze text-cream rounded hover:bg-bronze/90 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowVariantForm(false)
                      setEditingVariant(null)
                      setVariantForm({ variant_text: '', notes: '' })
                    }}
                    className="px-4 py-2 bg-soft-gray text-charcoal rounded hover:bg-charcoal hover:text-cream text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {variants.map((variant) => (
              <div key={variant.id} className="bg-cream p-3 rounded border border-soft-gray flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold italic text-charcoal">"{variant.variant_text}"</p>
                  {variant.notes && <p className="text-sm text-charcoal-light mt-1">{variant.notes}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingVariant(variant.id)
                      setVariantForm({ variant_text: variant.variant_text, notes: variant.notes || '' })
                      setShowVariantForm(true)
                    }}
                    className="px-3 py-1 bg-bronze text-cream rounded text-xs hover:bg-bronze/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('variant', variant.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {variants.length === 0 && !showVariantForm && (
              <p className="text-charcoal-light text-sm">No variants added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Translations Tab */}
      {activeTab === 'translations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Translations ({translations.length})</h3>
            <button
              onClick={() => {
                setShowTranslationForm(true)
                setEditingTranslation(null)
                setTranslationForm({ language_code: '', translated_text: '', translator_notes: '' })
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
            >
              Add Translation
            </button>
          </div>

          {showTranslationForm && (
            <div className="bg-cream p-4 rounded-lg border border-soft-gray mb-4">
              <h4 className="font-semibold text-charcoal mb-2">{editingTranslation ? 'Edit' : 'Add'} Translation</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  value={translationForm.language_code}
                  onChange={(e) => setTranslationForm({ ...translationForm, language_code: e.target.value })}
                  placeholder="Language code (e.g., es, fr, de)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                />
                <textarea
                  value={translationForm.translated_text}
                  onChange={(e) => setTranslationForm({ ...translationForm, translated_text: e.target.value })}
                  placeholder="Translated text"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <textarea
                  value={translationForm.translator_notes}
                  onChange={(e) => setTranslationForm({ ...translationForm, translator_notes: e.target.value })}
                  placeholder="Translator notes (optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTranslation}
                    className="px-4 py-2 bg-bronze text-cream rounded hover:bg-bronze/90 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowTranslationForm(false)
                      setEditingTranslation(null)
                      setTranslationForm({ language_code: '', translated_text: '', translator_notes: '' })
                    }}
                    className="px-4 py-2 bg-soft-gray text-charcoal rounded hover:bg-charcoal hover:text-cream text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {translations.map((translation) => (
              <div key={translation.id} className="bg-cream p-3 rounded border border-soft-gray flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-bronze/20 text-bronze rounded text-xs font-semibold uppercase">
                      {translation.language_code}
                    </span>
                  </div>
                  <p className="font-semibold italic text-charcoal">"{translation.translated_text}"</p>
                  {translation.translator_notes && (
                    <p className="text-sm text-charcoal-light mt-1">{translation.translator_notes}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingTranslation(translation.id)
                      setTranslationForm({
                        language_code: translation.language_code,
                        translated_text: translation.translated_text,
                        translator_notes: translation.translator_notes || '',
                      })
                      setShowTranslationForm(true)
                    }}
                    className="px-3 py-1 bg-bronze text-cream rounded text-xs hover:bg-bronze/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('translation', translation.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {translations.length === 0 && !showTranslationForm && (
              <p className="text-charcoal-light text-sm">No translations added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Related Adages Tab */}
      {activeTab === 'related' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Related Adages ({related.length})</h3>
            <button
              onClick={() => {
                setShowRelatedForm(true)
                setRelatedForm({ related_adage_id: '', relationship_type: 'similar', notes: '' })
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
            >
              Add Related Adage
            </button>
          </div>

          {showRelatedForm && (
            <div className="bg-cream p-4 rounded-lg border border-soft-gray mb-4">
              <h4 className="font-semibold text-charcoal mb-2">Add Related Adage</h4>
              <div className="space-y-2">
                <select
                  value={relatedForm.related_adage_id}
                  onChange={(e) => setRelatedForm({ ...relatedForm, related_adage_id: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                >
                  <option value="">Select an adage</option>
                  {adages.filter(a => a.id !== adageId).map((adage) => (
                    <option key={adage.id} value={adage.id}>
                      "{adage.adage}"
                    </option>
                  ))}
                </select>
                <select
                  value={relatedForm.relationship_type}
                  onChange={(e) => setRelatedForm({ ...relatedForm, relationship_type: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                >
                  <option value="similar">Similar</option>
                  <option value="opposing">Opposing</option>
                  <option value="commonly_paired">Commonly Paired</option>
                  <option value="variant">Variant</option>
                  <option value="derived_from">Derived From</option>
                </select>
                <textarea
                  value={relatedForm.notes}
                  onChange={(e) => setRelatedForm({ ...relatedForm, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveRelated}
                    className="px-4 py-2 bg-bronze text-cream rounded hover:bg-bronze/90 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowRelatedForm(false)
                      setRelatedForm({ related_adage_id: '', relationship_type: 'similar', notes: '' })
                    }}
                    className="px-4 py-2 bg-soft-gray text-charcoal rounded hover:bg-charcoal hover:text-cream text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {related.map((rel) => (
              <div key={rel.id} className="bg-cream p-3 rounded border border-soft-gray flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-bronze/20 text-bronze rounded text-xs capitalize">
                      {rel.relationship_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-semibold text-charcoal">
                    "{rel.related_adage?.adage || 'Loading...'}"
                  </p>
                  {rel.notes && <p className="text-sm text-charcoal-light mt-1">{rel.notes}</p>}
                </div>
                <button
                  onClick={() => handleDelete('related', rel.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 ml-4"
                >
                  Remove
                </button>
              </div>
            ))}
            {related.length === 0 && !showRelatedForm && (
              <p className="text-charcoal-light text-sm">No related adages added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Usage Examples Tab */}
      {activeTab === 'examples' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Usage Examples ({usageExamples.length})</h3>
            <button
              onClick={() => {
                setShowExampleForm(true)
                setEditingExample(null)
                setExampleForm({ example_text: '', context: '', source_type: 'official' })
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
            >
              Add Example
            </button>
          </div>

          {showExampleForm && (
            <div className="bg-cream p-4 rounded-lg border border-soft-gray mb-4">
              <h4 className="font-semibold text-charcoal mb-2">{editingExample ? 'Edit' : 'Add'} Usage Example</h4>
              <div className="space-y-2">
                <textarea
                  value={exampleForm.example_text}
                  onChange={(e) => setExampleForm({ ...exampleForm, example_text: e.target.value })}
                  placeholder="Example text"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={3}
                />
                <textarea
                  value={exampleForm.context}
                  onChange={(e) => setExampleForm({ ...exampleForm, context: e.target.value })}
                  placeholder="Context (optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <select
                  value={exampleForm.source_type}
                  onChange={(e) => setExampleForm({ ...exampleForm, source_type: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                >
                  <option value="official">Official</option>
                  <option value="community">Community</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveExample}
                    className="px-4 py-2 bg-bronze text-cream rounded hover:bg-bronze/90 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowExampleForm(false)
                      setEditingExample(null)
                      setExampleForm({ example_text: '', context: '', source_type: 'official' })
                    }}
                    className="px-4 py-2 bg-soft-gray text-charcoal rounded hover:bg-charcoal hover:text-cream text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {usageExamples.map((example) => (
              <div key={example.id} className="bg-cream p-3 rounded border border-soft-gray flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      example.source_type === 'official' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {example.source_type}
                    </span>
                  </div>
                  <p className="text-charcoal">{example.example_text}</p>
                  {example.context && <p className="text-sm text-charcoal-light mt-1">{example.context}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingExample(example.id)
                      setExampleForm({
                        example_text: example.example_text,
                        context: example.context || '',
                        source_type: example.source_type,
                      })
                      setShowExampleForm(true)
                    }}
                    className="px-3 py-1 bg-bronze text-cream rounded text-xs hover:bg-bronze/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('example', example.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {usageExamples.length === 0 && !showExampleForm && (
              <p className="text-charcoal-light text-sm">No usage examples added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-charcoal">Timeline ({timeline.length})</h3>
            <button
              onClick={() => {
                setShowTimelineForm(true)
                setEditingTimeline(null)
                setTimelineForm({ time_period_start: '', time_period_end: '', popularity_level: 'common', primary_location: '', geographic_changes: '', notes: '', sources: '' })
              }}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
            >
              Add Timeline Entry
            </button>
          </div>

          {showTimelineForm && (
            <div className="bg-cream p-4 rounded-lg border border-soft-gray mb-4">
              <h4 className="font-semibold text-charcoal mb-2">{editingTimeline ? 'Edit' : 'Add'} Timeline Entry</h4>
              <div className="space-y-2">
                <input
                  type="date"
                  value={timelineForm.time_period_start}
                  onChange={(e) => setTimelineForm({ ...timelineForm, time_period_start: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                />
                <input
                  type="date"
                  value={timelineForm.time_period_end}
                  onChange={(e) => setTimelineForm({ ...timelineForm, time_period_end: e.target.value })}
                  placeholder="End date (optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                />
                <select
                  value={timelineForm.popularity_level}
                  onChange={(e) => setTimelineForm({ ...timelineForm, popularity_level: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                >
                  <option value="rare">Rare</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="common">Common</option>
                  <option value="very_common">Very Common</option>
                  <option value="ubiquitous">Ubiquitous</option>
                </select>
                <input
                  type="text"
                  value={timelineForm.primary_location}
                  onChange={(e) => setTimelineForm({ ...timelineForm, primary_location: e.target.value })}
                  placeholder="Primary Location (e.g., United States, New England, British Isles)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                />
                <textarea
                  value={timelineForm.geographic_changes}
                  onChange={(e) => setTimelineForm({ ...timelineForm, geographic_changes: e.target.value })}
                  placeholder="Geographic Changes (e.g., Spread from England to American colonies, Became popular in urban areas)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <textarea
                  value={timelineForm.notes}
                  onChange={(e) => setTimelineForm({ ...timelineForm, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                  rows={2}
                />
                <input
                  type="text"
                  value={timelineForm.sources}
                  onChange={(e) => setTimelineForm({ ...timelineForm, sources: e.target.value })}
                  placeholder="Sources (comma-separated, optional)"
                  className="w-full px-3 py-2 rounded border border-soft-gray"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTimeline}
                    className="px-4 py-2 bg-bronze text-cream rounded hover:bg-bronze/90 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowTimelineForm(false)
                      setEditingTimeline(null)
                      setTimelineForm({ time_period_start: '', time_period_end: '', popularity_level: 'common', primary_location: '', geographic_changes: '', notes: '', sources: '' })
                    }}
                    className="px-4 py-2 bg-soft-gray text-charcoal rounded hover:bg-charcoal hover:text-cream text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {timeline.map((entry) => (
              <div key={entry.id} className="bg-cream p-3 rounded border border-soft-gray flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-charcoal">
                      {new Date(entry.time_period_start).getFullYear()}
                      {entry.time_period_end && ` - ${new Date(entry.time_period_end).getFullYear()}`}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      entry.popularity_level === 'ubiquitous' ? 'bg-green-100 text-green-800' :
                      entry.popularity_level === 'very_common' ? 'bg-blue-100 text-blue-800' :
                      entry.popularity_level === 'common' ? 'bg-yellow-100 text-yellow-800' :
                      entry.popularity_level === 'uncommon' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.popularity_level.replace('_', ' ')}
                    </span>
                  </div>
                  {entry.notes && <p className="text-sm text-charcoal-light">{entry.notes}</p>}
                  {entry.sources && entry.sources.length > 0 && (
                    <p className="text-xs text-charcoal-light mt-1">Sources: {entry.sources.join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingTimeline(entry.id)
                      setTimelineForm({
                        time_period_start: entry.time_period_start,
                        time_period_end: entry.time_period_end || '',
                        popularity_level: entry.popularity_level,
                        primary_location: entry.primary_location || '',
                        geographic_changes: entry.geographic_changes || '',
                        notes: entry.notes || '',
                        sources: entry.sources ? entry.sources.join(', ') : '',
                      })
                      setShowTimelineForm(true)
                    }}
                    className="px-3 py-1 bg-bronze text-cream rounded text-xs hover:bg-bronze/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('timeline', entry.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {timeline.length === 0 && !showTimelineForm && (
              <p className="text-charcoal-light text-sm">No timeline entries added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


