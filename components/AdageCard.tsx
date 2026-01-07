'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

interface AdageCardProps {
  id: string
  adage: string
  definition: string
  origin?: string
  tags?: string[]
  save_count?: number
  featured?: boolean
  featured_reason?: string
  featured_from?: string
  featured_until?: string
}

export default function AdageCard({ id, adage, definition, origin, tags, save_count, featured, featured_reason, featured_from, featured_until }: AdageCardProps) {
  const { data: session } = useSession()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const [saveCount, setSaveCount] = useState(save_count || 0)

  useEffect(() => {
    if (session) {
      checkFavoriteStatus()
    }
  }, [session, id])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/adages/${id}/favorite`)
      const result = await response.json()
      if (result.success) {
        setIsFavorited(result.data.favorited)
      }
    } catch (err) {
      // Silently fail
    }
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      window.location.href = '/login'
      return
    }

    setFavoriting(true)
    try {
      const response = await fetch(`/api/adages/${id}/favorite`, {
        method: 'POST',
      })
      const result = await response.json()

      if (result.success) {
        setIsFavorited(result.data.favorited)
        // Update save count from API response (more accurate than optimistic update)
        if (result.data.save_count !== undefined) {
          setSaveCount(result.data.save_count)
        } else {
          // Fallback: optimistic update if save_count not in response
          if (result.data.favorited) {
            setSaveCount(prev => prev + 1)
          } else {
            setSaveCount(prev => Math.max(0, prev - 1))
          }
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    } finally {
      setFavoriting(false)
    }
  }

  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border-subtle hover:border-accent-primary group relative">
      <div className="flex justify-between items-start mb-3">
        <Link href={`/archive/${id}`} className="flex-1">
          <h3 className="text-2xl font-bold font-serif text-text-primary group-hover:text-accent-primary transition-colors pr-2">
            "{adage}"
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-text-metadata">
            <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-medium">{saveCount}</span>
          </div>
          <button
            onClick={handleFavorite}
            disabled={favoriting}
            className={`p-1.5 rounded transition-colors ${
              isFavorited
                ? 'text-accent-primary hover:text-accent-hover'
                : 'text-text-metadata hover:text-accent-primary'
            }`}
            title={isFavorited ? 'Unfavorite' : 'Favorite'}
          >
            <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>
      
      <Link href={`/archive/${id}`} className="block">
        <p className="text-text-primary mb-4 line-clamp-2">
          {definition}
        </p>
        {origin && (
          <p className="text-sm text-accent-primary italic mb-2">
            Origin: {origin}
          </p>
        )}
        {featured && (
          <div className="text-xs text-text-metadata mb-2 space-y-1">
            {featured_reason && (
              <p className="italic">
                Featured: {featured_reason}
              </p>
            )}
            {(featured_from || featured_until) && (
              <p className="text-accent-primary font-medium">
                {featured_from && format(new Date(featured_from), 'MMM d, yyyy')}
                {featured_from && featured_until && ' - '}
                {featured_until && format(new Date(featured_until), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-card-bg-muted border border-border-subtle text-text-metadata rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {featured && (
          <div className="mt-3">
            <span className="inline-block px-2.5 py-1 bg-accent-primary text-text-inverse rounded-md text-xs font-semibold shadow-sm">
              Featured
            </span>
          </div>
        )}
      </Link>
    </div>
  )
}

