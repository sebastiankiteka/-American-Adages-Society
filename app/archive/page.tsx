'use client'

'use client'

import { useState, useMemo, useEffect } from 'react'
import AdageCard from '@/components/AdageCard'
import { getAdages } from '@/lib/adminData'

export default function Archive() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sampleAdages, setSampleAdages] = useState(getAdages())

  useEffect(() => {
    // Refresh adages when component mounts or when localStorage changes
    const refreshAdages = () => {
      setSampleAdages(getAdages())
    }
    refreshAdages()
    // Listen for storage changes (when admin updates data)
    window.addEventListener('storage', refreshAdages)
    return () => window.removeEventListener('storage', refreshAdages)
  }, [])

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    sampleAdages.forEach(adage => {
      adage.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [])

  // Filter adages based on search and tag
  const filteredAdages = useMemo(() => {
    return sampleAdages.filter(adage => {
      const matchesSearch = 
        adage.adage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adage.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adage.origin?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTag = selectedTag === null || adage.tags?.includes(selectedTag)
      
      return matchesSearch && matchesTag
    })
  }, [searchQuery, selectedTag])

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-charcoal">
            The Archive
          </h1>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Explore our searchable dictionary of adages, each with definitions, 
            origins, historical context, and cultural interpretations.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search adages, definitions, or origins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-bronze text-cream'
                  : 'bg-white text-charcoal border border-soft-gray hover:border-bronze'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-bronze text-cream'
                    : 'bg-white text-charcoal border border-soft-gray hover:border-bronze'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-charcoal-light">
          <p>
            Showing {filteredAdages.length} of {sampleAdages.length} adages
          </p>
        </div>

        {/* Adages Grid */}
        {filteredAdages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdages.map((adage) => (
              <AdageCard key={adage.id} {...adage} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-soft-gray">
            <p className="text-lg text-charcoal-light">
              No adages found matching your search criteria.
            </p>
          </div>
        )}

        {/* Propose Adage Section */}
        <div className="mt-12 bg-white p-8 rounded-lg border border-soft-gray">
          <h2 className="text-2xl font-bold font-serif mb-4 text-charcoal">
            Propose an Adage
          </h2>
          <p className="text-charcoal-light mb-6">
            Have an adage you'd like to see in our archive? Share it with us, 
            along with its definition, origin, and cultural significance.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
          >
            Submit an Adage
          </a>
        </div>
      </div>
    </div>
  )
}

