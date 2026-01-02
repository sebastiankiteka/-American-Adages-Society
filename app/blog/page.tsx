'use client'

import { useState, useMemo, useEffect } from 'react'
import BlogCard from '@/components/BlogCard'
import { getBlogPosts } from '@/lib/adminData'

const allTags = ['culture', 'history', 'philosophy', 'leadership', 'modern application', 'events', 'announcement', 'programs', 'etymology', 'language']

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const [samplePosts, setSamplePosts] = useState(getBlogPosts())

  useEffect(() => {
    const refreshPosts = () => {
      setSamplePosts(getBlogPosts())
    }
    refreshPosts()
    window.addEventListener('storage', refreshPosts)
    return () => window.removeEventListener('storage', refreshPosts)
  }, [])

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = samplePosts

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag))
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return a.title.localeCompare(b.title)
      }
    })

    return sorted
  }, [selectedTag, sortBy])

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
            Blog & Announcements
          </h1>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Updates on AAS programs, initiatives, and reflections on language, 
            culture, and the wisdom embedded in our everyday expressions.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
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

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-charcoal-light">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
              >
                <option value="date">Date (Newest First)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredAndSortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPosts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-soft-gray">
            <p className="text-lg text-charcoal-light">
              No posts found matching your selected tag.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

