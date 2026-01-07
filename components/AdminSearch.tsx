'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'adage' | 'blog' | 'event' | 'user' | 'message'
  id: string
  title: string
  subtitle?: string
  url: string
}

export default function AdminSearch() {
  const [isOpen, setIsOpen] = useState(false)
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

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const results: SearchResult[] = []

        // Search adages
        const adagesRes = await fetch(`/api/adages?search=${encodeURIComponent(query)}&limit=5`)
        const adagesData = await adagesRes.json()
        if (adagesData.success) {
          results.push(...(adagesData.data || []).map((a: any) => ({
            type: 'adage' as const,
            id: a.id,
            title: a.adage,
            subtitle: a.definition,
            url: `/admin/adages`,
          })))
        }

        // Search blog posts
        const blogRes = await fetch(`/api/blog-posts?search=${encodeURIComponent(query)}&limit=5`)
        const blogData = await blogRes.json()
        if (blogData.success) {
          results.push(...(blogData.data || []).map((p: any) => ({
            type: 'blog' as const,
            id: p.id,
            title: p.title,
            subtitle: p.excerpt,
            url: `/admin/blog`,
          })))
        }

        // Search events
        const eventsRes = await fetch(`/api/events?search=${encodeURIComponent(query)}&limit=5`)
        const eventsData = await eventsRes.json()
        if (eventsData.success) {
          results.push(...(eventsData.data || []).map((e: any) => ({
            type: 'event' as const,
            id: e.id,
            title: e.title,
            subtitle: e.description?.substring(0, 100),
            url: `/admin/events`,
          })))
        }

        // Search users
        const usersRes = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`)
        const usersData = await usersRes.json()
        if (usersData.success) {
          results.push(...(usersData.data || []).map((u: any) => ({
            type: 'user' as const,
            id: u.id,
            title: u.display_name || u.username || u.email,
            subtitle: u.email,
            url: `/admin/users`,
          })))
        }

        // Search contact messages
        const messagesRes = await fetch(`/api/contact?search=${encodeURIComponent(query)}&limit=5`)
        const messagesData = await messagesRes.json()
        if (messagesData.success) {
          results.push(...(messagesData.data || []).map((m: any) => ({
            type: 'message' as const,
            id: m.id,
            title: m.name,
            subtitle: m.message?.substring(0, 100),
            url: `/admin/messages#message-${m.id}`,
          })))
        }

        setResults(results.slice(0, 10))
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
    setIsOpen(false)
    setQuery('')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-2 bg-accent-primary/20 text-text-inverse rounded-lg hover:bg-accent-primary/30 transition-colors flex items-center gap-2 border border-accent-primary/30"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden md:inline">Search</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20" onClick={() => setIsOpen(false)}>
          <div className="bg-card-bg rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border-medium" onClick={(e) => e.stopPropagation()}>
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
                  placeholder="Search adages, posts, events, users, messages..."
                  className="flex-1 outline-none text-text-primary bg-card-bg-muted border border-border-medium rounded px-2 py-1 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-metadata hover:text-text-primary"
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
                <div className="divide-y divide-border-medium">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full text-left p-4 hover:bg-card-bg-muted transition-colors bg-card-bg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {result.type === 'adage' && <span className="text-accent-primary">💬</span>}
                          {result.type === 'blog' && <span className="text-accent-primary">📝</span>}
                          {result.type === 'event' && <span className="text-accent-primary">📅</span>}
                          {result.type === 'user' && <span className="text-accent-primary">👤</span>}
                          {result.type === 'message' && <span className="text-accent-primary">✉️</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-sm text-text-secondary truncate mt-1">{result.subtitle}</p>
                          )}
                          <p className="text-xs text-text-metadata mt-1 capitalize">{result.type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-8 text-center text-text-secondary">
                  <p>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="p-8 text-center text-text-secondary">
                  <p>Start typing to search...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

