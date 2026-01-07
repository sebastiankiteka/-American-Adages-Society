'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Citation, ReaderChallenge } from '@/lib/db-types'
import { format } from 'date-fns'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function AdminCitations() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'citations' | 'challenges'>('citations')
  const [citations, setCitations] = useState<Citation[]>([])
  const [challenges, setChallenges] = useState<ReaderChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCitation, setEditingCitation] = useState<string | null>(null)
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null)
  const [pendingCounts, setPendingCounts] = useState({ citations: 0, challenges: 0 })
  const [notificationRead, setNotificationRead] = useState({ citations: false, challenges: false })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return
    fetchData()
    fetchPendingCounts()
    // Check if notifications were already read
    const citationsRead = localStorage.getItem('admin_citations_read') === 'true'
    const challengesRead = localStorage.getItem('admin_challenges_read') === 'true'
    setNotificationRead({ citations: citationsRead, challenges: challengesRead })
  }, [session, status, activeTab])

  const fetchPendingCounts = async () => {
    try {
      const response = await fetch('/api/admin/counts')
      const result: ApiResponse<{ citations: number; challenges: number }> = await response.json()
      if (result.success && result.data) {
        setPendingCounts({
          citations: result.data.citations || 0,
          challenges: result.data.challenges || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch pending counts:', err)
    }
  }

  const markNotificationAsRead = async (panel: 'citations' | 'challenges') => {
    try {
      await fetch('/api/admin/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel }),
      })
      localStorage.setItem(`admin_${panel}_read`, 'true')
      setNotificationRead(prev => ({ ...prev, [panel]: true }))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [citationsRes, challengesRes] = await Promise.all([
        fetch('/api/citations'),
        fetch('/api/challenges'),
      ])

      const citationsResult: ApiResponse<Citation[]> = await citationsRes.json()
      const challengesResult: ApiResponse<ReaderChallenge[]> = await challengesRes.json()

      if (citationsResult.success && citationsResult.data) {
        setCitations(citationsResult.data)
      } else {
        setError(citationsResult.error || 'Failed to load citations')
      }

      if (challengesResult.success && challengesResult.data) {
        setChallenges(challengesResult.data)
      } else {
        setError(challengesResult.error || 'Failed to load challenges')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCitation = async (id: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/citations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        fetchData()
      } else {
        alert(result.error || 'Failed to update citation')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update citation')
    }
  }

  const handleUpdateChallengeStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        fetchData()
      } else {
        alert(result.error || 'Failed to update challenge')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update challenge')
    }
  }

  const handleDeleteCitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this citation?')) return

    try {
      const response = await fetch(`/api/citations/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        fetchData()
      } else {
        alert(result.error || 'Failed to delete citation')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete citation')
    }
  }

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return

    try {
      const response = await fetch(`/api/challenges/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        fetchData()
      } else {
        alert(result.error || 'Failed to delete challenge')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete challenge')
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
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-bronze hover:text-bronze/80 mb-4 inline-block"
          >
            ← Back to Admin Panel
          </Link>
          <h1 className="text-4xl font-bold font-serif text-charcoal">
            Citations & Challenges Management
          </h1>
        </div>

        <div className="flex border-b border-soft-gray mb-8">
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'citations'
                ? 'border-b-2 border-bronze text-bronze'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
            onClick={() => setActiveTab('citations')}
          >
            Citations ({citations.length})
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'challenges'
                ? 'border-b-2 border-bronze text-bronze'
                : 'text-charcoal-light hover:text-charcoal'
            }`}
            onClick={() => setActiveTab('challenges')}
          >
            Challenges ({challenges.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {activeTab === 'citations' && pendingCounts.citations > 0 && !notificationRead.citations && (
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-yellow-800 mb-1">
                Pending Citations ({pendingCounts.citations})
              </h3>
              <p className="text-yellow-700 text-sm">
                There are {pendingCounts.citations} unverified citation(s) that need your attention.
              </p>
            </div>
            <button
              onClick={() => markNotificationAsRead('citations')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Mark as Read
            </button>
          </div>
        )}

        {activeTab === 'challenges' && pendingCounts.challenges > 0 && !notificationRead.challenges && (
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-yellow-800 mb-1">
                Pending Challenges ({pendingCounts.challenges})
              </h3>
              <p className="text-yellow-700 text-sm">
                There are {pendingCounts.challenges} unaddressed challenge(s) that need your attention.
              </p>
            </div>
            <button
              onClick={() => markNotificationAsRead('challenges')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Mark as Read
            </button>
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-charcoal-light">Loading citations...</p>
            ) : citations.length === 0 ? (
              <p className="text-charcoal-light">No citations submitted yet.</p>
            ) : (
              citations.map((citation) => (
                <div key={citation.id} className="bg-white p-6 rounded-lg border border-soft-gray">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          citation.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {citation.verified ? 'Verified' : 'Pending'}
                        </span>
                        <span className="text-xs text-charcoal-light">
                          {format(new Date(citation.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-charcoal font-medium mb-2">{citation.source_text}</p>
                      {citation.source_url && (
                        <a
                          href={citation.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-bronze hover:underline"
                        >
                          View Source →
                        </a>
                      )}
                      <p className="text-sm text-charcoal-light mt-2">
                        Adage ID: <Link href={`/archive/${citation.adage_id}`} className="text-bronze hover:underline">{citation.adage_id}</Link>
                      </p>
                      <p className="text-xs text-charcoal-light mt-1">
                        Type: {citation.source_type || 'academic'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {!citation.verified ? (
                        <button
                          onClick={() => handleVerifyCitation(citation.id, true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Verify
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyCitation(citation.id, false)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                        >
                          Unverify
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCitation(citation.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-charcoal-light">Loading challenges...</p>
            ) : challenges.length === 0 ? (
              <p className="text-charcoal-light">No challenges submitted yet.</p>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white p-6 rounded-lg border border-soft-gray">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          challenge.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          challenge.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                        </span>
                        <span className="text-xs text-charcoal-light">
                          {format(new Date(challenge.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-charcoal font-medium mb-2">Reason: {challenge.challenge_reason}</p>
                      {challenge.suggested_correction && (
                        <p className="text-sm text-charcoal-light mb-2">
                          Suggested: {challenge.suggested_correction}
                        </p>
                      )}
                      <p className="text-sm text-charcoal-light">
                        Target: {challenge.target_type.charAt(0).toUpperCase() + challenge.target_type.slice(1)} | 
                        ID: <Link href={`/${challenge.target_type === 'adage' ? 'archive' : challenge.target_type === 'blog' ? 'blog' : 'comment'}/${challenge.target_id}`} className="text-bronze hover:underline">{challenge.target_id}</Link>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {challenge.status !== 'accepted' && (
                        <button
                          onClick={() => handleUpdateChallengeStatus(challenge.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Accept
                        </button>
                      )}
                      {challenge.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateChallengeStatus(challenge.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Reject
                        </button>
                      )}
                      {challenge.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateChallengeStatus(challenge.id, 'pending')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                        >
                          Reset to Pending
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

