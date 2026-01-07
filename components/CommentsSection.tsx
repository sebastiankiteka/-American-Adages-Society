'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  user_id: string
  user?: {
    username: string
    display_name: string
    profile_image_url?: string
  }
  parent_id?: string
  is_commendation: boolean
  created_at: string
  updated_at: string
  hidden_at?: string
  deleted_at?: string
  score?: number
  user_vote?: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface CommentsSectionProps {
  targetType: 'adage' | 'blog' | 'forum' | 'user'
  targetId: string
}

export default function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reportingComment, setReportingComment] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({})
  const [deletingComment, setDeletingComment] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [targetId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      // Add timestamp to prevent caching
      const response = await fetch(`/api/comments?target_type=${targetType}&target_id=${targetId}&_t=${Date.now()}`)
      const result: ApiResponse<Comment[]> = await response.json()

      if (result.success && result.data) {
        setComments(result.data)
      } else {
        console.error('Failed to fetch comments:', result.error)
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to comment')
      return
    }

    const text = parentId ? replyText : newComment
    if (!text.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          content: text.trim(),
          parent_id: parentId,
        }),
      })

      const result: ApiResponse<Comment> = await response.json()

      if (result.success) {
        if (parentId) {
          setReplyText('')
          setReplyingTo(null)
        } else {
          setNewComment('')
        }
        fetchComments()
        
        // Dispatch event to notify profile page to refresh commendation stats
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { type: 'comment' } }))
      } else {
        alert(result.error || 'Failed to post comment')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (commentId: string, value: number) => {
    if (!session) {
      alert('Please log in to vote')
      return
    }

    try {
      const response = await fetch(`/api/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'comment',
          target_id: commentId,
          value,
        }),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        // Immediately update the comment score in the UI for better UX
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              // Optimistically update the score
              const currentScore = comment.score || 0
              const currentUserVote = comment.user_vote || 0
              
              let newScore = currentScore
              let newUserVote = value
              
              // Calculate new score based on vote change
              if (currentUserVote === 0) {
                // No previous vote, add new vote
                newScore = currentScore + value
              } else if (currentUserVote === value) {
                // Same vote clicked, remove it
                newScore = currentScore - value
                newUserVote = 0
              } else {
                // Different vote, change from old to new
                newScore = currentScore - currentUserVote + value
              }
              
              return {
                ...comment,
                score: newScore,
                user_vote: newUserVote === 0 ? undefined : newUserVote,
              }
            }
            return comment
          })
        )
        
        // Then refresh from server to get accurate counts
        setTimeout(() => {
          fetchComments()
        }, 500)
        
        // Dispatch event to notify profile page to refresh stats
        window.dispatchEvent(new CustomEvent('vote-cast'))
      } else {
        alert(result.error || 'Failed to record vote')
        console.error('Vote error:', result.error)
      }
    } catch (err: any) {
      console.error('Failed to vote:', err)
      alert(err.message || 'An error occurred while voting')
    }
  }

  const handleReport = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      alert('Please log in to report comments')
      return
    }

    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting this comment')
      return
    }

    try {
      const response = await fetch('/api/comments/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment_id: commentId,
          reason: reportReason.trim(),
        }),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        alert('Comment reported successfully. Our team will review it.')
        setReportingComment(null)
        setReportReason('')
      } else {
        alert(result.error || 'Failed to report comment')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to report comment')
    }
  }

  const handleStartEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditText(comment.content)
    setOriginalContent(prev => ({ ...prev, [comment.id]: comment.content }))
  }

  const handleCancelEdit = (commentId: string) => {
    setEditingComment(null)
    setEditText('')
    // Restore original content if it exists
    if (originalContent[commentId]) {
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === commentId ? { ...c, content: originalContent[commentId] } : c
        )
      )
    }
    delete originalContent[commentId]
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) {
      alert('Comment cannot be empty')
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editText.trim(),
        }),
      })

      const result: ApiResponse<Comment> = await response.json()
      if (result.success) {
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId ? { ...c, content: editText.trim(), updated_at: new Date().toISOString() } : c
          )
        )
        setEditingComment(null)
        setEditText('')
        delete originalContent[commentId]
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { type: 'comment' } }))
      } else {
        alert(result.error || 'Failed to update comment')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update comment')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? You can restore it later if needed.')) {
      return
    }

    setDeletingComment(commentId)
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        // Soft delete - remove from UI but keep in state for potential restore
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId ? { ...c, deleted_at: new Date().toISOString() } : c
          )
        )
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { type: 'comment' } }))
      } else {
        alert(result.error || 'Failed to delete comment')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment')
    } finally {
      setDeletingComment(null)
    }
  }

  const handleRestore = async (commentId: string) => {
    try {
      // Restore by setting deleted_at to null
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleted_at: null,
        }),
      })

      const result: ApiResponse<Comment> = await response.json()
      if (result.success) {
        // Refresh comments to get the restored comment
        fetchComments()
        window.dispatchEvent(new CustomEvent('stats-update', { detail: { type: 'comment' } }))
      } else {
        alert(result.error || 'Failed to restore comment')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore comment')
    }
  }

  const renderComment = (comment: Comment, depth = 0) => {
    const replies = comments.filter(c => c.parent_id === comment.id)
    const maxDepth = 3

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
        <div className={`bg-card-bg p-4 rounded-lg border ${comment.is_commendation ? 'border-accent-primary border-2' : 'border-border-medium'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {comment.user?.profile_image_url ? (
                <img
                  src={comment.user.profile_image_url}
                  alt={comment.user.display_name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center font-semibold">
                  {(comment.user?.display_name || comment.user?.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <Link
                  href={`/profile/${comment.user_id}`}
                  className="font-semibold text-text-primary hover:text-accent-primary"
                >
                  {comment.user?.display_name || comment.user?.username || 'Anonymous'}
                </Link>
                {comment.is_commendation && (
                  <span className="ml-2 px-2 py-0.5 bg-accent-primary text-text-inverse rounded text-xs">
                    Official
                  </span>
                )}
                <p className="text-xs text-text-metadata">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {comment.hidden_at && (
              <span className="px-2 py-1 bg-error-bg text-error-text rounded text-xs">
                Hidden
              </span>
            )}
          </div>
          {editingComment === comment.id ? (
            <div className="mb-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={!editText.trim()}
                  className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => handleCancelEdit(comment.id)}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-text-primary whitespace-pre-line mb-3">
                {comment.deleted_at ? (
                  <span className="italic text-text-metadata opacity-60">
                    [This comment has been deleted]
                  </span>
                ) : (
                  comment.content
                )}
              </p>
              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <p className="text-xs text-text-metadata mb-2 italic">
                  (edited {new Date(comment.updated_at).toLocaleDateString()})
                </p>
              )}
            </>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(comment.id, comment.user_vote === 1 ? 0 : 1)}
                className={`text-sm ${comment.user_vote === 1 ? 'text-accent-primary' : 'text-text-metadata'}`}
                disabled={!!comment.deleted_at}
              >
                ↑
              </button>
              <span className="text-sm text-text-metadata">{comment.score || 0}</span>
              <button
                onClick={() => handleVote(comment.id, comment.user_vote === -1 ? 0 : -1)}
                className={`text-sm ${comment.user_vote === -1 ? 'text-error-text' : 'text-text-metadata'}`}
                disabled={!!comment.deleted_at}
              >
                ↓
              </button>
            </div>
            {session && depth < maxDepth && !comment.deleted_at && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-sm text-accent-primary hover:underline"
              >
                Reply
              </button>
            )}
            {session && !comment.is_commendation && !comment.deleted_at && (
              <button
                onClick={() => setReportingComment(reportingComment === comment.id ? null : comment.id)}
                className="text-sm text-error-text hover:underline"
              >
                Report
              </button>
            )}
            {session && comment.user_id === (session.user as any)?.id && !comment.is_commendation && (
              <>
                {comment.deleted_at ? (
                  <button
                    onClick={() => handleRestore(comment.id)}
                    className="text-sm text-success-text hover:underline"
                  >
                    Restore
                  </button>
                ) : (
                  <>
                    {editingComment !== comment.id && (
                      <>
                        <button
                          onClick={() => handleStartEdit(comment)}
                          className="text-sm text-accent-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingComment === comment.id}
                          className="text-sm text-error-text hover:underline disabled:opacity-50"
                        >
                          {deletingComment === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          {reportingComment === comment.id && (
            <form onSubmit={(e) => handleReport(comment.id, e)} className="mt-3 p-3 bg-error-bg border border-error-text/30 rounded-lg">
              <label htmlFor={`report-reason-${comment.id}`} className="block text-sm font-medium text-text-primary mb-2">
                Reason for reporting this comment:
              </label>
              <textarea
                id={`report-reason-${comment.id}`}
                name={`report-reason-${comment.id}`}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-error-text/50 focus:border-error-text focus:outline-none focus:ring-2 focus:ring-error-text/20 bg-card-bg text-text-primary text-sm"
                placeholder="Please explain why you're reporting this comment..."
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={!reportReason.trim()}
                  className="px-4 py-2 bg-error-text text-text-inverse rounded-lg hover:opacity-90 transition-colors text-sm disabled:opacity-50"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportingComment(null)
                    setReportReason('')
                  }}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3">
              <textarea
                id={`reply-text-${comment.id}`}
                name={`reply-text-${comment.id}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText('')
                  }}
                  className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-bg-secondary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
        <p className="text-text-primary">Loading comments...</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">Comments</h2>

      {session ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-6">
          <textarea
            id="new-comment"
            name="new-comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
            placeholder="Write a comment..."
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="mt-3 px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-card-bg-muted rounded-lg border border-border-medium">
          <p className="text-text-secondary mb-2">
            <Link href="/login" className="text-accent-primary hover:underline">Log in</Link> to comment
          </p>
        </div>
      )}

      {comments.filter(c => !c.parent_id && !c.deleted_at).length === 0 ? (
        <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium text-center">
          <p className="text-text-primary">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.filter(c => !c.parent_id).map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  )
}

