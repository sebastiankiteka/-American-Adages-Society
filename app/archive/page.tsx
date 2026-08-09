'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AdageCard from '@/components/AdageCard'
import { Adage } from '@/lib/db-types'
import { AdageCardSkeleton } from '@/components/LoadingSkeleton'
import BackToTop from '@/components/BackToTop'
import {
  filterPublicTags,
  partitionTagsByFacet,
} from '@/lib/tag-facets'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/** User-facing count under the archive title. Always capitalize "Adages". */
function formatArchiveAdageCountLine(
  filtered: number,
  total: number,
  hasActiveFilters: boolean
): string {
  return hasActiveFilters
    ? `${filtered} of ${total} Adages`
    : `${total} Adages Collected`
}

export default function Archive() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [adages, setAdages] = useState<Adage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedTag !== null

  useEffect(() => {
    const fetchAdages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/adages')
        const result: ApiResponse<Adage[]> = await response.json()
        
        if (result.success && result.data) {
          setAdages(result.data)
        } else {
          setError(result.error || 'Failed to load adages')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load adages')
      } finally {
        setLoading(false)
      }
    }

    fetchAdages()
  }, [])

  /** Unique public (non-system) tags, grouped for facet headings — tag strings are unchanged. */
  const tagFacetGroups = useMemo(() => {
    const tags = new Set<string>()
    adages.forEach((adage) => {
      filterPublicTags(adage.tags).forEach((tag) => tags.add(tag))
    })
    return partitionTagsByFacet(Array.from(tags))
  }, [adages])

  // Filter adages based on search and tag
  const filteredAdages = useMemo(() => {
    return adages.filter(adage => {
      const matchesSearch = 
        adage.adage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adage.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adage.origin?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTag = selectedTag === null || adage.tags?.includes(selectedTag)
      
      return matchesSearch && matchesTag
    })
  }, [adages, searchQuery, selectedTag])

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            The Archive
          </h1>
          {/* Count: show loading hint while fetching; hide on error (message appears in grid); never show a stale or fake total. */}
          {loading ? (
            <p className="text-lg md:text-xl text-text-secondary mt-2">Loading…</p>
          ) : error ? null : (
            <p className="text-lg md:text-xl font-semibold text-text-primary mt-2">
              {formatArchiveAdageCountLine(
                filteredAdages.length,
                adages.length,
                hasActiveFilters
              )}
            </p>
          )}
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-4">
            Explore our searchable dictionary of adages, each with definitions, 
            origins, historical context, and cultural interpretations.
          </p>
          {process.env.NEXT_PUBLIC_USE_OFFLINE_DATA === 'true' && (
            <p className="text-sm text-text-secondary max-w-xl mx-auto mb-4 rounded-md border border-border-subtle bg-card-bg px-3 py-2">
              Showing bundled archive data (offline mode). Live database will replace this when re-enabled.
            </p>
          )}
          <Link
            href="/featured-calendar"
            className="inline-block text-sm text-accent-primary hover:underline"
          >
            View Featured Adages Calendar →
          </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search adages, definitions, or origins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-accent-primary text-text-inverse'
                    : 'bg-card-bg text-text-primary border border-border-subtle hover:border-accent-primary'
                }`}
              >
                All
              </button>
            </div>

            {tagFacetGroups.languages.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tagFacetGroups.languages.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-accent-primary text-text-inverse'
                          : 'bg-card-bg text-text-primary border border-border-subtle hover:border-accent-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tagFacetGroups.themes.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                  Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tagFacetGroups.themes.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-accent-primary text-text-inverse'
                          : 'bg-card-bg text-text-primary border border-border-subtle hover:border-accent-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tagFacetGroups.type.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                  Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tagFacetGroups.type.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-accent-primary text-text-inverse'
                          : 'bg-card-bg text-text-primary border border-border-subtle hover:border-accent-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Adages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <AdageCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-card-bg rounded-lg border border-error-text/30">
            <p className="text-error-text">Error loading adages: {error}</p>
          </div>
        ) : filteredAdages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdages.map((adage) => (
              <AdageCard 
                key={adage.id} 
                {...adage}
                featured={adage.featured}
                featured_reason={(adage as any).featured_reason}
                featured_from={(adage as any).featured_from}
                featured_until={(adage as any).featured_until}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card-bg rounded-lg border border-border-subtle">
            <p className="text-lg text-text-secondary">
              No adages found matching your search criteria.
            </p>
          </div>
        )}

        {/* Propose Adage Section */}
        <div className="mt-12 bg-card-bg p-8 rounded-lg border border-border-medium">
          <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">
            Propose an Adage
          </h2>
          <p className="text-text-secondary mb-6">
            Have an adage you'd like to see in our archive? Share it with us, 
            along with its definition, origin, and cultural significance.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
          >
            Submit an Adage
          </a>
        </div>
      </div>
      <BackToTop />
    </div>
  )
}

