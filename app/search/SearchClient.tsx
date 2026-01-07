'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface SearchResult {
  type: 'adage' | 'blog' | 'user' | 'event'
  id: string
  title: string
  subtitle?: string
  url: string
  date?: string
  tags?: string[]
  score?: number
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface SearchFilters {
  types: ('adage' | 'blog' | 'user' | 'event')[]
  tags: string[]
  dateFrom?: string
  dateTo?: string
  sortBy: 'relevance' | 'date' | 'title'
}

export default function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['adage', 'blog', 'user', 'event'],
    tags: [],
    sortBy: 'relevance',
  })

  const [availableTags, setAvailableTags] = useState<string[]>([])

  useEffect(() => {
    if (query) {
      performSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters])

  const performSearch = async () => {
    if (!query.trim()) {
      setResults([])
      setTotalCount(0)
      return
    }

    setLoading(true)
    try {
      const allResults: SearchResult[] = []

      // Search adages
      if (filters.types.includes('adage')) {
        const params = new URLSearchParams({
          search: query,
          limit: '50',
        })
        if (filters.tags.length > 0) {
          filters.tags.forEach(tag => params.append('tag', tag))
        }
        
        const adagesResponse = await fetch(`/api/adages?${params.toString()}`)
        const adagesResult: ApiResponse<any[]> = await adagesResponse.json()
        if (adagesResult.success && adagesResult.data) {
          const adageResults: SearchResult[] = adagesResult.data.map((adage: any) => ({
            type: 'adage' as const,
            id: adage.id,
            title: adage.adage,
            subtitle: adage.definition,
            url: `/archive/${adage.id}`,
            tags: adage.tags,
            score: adage.score,
          }))
          allResults.push(...adageResults)
          
          // Collect tags for filter
          adageResults.forEach(result => {
            if (result.tags) {
              result.tags.forEach(tag => {
                if (!availableTags.includes(tag)) {
                  setAvailableTags(prev => [...prev, tag].sort())
                }
              })
            }
          })
        }
      }

      // Search blog posts
      if (filters.types.includes('blog')) {
        const params = new URLSearchParams({
          search: query,
          limit: '50',
        })
        if (filters.tags.length > 0) {
          filters.tags.forEach(tag => params.append('tag', tag))
        }
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.append('dateTo', filters.dateTo)
        
        const blogResponse = await fetch(`/api/blog-posts?${params.toString()}`)
        const blogResult: ApiResponse<any[]> = await blogResponse.json()
        if (blogResult.success && blogResult.data) {
          const blogResults: SearchResult[] = blogResult.data.map((post: any) => ({
            type: 'blog' as const,
            id: post.id,
            title: post.title,
            subtitle: post.excerpt,
            url: `/blog/${post.slug || post.id}`,
            date: post.published_at || post.created_at,
            tags: post.tags,
            score: post.score,
          }))
          allResults.push(...blogResults)
        }
      }

      // Search users
      if (filters.types.includes('user')) {
        const params = new URLSearchParams({
          q: query,
          limit: '50',
        })
        
        const usersResponse = await fetch(`/api/users/search?${params.toString()}`)
        const usersResult: ApiResponse<any[]> = await usersResponse.json()
        if (usersResult.success && usersResult.data) {
          const userResults: SearchResult[] = usersResult.data.map((user: any) => ({
            type: 'user' as const,
            id: user.id,
            title: user.display_name || user.username || user.email,
            subtitle: user.username ? `@${user.username}` : undefined,
            url: `/profile/${user.id}`,
          }))
          allResults.push(...userResults)
        }
      }

      // Search events
      if (filters.types.includes('event')) {
        const params = new URLSearchParams({
          search: query,
          limit: '50',
        })
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.append('dateTo', filters.dateTo)
        
        const eventsResponse = await fetch(`/api/events?${params.toString()}`)
        const eventsResult: ApiResponse<any[]> = await eventsResponse.json()
        if (eventsResult.success && eventsResult.data) {
          const eventResults: SearchResult[] = eventsResult.data.map((event: any) => ({
            type: 'event' as const,
            id: event.id,
            title: event.title,
            subtitle: event.description?.substring(0, 150),
            url: `/events#event-${event.id}`,
            date: event.event_date,
          }))
          allResults.push(...eventResults)
        }
      }

      // Sort results
      let sortedResults = [...allResults]
      if (filters.sortBy === 'date') {
        sortedResults.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })
      } else if (filters.sortBy === 'title') {
        sortedResults.sort((a, b) => a.title.localeCompare(b.title))
      } else {
        // Relevance: sort by score if available, then by title match
        sortedResults.sort((a, b) => {
          const scoreA = a.score || 0
          const scoreB = b.score || 0
          if (scoreA !== scoreB) return scoreB - scoreA
          return a.title.localeCompare(b.title)
        })
      }

      setResults(sortedResults)
      setTotalCount(sortedResults.length)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const toggleType = (type: 'adage' | 'blog' | 'user' | 'event') => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }))
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {
      adage: [],
      blog: [],
      user: [],
      event: [],
    }
    results.forEach(result => {
      grouped[result.type].push(result)
    })
    return grouped
  }, [results])

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary mb-2">
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          {query && (
            <p className="text-text-secondary">
              {loading ? 'Searching...' : `${totalCount} result${totalCount !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium p-4 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const searchQuery = (formData.get('query') as string) || ''
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
            className="flex gap-4"
          >
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search adages, blog posts, users, events..."
              className="flex-1 px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {query && (
          <>
            {/* Filters Toggle */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors text-sm"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              {filters.types.length < 4 && (
                <span className="text-sm text-text-metadata">
                  Showing: {filters.types.join(', ')}
                </span>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium p-6 mb-6">
                <h3 className="text-xl font-bold font-serif text-text-primary mb-4">Filters</h3>
                
                {/* Content Types */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">Content Types</label>
                  <div className="flex flex-wrap gap-2">
                    {(['adage', 'blog', 'user', 'event'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors border ${
                          filters.types.includes(type)
                            ? 'bg-accent-primary text-text-inverse border-accent-primary'
                            : 'bg-card-bg-muted text-text-primary border-border-medium hover:bg-card-bg'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {availableTags.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors border ${
                            filters.tags.includes(tag)
                              ? 'bg-accent-primary text-text-inverse border-accent-primary'
                              : 'bg-card-bg-muted text-text-primary border-border-medium hover:bg-card-bg'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">Date Range</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-text-metadata mb-1">From</label>
                      <input
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                        className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-text-metadata mb-1">To</label>
                      <input
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                        className="w-full px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date (Newest First)</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(filters.tags.length > 0 || filters.dateFrom || filters.dateTo || filters.types.length < 4) && (
                  <button
                    onClick={() => {
                      setFilters({
                        types: ['adage', 'blog', 'user', 'event'],
                        tags: [],
                        sortBy: 'relevance',
                      })
                    }}
                    className="mt-4 px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium text-center">
                <p className="text-text-secondary mb-4">No results found for "{query}"</p>
                <p className="text-sm text-text-metadata">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Adages */}
                {groupedResults.adage.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                      Adages ({groupedResults.adage.length})
                    </h2>
                    <div className="space-y-4">
                      {groupedResults.adage.map((result) => (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="block bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all"
                        >
                          <h3 className="text-xl font-bold font-serif text-accent-primary mb-2">
                            "{result.title}"
                          </h3>
                          {result.subtitle && (
                            <p className="text-text-secondary mb-2 line-clamp-2">{result.subtitle}</p>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {result.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-card-bg-muted text-text-metadata rounded text-xs border border-border-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blog Posts */}
                {groupedResults.blog.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                      Blog Posts ({groupedResults.blog.length})
                    </h2>
                    <div className="space-y-4">
                      {groupedResults.blog.map((result) => (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="block bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all"
                        >
                          <h3 className="text-xl font-bold font-serif text-text-primary mb-2">
                            {result.title}
                          </h3>
                          {result.subtitle && (
                            <p className="text-text-secondary mb-2 line-clamp-2">{result.subtitle}</p>
                          )}
                          {result.date && (
                            <p className="text-xs text-text-metadata">
                              {format(new Date(result.date), 'MMMM d, yyyy')}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {groupedResults.user.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                      Users ({groupedResults.user.length})
                    </h2>
                    <div className="space-y-4">
                      {groupedResults.user.map((result) => (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="block bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all"
                        >
                          <h3 className="text-xl font-bold font-serif text-text-primary mb-1">
                            {result.title}
                          </h3>
                          {result.subtitle && (
                            <p className="text-text-secondary">{result.subtitle}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {groupedResults.event.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                      Events ({groupedResults.event.length})
                    </h2>
                    <div className="space-y-4">
                      {groupedResults.event.map((result) => (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="block bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all"
                        >
                          <h3 className="text-xl font-bold font-serif text-text-primary mb-2">
                            {result.title}
                          </h3>
                          {result.subtitle && (
                            <p className="text-text-secondary mb-2 line-clamp-2">{result.subtitle}</p>
                          )}
                          {result.date && (
                            <p className="text-xs text-text-metadata">
                              {format(new Date(result.date), 'MMMM d, yyyy')}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!query && (
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-text-secondary">Enter a search query to find adages, blog posts, users, and events</p>
          </div>
        )}
      </div>
    </div>
  )
}

