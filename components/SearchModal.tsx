'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'adage' | 'blog' | 'user' | 'event'
  id: string
  title: string
  subtitle?: string
  url: string
  date?: string
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        // Search adages
        const adagesResponse = await fetch(`/api/adages?search=${encodeURIComponent(query)}&limit=5`)
        const adagesResult = await adagesResponse.json()
        const adageResults: SearchResult[] = (adagesResult.data || []).map((adage: any) => ({
          type: 'adage' as const,
          id: adage.id,
          title: adage.adage,
          subtitle: adage.definition,
          url: `/archive/${adage.id}`,
        }))

        // Search blog posts
        const blogResponse = await fetch(`/api/blog-posts?search=${encodeURIComponent(query)}&limit=5`)
        const blogResult = await blogResponse.json()
        const blogResults: SearchResult[] = (blogResult.data || []).map((post: any) => ({
          type: 'blog' as const,
          id: post.id,
          title: post.title,
          subtitle: post.excerpt,
          url: `/blog/${post.slug || post.id}`, // Use slug if available, fallback to id
        }))

        // Search users (by username or display name)
        const usersResponse = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`)
        const usersResult = await usersResponse.json()
        const userResults: SearchResult[] = (usersResult.data || []).map((user: any) => ({
          type: 'user' as const,
          id: user.id,
          title: user.display_name || user.username || user.email,
          subtitle: user.username ? `@${user.username}` : undefined,
          url: `/profile/${user.id}`,
        }))

        // Search events
        const eventsResponse = await fetch(`/api/events?search=${encodeURIComponent(query)}&limit=5`)
        const eventsResult = await eventsResponse.json()
        const eventResults: SearchResult[] = (eventsResult.data || []).map((event: any) => ({
          type: 'event' as const,
          id: event.id,
          title: event.title,
          subtitle: event.description?.substring(0, 100),
          url: `/events#event-${event.id}`,
          date: event.event_date,
        }))

        setResults([...adageResults, ...blogResults, ...userResults, ...eventResults].slice(0, 10))
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [query])

  const handleResultClick = (url: string) => {
    router.push(url)
    onClose()
    setQuery('')
  }

  // Prevent body scroll when modal is open - only run on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow || 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20" 
      onClick={onClose}
      onTouchStart={(e) => {
        // Close on touch outside
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div 
        className="bg-card-bg rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border-medium" 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search dialog"
      >
        <div className="p-4 border-b border-border-medium">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-text-metadata" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  e.preventDefault()
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                  onClose()
                  setQuery('')
                } else if (e.key === 'Escape') {
                  onClose()
                }
              }}
              placeholder="Search adages, blog posts, users..."
              className="flex-1 outline-none text-text-primary bg-card-bg-muted focus:ring-2 focus:ring-accent-primary rounded px-2 py-1 border border-border-medium focus:border-accent-primary"
              aria-label="Search input"
            />
            <button
              onClick={onClose}
              className="text-text-metadata hover:text-text-primary active:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary rounded touch-manipulation mobile-touch-target"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-text-secondary">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="divide-y divide-border-medium">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full text-left p-4 hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors bg-card-bg touch-manipulation mobile-touch-target-inline"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.type === 'adage' && <span className="text-accent-primary">💬</span>}
                        {result.type === 'blog' && <span className="text-accent-primary">📝</span>}
                        {result.type === 'user' && <span className="text-accent-primary">👤</span>}
                        {result.type === 'event' && <span className="text-accent-primary">📅</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-sm text-text-secondary truncate mt-1">{result.subtitle}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-text-metadata capitalize">{result.type}</p>
                          {result.date && (
                            <p className="text-xs text-text-metadata">
                              • {new Date(result.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-border-medium">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="block w-full text-center px-4 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover active:bg-accent-hover transition-colors text-sm font-medium touch-manipulation mobile-touch-target"
                >
                  View All Results →
                </Link>
              </div>
            </>
          ) : query.trim() ? (
            <div className="p-8 text-center text-text-secondary">
              <p>No results found for "{query}"</p>
              <p className="text-xs mt-2">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="p-8 text-center text-text-secondary">
              <p>Start typing to search...</p>
              <p className="text-xs mt-2">Search for adages, blog posts, or users</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

