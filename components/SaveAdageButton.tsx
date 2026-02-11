'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Collection {
  id: string
  name: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface SaveAdageButtonProps {
  adageId: string
  onSaved?: () => void
}

export default function SaveAdageButton({ adageId, onSaved }: SaveAdageButtonProps) {
  const { data: session } = useSession()
  const [collections, setCollections] = useState<Collection[]>([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToCollection, setSavedToCollection] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (session) {
      fetchCollections()
      checkIfSaved()
    }
  }, [session, adageId])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const result: ApiResponse<Collection[]> = await response.json()
      if (result.success && result.data) {
        setCollections(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    }
  }

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/users/saved-adages`)
      const result: ApiResponse = await response.json()
      if (result.success && result.data) {
        const saved = result.data.some((item: any) => item.adage_id === adageId)
        setIsSaved(saved)
      }
    } catch (err) {
      console.error('Failed to check saved status:', err)
    }
  }

  const handleSaveToCollection = async (collectionId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adage_id: adageId }),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        setSavedToCollection(collectionId)
        setShowModal(false)
        if (onSaved) onSaved()
        setTimeout(() => setSavedToCollection(null), 3000)
      } else {
        alert(result.error || 'Failed to save to collection')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save to collection')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveToSavedAdages = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/users/saved-adages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adage_id: adageId }),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        setIsSaved(true)
        if (onSaved) onSaved()
      } else {
        alert(result.error || 'Failed to save adage')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save adage')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return (
      <div className="text-sm text-charcoal-light">
        <a href="/login" className="text-bronze hover:underline">
          Log in to save this adage
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-2 items-center">
        {isSaved ? (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
            ✓ Saved
          </span>
        ) : (
          <button
            onClick={handleSaveToSavedAdages}
            disabled={saving}
            className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Adage'}
          </button>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors text-sm"
        >
          Add to Collection
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold font-serif mb-4 text-charcoal">Add to Collection</h3>
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-charcoal-light mb-4">You don't have any collections yet.</p>
                <a
                  href="/profile/collections"
                  className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
                >
                  Create Collection
                </a>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleSaveToCollection(collection.id)}
                    disabled={saving || savedToCollection === collection.id}
                    className="w-full text-left px-4 py-3 bg-cream hover:bg-soft-gray rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savedToCollection === collection.id ? '✓ Added!' : collection.name}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}















