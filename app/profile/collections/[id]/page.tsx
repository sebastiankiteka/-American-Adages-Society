'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Collection {
  id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
}

interface CollectionItem {
  id: string
  adage_id: string
  date_added: string
  notes?: string
  adage: {
    id: string
    adage: string
    definition: string
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function CollectionDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const collectionId = params.id as string
  const [collection, setCollection] = useState<Collection | null>(null)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchCollection = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/collections/${collectionId}`)
        const result: ApiResponse<Collection> = await response.json()

        if (result.success && result.data) {
          setCollection(result.data)
        } else {
          setError(result.error || 'Collection not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load collection')
      } finally {
        setLoading(false)
      }
    }

    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/collections/${collectionId}/items`)
        const result: ApiResponse<CollectionItem[]> = await response.json()

        if (result.success && result.data) {
          setItems(result.data)
        }
      } catch (err: any) {
        console.error('Failed to load collection items:', err)
      }
    }

    if (collectionId) {
      fetchCollection()
      fetchItems()
    }
  }, [session, status, router, collectionId])

  useEffect(() => {
    if (showAddModal && searchQuery.trim()) {
      const debounce = setTimeout(() => {
        handleSearchAdages()
      }, 500)
      return () => clearTimeout(debounce)
    } else if (showAddModal && !searchQuery.trim()) {
      setSearchResults([])
    }
  }, [searchQuery, showAddModal])

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this adage from the collection?')) {
      return
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setItems(items.filter(item => item.id !== itemId))
      } else {
        alert(result.error || 'Failed to remove adage')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove adage')
    }
  }

  const handleSearchAdages = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/adages?search=${encodeURIComponent(searchQuery)}&limit=10`)
      const result: ApiResponse = await response.json()

      if (result.success && result.data) {
        // Filter out adages already in collection
        const existingIds = new Set(items.map(item => item.adage_id))
        setSearchResults(result.data.filter((a: any) => !existingIds.has(a.id)))
      }
    } catch (err) {
      console.error('Failed to search adages:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleAddAdage = async (adageId: string) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adage_id: adageId }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        fetchItems()
        setShowAddModal(false)
        setSearchQuery('')
        setSearchResults([])
      } else {
        alert(result.error || 'Failed to add adage')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add adage')
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/collections/${collectionId}/items`)
      const result: ApiResponse<CollectionItem[]> = await response.json()

      if (result.success && result.data) {
        setItems(result.data)
      }
    } catch (err: any) {
      console.error('Failed to load collection items:', err)
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

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-error-bg border border-error-text/30 text-error-text p-6 rounded-lg text-center">
            <p className="text-lg font-semibold mb-2">Collection Not Found</p>
            <p className="mb-4">{error || 'The collection you are looking for does not exist or you do not have permission to view it.'}</p>
            <Link
              href="/profile/collections"
              className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Back to Collections
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-text-primary">{collection.name}</h1>
            {collection.description && (
              <p className="text-text-secondary mt-2">{collection.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              {collection.is_public && (
                <span className="px-3 py-1 bg-success-bg text-success-text rounded-full text-sm border border-success-text/30">
                  Public
                </span>
              )}
              <span className="text-sm text-text-metadata">
                {items.length} adage{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Add Adage
            </button>
            <button
              onClick={() => router.push('/profile/collections')}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
            >
              Back to Collections
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-lg text-text-secondary mb-4">This collection is empty.</p>
            <Link
              href="/archive"
              className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Browse Archive
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      href={`/archive/${item.adage_id}`}
                      className="block group"
                    >
                      <h3 className="text-2xl font-bold font-serif text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                        "{item.adage.adage}"
                      </h3>
                      <p className="text-text-secondary mb-3">{item.adage.definition}</p>
                    </Link>
                    {item.notes && (
                      <p className="text-sm text-text-metadata italic mb-2">Note: {item.notes}</p>
                    )}
                    <p className="text-sm text-text-metadata">
                      Added on {new Date(item.date_added).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-4 px-3 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Adage Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-card-bg rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col border border-border-medium" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold font-serif mb-4 text-text-primary">Add Adage to Collection</h3>
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search adages..."
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {searching ? (
                  <p className="text-text-secondary text-center py-8">Searching...</p>
                ) : searchResults.length === 0 && searchQuery.trim() ? (
                  <p className="text-text-secondary text-center py-8">No adages found</p>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((adage) => (
                      <button
                        key={adage.id}
                        onClick={() => handleAddAdage(adage.id)}
                        className="w-full text-left p-4 bg-card-bg-muted hover:bg-card-bg rounded-lg transition-colors border border-border-medium"
                      >
                        <h4 className="font-semibold text-text-primary">"{adage.adage}"</h4>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{adage.definition}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-8">Start typing to search for adages</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="mt-4 w-full px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

