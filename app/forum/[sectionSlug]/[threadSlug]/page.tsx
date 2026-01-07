'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ForumThread {
  id: string
  title: string
  slug: string
  content: string
  pinned: boolean
  locked: boolean
  frozen: boolean
  views_count: number
  replies_count: number
  created_at: string
  author: {
    id: string
    username?: string
    display_name?: string
    profile_image_url?: string
  }
  section: {
    id: string
    title: string
    slug: string
  }
  replies?: ForumReply[]
}

interface ForumReply {
  id: string
  content: string
  parent_reply_id?: string
  created_at: string
  updated_at: string
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

function ForumThreadContent() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const sectionSlug = params.sectionSlug as string
  const threadSlug = params.threadSlug as string
  const [thread, setThread] = useState<ForumThread | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newReply, setNewReply] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingReply, setEditingReply] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [deletingReply, setDeletingReply] = useState<string | null>(null)
  const [reportingReply, setReportingReply] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/forum/threads/${threadSlug}?section=${sectionSlug}`)
        const result: ApiResponse<ForumThread> = await response.json()

        if (result.success && result.data) {
          setThread(result.data)
        } else {
          setError(result.error || 'Thread not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load thread')
      } finally {
        setLoading(false)
      }
    }

    if (threadSlug && sectionSlug) {
      fetchThread()
    }
  }, [threadSlug, sectionSlug])

  const handleReply = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to reply')
      return
    }

    const content = parentId ? newReply : newReply
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: thread?.id,
          content: content.trim(),
          parent_reply_id: parentId,
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setNewReply('')
        setReplyingTo(null)
        // Refresh thread
        const threadResponse = await fetch(`/api/forum/threads/${threadSlug}?section=${sectionSlug}`)
        const threadResult: ApiResponse<ForumThread> = await threadResponse.json()
        if (threadResult.success && threadResult.data) {
          setThread(threadResult.data)
        }
      } else {
        alert(result.error || 'Failed to post reply')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (reply: ForumReply) => {
    setEditingReply(reply.id)
    setEditText(reply.content)
  }

  const handleCancelEdit = () => {
    setEditingReply(null)
    setEditText('')
  }

  const handleSaveEdit = async (replyId: string) => {
    if (!editText.trim()) {
      alert('Reply cannot be empty')
      return
    }

    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editText.trim(),
        }),
      })

      const result: ApiResponse<ForumReply> = await response.json()
      if (result.success && result.data) {
        // Refresh thread
        const threadResponse = await fetch(`/api/forum/threads/${threadSlug}?section=${sectionSlug}`)
        const threadResult: ApiResponse<ForumThread> = await threadResponse.json()
        if (threadResult.success && threadResult.data) {
          setThread(threadResult.data)
        }
        setEditingReply(null)
        setEditText('')
      } else {
        alert(result.error || 'Failed to update reply')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update reply')
    }
  }

  const handleDelete = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return
    }

    setDeletingReply(replyId)
    try {
      const response = await fetch(`/api/forum/replies/${replyId}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        // Refresh thread
        const threadResponse = await fetch(`/api/forum/threads/${threadSlug}?section=${sectionSlug}`)
        const threadResult: ApiResponse<ForumThread> = await threadResponse.json()
        if (threadResult.success && threadResult.data) {
          setThread(threadResult.data)
        }
      } else {
        alert(result.error || 'Failed to delete reply')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete reply')
    } finally {
      setDeletingReply(null)
    }
  }

  const handleReport = async (replyId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to report replies')
      return
    }

    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting this reply')
      return
    }

    try {
      const response = await fetch('/api/forum/replies/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_id: replyId,
          reason: reportReason.trim(),
        }),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        alert('Reply reported successfully. Our team will review it.')
        setReportingReply(null)
        setReportReason('')
      } else {
        alert(result.error || 'Failed to report reply')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to report reply')
    }
  }

  const renderReply = (reply: ForumReply, depth = 0) => {
    const childReplies = thread?.replies?.filter(r => r.parent_reply_id === reply.id) || []
    const maxDepth = 3
    const isAuthor = session && reply.author.id === (session.user as any)?.id
    const canEdit = isAuthor && !thread?.locked && !thread?.frozen

    return (
      <div key={reply.id} className={depth > 0 ? 'ml-8 mt-4' : ''}>
        <div className="bg-card-bg p-4 rounded-lg border border-border-medium">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {reply.author.profile_image_url ? (
                <img
                  src={reply.author.profile_image_url}
                  alt={reply.author.display_name || reply.author.username || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center font-semibold text-sm">
                  {(reply.author.display_name || reply.author.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <Link
                  href={`/profile/${reply.author.id}`}
                  className="font-semibold text-text-primary hover:text-accent-primary"
                >
                  {reply.author.display_name || reply.author.username || 'Anonymous'}
                </Link>
                <p className="text-xs text-text-metadata">
                  {new Date(reply.created_at).toLocaleString()}
                  {reply.updated_at !== reply.created_at && (
                    <span className="ml-2 italic">(edited)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {editingReply === reply.id ? (
            <div className="mb-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                placeholder="Edit your reply..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSaveEdit(reply.id)}
                  className="px-3 py-1 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-text-primary whitespace-pre-line mb-3">{reply.content}</p>
          )}

          <div className="flex items-center gap-3 text-sm">
            {session && !thread?.locked && !thread?.frozen && depth < maxDepth && (
              <button
                onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                className="text-accent-primary hover:underline"
              >
                Reply
              </button>
            )}
            {session && !isAuthor && (
              <button
                onClick={() => setReportingReply(reportingReply === reply.id ? null : reply.id)}
                className="text-error-text hover:underline"
              >
                {reportingReply === reply.id ? 'Cancel' : 'Report'}
              </button>
            )}
            {canEdit && editingReply !== reply.id && (
              <>
                <button
                  onClick={() => handleStartEdit(reply)}
                  className="text-accent-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(reply.id)}
                  disabled={deletingReply === reply.id}
                  className="text-error-text hover:underline disabled:opacity-50"
                >
                  {deletingReply === reply.id ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>

          {reportingReply === reply.id && (
            <form onSubmit={(e) => handleReport(reply.id, e)} className="mt-3 p-3 bg-error-bg border border-error-text/30 rounded-lg">
              <label htmlFor={`report-reason-${reply.id}`} className="block text-sm font-medium text-text-primary mb-2">
                Reason for reporting this reply:
              </label>
              <textarea
                id={`report-reason-${reply.id}`}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-error-text/50 focus:border-error-text focus:outline-none focus:ring-2 focus:ring-error-text/20 bg-card-bg text-text-primary text-sm"
                placeholder="Please explain why you're reporting this reply..."
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-error-text text-text-inverse rounded-lg hover:opacity-90 transition-colors text-sm"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportingReply(null)
                    setReportReason('')
                  }}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {replyingTo === reply.id && (
            <form onSubmit={(e) => handleReply(e, reply.id)} className="mt-3">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newReply.trim()}
                  className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null)
                    setNewReply('')
                  }}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        {childReplies.length > 0 && (
          <div className="mt-2">
            {childReplies.map(childReply => renderReply(childReply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading thread...</p>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-text mb-4">{error || 'Thread not found'}</p>
          <Link href={`/forum/${sectionSlug}`} className="text-accent-primary hover:underline">
            Return to Section
          </Link>
        </div>
      </div>
    )
  }

  const topLevelReplies = thread.replies?.filter(r => !r.parent_reply_id) || []

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/forum/${sectionSlug}`}
            className="text-accent-primary hover:text-accent-hover mb-4 inline-block"
          >
            ← Back to {thread.section.title}
          </Link>
        </div>

        {/* Thread */}
        <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium mb-6">
          <div className="flex justify-between items-start mb-4">
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
                {thread.frozen && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                    Frozen
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold font-serif text-text-primary mb-4">
                {thread.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm text-text-metadata">
            <div className="flex items-center gap-2">
              {thread.author.profile_image_url ? (
                <img
                  src={thread.author.profile_image_url}
                  alt={thread.author.display_name || thread.author.username || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center font-semibold text-sm">
                  {(thread.author.display_name || thread.author.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <Link
                href={`/profile/${thread.author.id}`}
                className="text-accent-primary hover:underline"
              >
                {thread.author.display_name || thread.author.username || 'Anonymous'}
              </Link>
            </div>
            <span>{new Date(thread.created_at).toLocaleString()}</span>
            <span>{thread.views_count} views</span>
            <span>{thread.replies_count} replies</span>
          </div>

          <div className="prose prose-lg max-w-none text-text-primary whitespace-pre-line mb-6">
            {thread.content}
          </div>
        </div>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
            Replies ({thread.replies_count || 0})
          </h2>

          {topLevelReplies.length === 0 ? (
            <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium text-center">
              <p className="text-text-primary">No replies yet. Be the first to reply!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topLevelReplies.map(reply => renderReply(reply))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {session && !thread.locked && !thread.frozen ? (
          <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
            <h3 className="text-xl font-bold font-serif text-text-primary mb-4">Post a Reply</h3>
            <form onSubmit={(e) => handleReply(e)}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary mb-4"
                placeholder="Write your reply..."
                required
              />
              <button
                type="submit"
                disabled={submitting || !newReply.trim()}
                className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        ) : !session ? (
          <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-text-secondary mb-4">
              <Link href="/login" className="text-accent-primary hover:underline">Log in</Link> to reply
            </p>
          </div>
        ) : (
          <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-text-primary">This thread is locked or frozen.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ForumThread() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    }>
      <ForumThreadContent />
    </Suspense>
  )
}


