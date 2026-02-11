'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

interface DraftData {
  adage: {
    id: string
    adage: string
    definition: string
    origin?: string
    featured_reason?: string
    featured_from?: string
    featured_until?: string
  }
  draft_html: string
  subject: string
  recipient_count: number
  featured_date_range?: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function SendWeeklyEmail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [draft, setDraft] = useState<DraftData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchDraft = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/mailing-list/draft-weekly')
        const result: ApiResponse<DraftData> = await response.json()

        if (result.success && result.data) {
          setDraft(result.data)
        } else {
          setError(result.error || 'Failed to load draft')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load draft')
      } finally {
        setLoading(false)
      }
    }

    fetchDraft()
  }, [session, status])

  const handleSend = async () => {
    if (!confirm(`Are you sure you want to send this email to ${draft?.recipient_count || 0} recipients?`)) {
      return
    }

    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/mailing-list/send-weekly', {
        method: 'POST',
      })
      const result: ApiResponse = await response.json()

      if (result.success) {
        alert(`Email sent successfully! ${result.data?.sent || 0} recipients notified.`)
        router.push('/admin/mailing-list')
      } else {
        setError(result.error || 'Failed to send email')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setSending(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
        <p className="text-charcoal">Loading draft...</p>
      </div>
    )
  }

  if (error && !draft) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <button
            onClick={() => router.push('/admin/mailing-list')}
            className="mt-4 px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
          >
            Back to Mailing List
          </button>
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray text-center">
            <p className="text-charcoal-light mb-4">No featured adage found. Please feature an adage first.</p>
            <button
              onClick={() => router.push('/admin/adages')}
              className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Go to Adages
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-charcoal">Send Weekly Email</h1>
            <p className="text-charcoal-light mt-2">
              Preview and send the weekly featured adage to {draft.recipient_count} subscribers
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/mailing-list')}
            className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
          >
            Back to Mailing List
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden mb-6">
          <div className="p-6 border-b border-soft-gray">
            <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">Email Details</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-charcoal-light">Subject:</span>
                <p className="text-charcoal font-semibold">{draft.subject}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-charcoal-light">Recipients:</span>
                <p className="text-charcoal font-semibold">{draft.recipient_count} subscribers</p>
              </div>
              {draft.featured_date_range && (
                <div>
                  <span className="text-sm font-medium text-charcoal-light">Featured Period:</span>
                  <p className="text-charcoal font-semibold">{draft.featured_date_range}</p>
                </div>
              )}
              {draft.adage.featured_reason && (
                <div>
                  <span className="text-sm font-medium text-charcoal-light">Reason:</span>
                  <p className="text-charcoal font-semibold italic">{draft.adage.featured_reason}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-serif text-charcoal">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('html')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    previewMode === 'html'
                      ? 'bg-bronze text-cream'
                      : 'bg-soft-gray text-charcoal hover:bg-charcoal hover:text-cream'
                  }`}
                >
                  HTML Preview
                </button>
                <button
                  onClick={() => setPreviewMode('text')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    previewMode === 'text'
                      ? 'bg-bronze text-cream'
                      : 'bg-soft-gray text-charcoal hover:bg-charcoal hover:text-cream'
                  }`}
                >
                  HTML Source
                </button>
              </div>
            </div>

            {previewMode === 'html' ? (
              <div className="border border-soft-gray rounded-lg overflow-hidden">
                <iframe
                  srcDoc={draft.draft_html}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                />
              </div>
            ) : (
              <div className="border border-soft-gray rounded-lg p-4 bg-cream">
                <pre className="text-xs text-charcoal overflow-auto max-h-[600px] whitespace-pre-wrap">
                  {draft.draft_html}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => router.push('/admin/mailing-list')}
            className="px-6 py-3 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : `Send to ${draft.recipient_count} Subscribers`}
          </button>
        </div>
      </div>
    </div>
  )
}














