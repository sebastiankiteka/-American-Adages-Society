'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Citation {
  id: string
  adage_id: string
  source_text: string
  source_url?: string
  source_type?: 'academic' | 'historical' | 'literary' | 'other'
  verified: boolean
  created_at: string
  normalizedSourceUrl?: string | null // Pre-normalized URL, computed during fetch
  adage?: {
    id: string
    adage: string
  }
  submitted_by_user?: {
    username?: string
    display_name?: string
  }
}

interface ReaderChallenge {
  id: string
  target_type: 'adage' | 'blog' | 'comment'
  target_id: string
  challenge_reason: string
  suggested_correction?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: string
  target?: {
    id: string
    adage?: string
    title?: string
    content?: string
  }
  challenger?: {
    username?: string
    display_name?: string
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Helper function to normalize citation source URLs
function normalizeSourceUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()
  if (trimmed === '') {
    return null
  }

  // If URL doesn't start with http:// or https://, prepend https://
  let normalized = trimmed
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    normalized = `https://${trimmed}`
  }

  // Validate the URL using the URL constructor
  try {
    new URL(normalized)
    return normalized
  } catch {
    return null
  }
}

// Component to display an adage with its citations in a dropdown
function AdageCitationGroup({ 
  adageId, 
  adagePhrase, 
  citations, 
  adageLink 
}: { 
  adageId: string
  adagePhrase: string
  citations: Citation[]
  adageLink: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium">
      {/* Header: Adage → Citation Count → Dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-card-bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href={adageLink}
            onClick={(e) => e.stopPropagation()}
            className="text-lg font-semibold text-accent-primary hover:underline flex-shrink-0"
          >
            "{adagePhrase}"
          </Link>
          <span className="text-text-metadata">→</span>
          <span className="text-text-primary font-medium">
            {citations.length} {citations.length === 1 ? 'citation' : 'citations'}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-text-metadata transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Content: List of Citations */}
      {isOpen && (
        <div className="border-t border-border-medium p-4 space-y-4">
          {citations.map((citation) => (
            <div
              key={citation.id}
              className="bg-card-bg-muted p-4 rounded-lg border border-border-medium"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-text-primary flex-1">{citation.source_text}</p>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  citation.verified
                    ? 'bg-success-bg text-success-text'
                    : 'bg-warning-bg text-warning-text'
                }`}>
                  {citation.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-text-metadata">
                <div className="flex items-center gap-4">
                  {citation.source_type && (
                    <span className="capitalize">{citation.source_type}</span>
                  )}
                  {citation.submitted_by_user && (
                    <span>
                      by {citation.submitted_by_user.display_name || citation.submitted_by_user.username || 'User'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {citation.normalizedSourceUrl ? (
                    <a
                      href={citation.normalizedSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:underline font-medium flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Source
                    </a>
                  ) : citation.source_url ? (
                    <span className="text-text-metadata text-xs italic">Invalid URL</span>
                  ) : null}
                  <span>{format(new Date(citation.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CitationsPageContent() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'citations' | 'challenges'>('citations')
  const [citations, setCitations] = useState<Citation[]>([])
  const [challenges, setChallenges] = useState<ReaderChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCitationForm, setShowCitationForm] = useState(false)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Citation form state
  const [citationForm, setCitationForm] = useState({
    adage_id: '',
    source_text: '',
    source_url: '',
    source_type: 'academic' as 'academic' | 'historical' | 'literary' | 'other',
  })

  // Challenge form state
  const [challengeForm, setChallengeForm] = useState({
    target_type: 'adage' as 'adage' | 'blog',
    target_id: '',
    challenge_reason: '',
    suggested_correction: '',
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'citations') {
        const response = await fetch('/api/citations')
        const result: ApiResponse<Citation[]> = await response.json()
        if (result.success && result.data) {
          // Normalize URLs when data is fetched, not during render
          const normalizedCitations = result.data.map(citation => ({
            ...citation,
            normalizedSourceUrl: normalizeSourceUrl(citation.source_url)
          }))
          setCitations(normalizedCitations as Citation[])
        } else {
          setError(result.error || 'Failed to load citations')
        }
      } else {
        const response = await fetch('/api/challenges')
        const result: ApiResponse<ReaderChallenge[]> = await response.json()
        if (result.success && result.data) {
          setChallenges(result.data)
        } else {
          setError(result.error || 'Failed to load challenges')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to submit a citation')
      return
    }

    if (!citationForm.adage_id || !citationForm.source_text.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citationForm),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        alert('Citation submitted successfully! It will be reviewed by our team.')
        setCitationForm({
          adage_id: '',
          source_text: '',
          source_url: '',
          source_type: 'academic',
        })
        setShowCitationForm(false)
        fetchData()
        
        // Dispatch event to notify profile page to refresh commendation stats
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { type: 'citation' } }))
      } else {
        alert(result.error || 'Failed to submit citation')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit citation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to submit a challenge')
      return
    }

    if (!challengeForm.target_id || !challengeForm.challenge_reason.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeForm),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        alert('Challenge submitted successfully! It will be reviewed by our team.')
        setChallengeForm({
          target_type: 'adage',
          target_id: '',
          challenge_reason: '',
          suggested_correction: '',
        })
        setShowChallengeForm(false)
        fetchData()
        
        // Dispatch event to notify profile page to refresh commendation stats
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { type: 'challenge' } }))
      } else {
        alert(result.error || 'Failed to submit challenge')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit challenge')
    } finally {
      setSubmitting(false)
    }
  }

  // Group citations by adage_id - deterministic, no client-only logic
  const groupedByAdage = useMemo(() => {
    if (citations.length === 0) {
      return []
    }
    
    const groups = new Map<string, { adage: Citation['adage']; citations: Citation[] }>()
    
    citations.forEach((citation) => {
      const adageId = citation.adage_id || 'unknown'
      
      if (!groups.has(adageId)) {
        groups.set(adageId, {
          adage: citation.adage,
          citations: []
        })
      }
      
      groups.get(adageId)!.citations.push(citation)
    })
    
    return Array.from(groups.entries()).map(([adageId, data]) => ({
      adageId,
      adagePhrase: data.adage?.adage || 'Unknown Adage',
      adageLink: data.adage?.id ? `/archive/${data.adage.id}` : '#',
      citations: data.citations
    }))
  }, [citations])

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-text-primary mb-8">
          Citations & Reader Challenges
        </h1>

        <p className="text-lg text-text-primary mb-8">
          Help us improve the accuracy and completeness of our archive by submitting academic sources, 
          historical references, or flagging potential inaccuracies. All submissions are reviewed by our team.
        </p>

        {/* How Challenges Work */}
        <div className="bg-card-bg p-6 rounded-lg border border-border-medium mb-8">
          <h2 className="text-xl font-bold font-serif text-text-primary mb-3">How Challenges Work</h2>
          <p className="text-text-primary mb-4">
            <strong>Reader Challenges</strong> allow you to flag potential inaccuracies or suggest corrections for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-primary mb-4">
            <li><strong>Adages:</strong> Challenge definitions, origins, or historical context</li>
            <li><strong>Blog Posts:</strong> Flag factual errors or outdated information</li>
          </ul>
          <p className="text-text-primary">
            To submit a challenge, click the "Challenges" tab above, then click "Submit New Challenge". 
            You'll need the ID of the item you're challenging (found in the URL when viewing that item), 
            a reason for the challenge, and optionally a suggested correction.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border-medium">
          <button
            onClick={() => setActiveTab('citations')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'citations'
                ? 'text-bronze border-b-2 border-bronze'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Citations ({citations.length})
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'challenges'
                ? 'text-bronze border-b-2 border-bronze'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Challenges ({challenges.length})
          </button>
        </div>

        {/* Citation Form */}
        {activeTab === 'citations' && showCitationForm && (
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium mb-8">
            <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Submit a Citation</h2>
            <form onSubmit={handleSubmitCitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Adage ID <span className="text-red-600">*</span>
                </label>
                <input
                  id="citation-adage-id"
                  name="citation-adage-id"
                  type="text"
                  value={citationForm.adage_id}
                  onChange={(e) => setCitationForm({ ...citationForm, adage_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                  placeholder="e.g., b365b93c-9a9d-4c5b-8d16-3c06ce1f8fdc"
                  required
                />
                <p className="text-xs text-text-metadata mt-1">
                  Find the adage ID in the URL when viewing an adage: <code className="bg-card-bg-muted px-1 rounded">/archive/[id]</code>
                  <br />
                  Example: If the URL is <code className="bg-card-bg-muted px-1 rounded">/archive/b365b93c-9a9d-4c5b-8d16-3c06ce1f8fdc</code>, 
                  the ID is <code className="bg-card-bg-muted px-1 rounded">b365b93c-9a9d-4c5b-8d16-3c06ce1f8fdc</code>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Source Text <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="citation-source-text"
                  name="citation-source-text"
                  value={citationForm.source_text}
                  onChange={(e) => setCitationForm({ ...citationForm, source_text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                  placeholder="Enter the citation text (e.g., book title, article, etc.)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Source URL</label>
                <input
                  id="citation-source-url"
                  name="citation-source-url"
                  type="url"
                  value={citationForm.source_url}
                  onChange={(e) => setCitationForm({ ...citationForm, source_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Source Type</label>
                <select
                  id="citation-source-type"
                  name="citation-source-type"
                  value={citationForm.source_type}
                  onChange={(e) => setCitationForm({ ...citationForm, source_type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                >
                  <option value="academic">Academic</option>
                  <option value="historical">Historical</option>
                  <option value="literary">Literary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Citation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCitationForm(false)}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Challenge Form */}
        {activeTab === 'challenges' && showChallengeForm && (
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium mb-8">
            <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Submit a Challenge</h2>
            <form onSubmit={handleSubmitChallenge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Target Type</label>
                <select
                  id="challenge-target-type"
                  name="challenge-target-type"
                  value={challengeForm.target_type}
                  onChange={(e) => setChallengeForm({ ...challengeForm, target_type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                >
                  <option value="adage">Adage</option>
                  <option value="blog">Blog Post</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Target ID <span className="text-red-600">*</span>
                </label>
                <input
                  id="challenge-target-id"
                  name="challenge-target-id"
                  type="text"
                  value={challengeForm.target_id}
                  onChange={(e) => setChallengeForm({ ...challengeForm, target_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                  placeholder={
                    challengeForm.target_type === 'adage' 
                      ? 'e.g., b365b93c-9a9d-4c5b-8d16-3c06ce1f8fdc'
                      : 'e.g., 123e4567-e89b-12d3-a456-426614174000'
                  }
                  required
                />
                <p className="text-xs text-charcoal-light mt-1">
                  {challengeForm.target_type === 'adage' && (
                    <>Find the adage ID in the URL when viewing an adage: <code className="bg-soft-gray px-1 rounded">/archive/[id]</code></>
                  )}
                  {challengeForm.target_type === 'blog' && (
                    <>Find the blog post ID in the URL when viewing a post: <code className="bg-soft-gray px-1 rounded">/blog/[id]</code></>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Challenge Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="challenge-reason"
                  name="challenge-reason"
                  value={challengeForm.challenge_reason}
                  onChange={(e) => setChallengeForm({ ...challengeForm, challenge_reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                  placeholder="Explain why you believe this content is inaccurate..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Suggested Correction</label>
                <textarea
                  id="challenge-suggested-correction"
                  name="challenge-suggested-correction"
                  value={challengeForm.suggested_correction}
                  onChange={(e) => setChallengeForm({ ...challengeForm, suggested_correction: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                  placeholder="If you have a suggested correction, enter it here..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Challenge'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChallengeForm(false)}
                  className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        {!showCitationForm && !showChallengeForm && (
          <div className="mb-8">
            {activeTab === 'citations' ? (
              <button
                onClick={() => setShowCitationForm(true)}
                className="px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
              >
                Submit New Citation
              </button>
            ) : (
              <button
                onClick={() => setShowChallengeForm(true)}
                className="px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
              >
                Submit New Challenge
              </button>
            )}
          </div>
        )}

        {/* Citations List */}
        {activeTab === 'citations' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-text-primary">Loading citations...</p>
              </div>
            ) : citations.length === 0 ? (
              <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
                <p className="text-text-primary">No citations submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedByAdage.map((group) => (
                  <AdageCitationGroup
                    key={group.adageId}
                    adageId={group.adageId}
                    adagePhrase={group.adagePhrase}
                    citations={group.citations}
                    adageLink={group.adageLink}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Challenges List */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-text-primary">Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
                <p className="text-text-primary">No challenges submitted yet.</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-card-bg-muted text-text-metadata rounded capitalize">
                          {challenge.target_type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          challenge.status === 'accepted' ? 'bg-success-bg text-success-text' :
                          challenge.status === 'rejected' ? 'bg-error-bg text-error-text' :
                          challenge.status === 'reviewed' ? 'bg-card-bg-muted text-text-primary' :
                          'bg-warning-bg text-warning-text'
                        }`}>
                          {challenge.status}
                        </span>
                      </div>
                      {challenge.target && (
                        <p className="text-sm text-text-secondary mb-2">
                          Target: {challenge.target.adage || challenge.target.title || challenge.target.content?.substring(0, 50)}
                        </p>
                      )}
                      <p className="text-text-primary mb-2">{challenge.challenge_reason}</p>
                      {challenge.suggested_correction && (
                        <div className="bg-card-bg-muted p-3 rounded border border-border-medium mt-2">
                          <p className="text-sm font-semibold text-text-primary mb-1">Suggested Correction:</p>
                          <p className="text-sm text-text-secondary">{challenge.suggested_correction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-metadata">
                    {challenge.challenger && (
                      <span>
                        by {challenge.challenger.display_name || challenge.challenger.username || 'User'}
                      </span>
                    )}
                    <span>{format(new Date(challenge.created_at), 'MMM d, yyyy')}</span>
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

export default function CitationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-text-primary">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <CitationsPageContent />
    </Suspense>
  )
}

