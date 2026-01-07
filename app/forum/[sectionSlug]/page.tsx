'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ForumSection {
  id: string
  title: string
  slug: string
  description?: string
  rules?: string
  locked: boolean
  subsections?: ForumSection[]
}

interface ForumThread {
  id: string
  title: string
  slug: string
  content: string
  pinned: boolean
  locked: boolean
  views_count: number
  replies_count: number
  last_reply_at?: string
  created_at: string
  author: {
    id: string
    username?: string
    display_name?: string
    profile_image_url?: string
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

function ForumSectionContent() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const sectionSlug = params.sectionSlug as string
  const [section, setSection] = useState<ForumSection | null>(null)
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewThreadForm, setShowNewThreadForm] = useState(false)
  const [newThreadTitle, setNewThreadTitle] = useState('')
  const [newThreadContent, setNewThreadContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const sectionResponse = await fetch(`/api/forum/sections/${sectionSlug}`)
        const sectionResult: ApiResponse<ForumSection> = await sectionResponse.json()

        if (sectionResult.success && sectionResult.data) {
          setSection(sectionResult.data)
          
          // Fetch threads for this section
          const threadsResponse = await fetch(`/api/forum/threads?section_id=${sectionResult.data.id}`)
          const threadsResult: ApiResponse<ForumThread[]> = await threadsResponse.json()
          if (threadsResult.success && threadsResult.data) {
            setThreads(threadsResult.data)
          }
        } else {
          setError(sectionResult.error || 'Section not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load section')
      } finally {
        setLoading(false)
      }
    }

    if (sectionSlug) {
      fetchData()
    }
  }, [sectionSlug])

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to create a thread')
      return
    }

    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      alert('Please fill in both title and content')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: section?.id,
          title: newThreadTitle.trim(),
          content: newThreadContent.trim(),
        }),
      })

      const result: ApiResponse<ForumThread> = await response.json()

      if (result.success && result.data) {
        setNewThreadTitle('')
        setNewThreadContent('')
        setShowNewThreadForm(false)
        // Refresh threads
        const threadsResponse = await fetch(`/api/forum/threads?section_id=${section?.id}`)
        const threadsResult: ApiResponse<ForumThread[]> = await threadsResponse.json()
        if (threadsResult.success && threadsResult.data) {
          setThreads(threadsResult.data)
        }
        // Navigate to new thread
        router.push(`/forum/${sectionSlug}/${result.data.slug}`)
      } else {
        alert(result.error || 'Failed to create thread')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create thread')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading section...</p>
      </div>
    )
  }

  if (error || !section) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-text mb-4">{error || 'Section not found'}</p>
          <Link href="/forum" className="text-accent-primary hover:underline">
            Return to Forum
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/forum"
            className="text-accent-primary hover:text-accent-hover mb-4 inline-block"
          >
            ← Back to Forum
          </Link>
        </div>

        <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold font-serif text-text-primary mb-2">
                {section.title}
              </h1>
              {section.description && (
                <p className="text-text-secondary">{section.description}</p>
              )}
            </div>
            {section.locked && (
              <span className="px-3 py-1 bg-error-bg text-error-text rounded-full text-xs font-medium">
                Locked
              </span>
            )}
          </div>

          {section.rules && (
            <details className="mt-4">
              <summary className="text-sm text-accent-primary cursor-pointer hover:underline font-semibold">
                View Section Rules
              </summary>
              <div className="mt-2 p-4 bg-card-bg-muted rounded border border-border-medium text-sm text-text-secondary whitespace-pre-line">
                {section.rules}
              </div>
            </details>
          )}

          {session && !section.locked && (
            <div className="mt-6">
              {!showNewThreadForm ? (
                <button
                  onClick={() => setShowNewThreadForm(true)}
                  className="px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Create New Thread
                </button>
              ) : (
                <form onSubmit={handleCreateThread} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Thread Title
                    </label>
                    <input
                      type="text"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                      placeholder="Enter thread title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Content
                    </label>
                    <textarea
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                      placeholder="Write your post..."
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create Thread'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewThreadForm(false)
                        setNewThreadTitle('')
                        setNewThreadContent('')
                      }}
                      className="px-6 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium">
          <div className="p-6 border-b border-border-medium">
            <h2 className="text-2xl font-bold font-serif text-text-primary">Threads</h2>
          </div>

          {threads.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-text-secondary">No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="divide-y divide-border-medium">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/${sectionSlug}/${thread.slug}`}
                  className="block p-6 hover:bg-card-bg-muted transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {thread.pinned && (
                          <span className="px-2 py-1 bg-accent-primary text-text-inverse rounded text-xs font-medium">
                            Pinned
                          </span>
                        )}
                        {thread.locked && (
                          <span className="px-2 py-1 bg-error-bg text-error-text rounded text-xs">
                            Locked
                          </span>
                        )}
                        <h3 className="text-xl font-bold font-serif text-text-primary group-hover:text-accent-primary transition-colors">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-metadata">
                        <span>
                          by{' '}
                          <Link
                            href={`/profile/${thread.author.id}`}
                            className="text-accent-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {thread.author.display_name || thread.author.username || 'Anonymous'}
                          </Link>
                        </span>
                        <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                        <span>{thread.views_count} views</span>
                        <span>{thread.replies_count} replies</span>
                        {thread.last_reply_at && (
                          <span>
                            Last reply: {new Date(thread.last_reply_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ForumSection() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    }>
      <ForumSectionContent />
    </Suspense>
  )
}



