'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface SavedAdage {
  id: string
  adage_id: string
  adage: {
    id: string
    adage: string
    definition: string
  }
  date_added: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function SavedAdages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedAdages, setSavedAdages] = useState<SavedAdage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchSavedAdages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/saved-adages')
        const result: ApiResponse<SavedAdage[]> = await response.json()

        if (result.success && result.data) {
          setSavedAdages(result.data)
        } else {
          setError(result.error || 'Failed to load saved adages')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load saved adages')
      } finally {
        setLoading(false)
      }
    }

    fetchSavedAdages()
  }, [session, status, router])

  const handleRemove = async (savedAdageId: string) => {
    try {
      const response = await fetch(`/api/users/saved-adages/${savedAdageId}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setSavedAdages(savedAdages.filter(sa => sa.id !== savedAdageId))
      } else {
        alert(result.error || 'Failed to remove adage')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove adage')
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
          <h1 className="text-4xl font-bold font-serif text-text-primary">Saved Adages</h1>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
          >
            Back to Profile
          </button>
        </div>

        {error && (
          <div className="bg-error-bg border border-error-text/30 text-error-text p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {savedAdages.length === 0 ? (
          <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-lg text-text-secondary mb-4">You haven't saved any adages yet.</p>
            <Link
              href="/archive"
              className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Browse Archive
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedAdages.map((saved) => (
              <div
                key={saved.id}
                className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link
                      href={`/archive/${saved.adage_id}`}
                      className="block group"
                    >
                      <h3 className="text-2xl font-bold font-serif text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                        "{saved.adage.adage}"
                      </h3>
                      <p className="text-text-secondary mb-3">{saved.adage.definition}</p>
                    </Link>
                    <p className="text-sm text-text-metadata">
                      Saved on {new Date(saved.date_added).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(saved.id)}
                    className="ml-4 px-3 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



