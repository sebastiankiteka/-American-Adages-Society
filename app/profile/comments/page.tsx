'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  target_type: string
  target_id: string
  target_title?: string
  target_url?: string
  created_at: string
  updated_at: string
  hidden_at?: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function MyComments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchComments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/comments')
        const result: ApiResponse<Comment[]> = await response.json()

        if (result.success && result.data) {
          setComments(result.data)
        } else {
          setError(result.error || 'Failed to load comments')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load comments')
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [session, status, router])

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

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'adage': return 'Adage'
      case 'blog': return 'Blog Post'
      case 'forum': return 'Forum Post'
      default: return type
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary">My Comments</h1>
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

        {comments.length === 0 ? (
          <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-lg text-text-secondary mb-4">You haven't made any comments yet.</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/archive"
                className="px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
              >
                Browse Archive
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
              >
                Read Blog
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-card-bg p-6 rounded-lg shadow-sm border ${
                  comment.hidden_at ? 'border-error-text/30 opacity-60' : 'border-border-medium'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    {comment.target_url ? (
                      <Link
                        href={comment.target_url}
                        className="text-accent-primary hover:underline font-semibold"
                      >
                        {comment.target_title || `${getTargetTypeLabel(comment.target_type)} Comment`}
                      </Link>
                    ) : (
                      <span className="text-text-secondary font-semibold">
                        {comment.target_title || `${getTargetTypeLabel(comment.target_type)} Comment`}
                      </span>
                    )}
                    <span className="text-sm text-text-metadata ml-2">
                      • {getTargetTypeLabel(comment.target_type)}
                    </span>
                    {comment.hidden_at && (
                      <span className="ml-2 px-2 py-1 bg-error-bg text-error-text rounded-full text-xs border border-error-text/30">
                        Hidden
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-text-metadata">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-text-secondary whitespace-pre-line">{comment.content}</p>
                {comment.updated_at !== comment.created_at && (
                  <p className="text-xs text-text-metadata mt-2 italic">
                    Edited on {new Date(comment.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



