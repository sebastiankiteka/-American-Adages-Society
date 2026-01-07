'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import BlogCard from '@/components/BlogCard'
import { BlogPost } from '@/lib/db-types'
import { BlogCardSkeleton } from '@/components/LoadingSkeleton'
import BackToTop from '@/components/BackToTop'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blog-posts')
        const result: ApiResponse<BlogPost[]> = await response.json()
        
        if (result.success && result.data) {
          setPosts(result.data)
        } else {
          setError(result.error || 'Failed to load blog posts')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [posts])

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag))
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return a.title.localeCompare(b.title)
      }
    })

    return sorted
  }, [posts, selectedTag, sortBy])

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
            Blog & Announcements
          </h1>
          <p className="text-lg text-text-primary max-w-2xl mx-auto mb-4">
            Updates on AAS programs, initiatives, and reflections on language, 
            culture, and the wisdom embedded in our everyday expressions.
          </p>
          <a
            href="/api/rss.xml"
            className="inline-flex items-center gap-2 text-sm text-accent-primary hover:underline"
            aria-label="Subscribe to RSS feed"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.429 2.571c9.486 0 17.143 7.657 17.143 17.143h-4.571c0-6.971-5.6-12.571-12.571-12.571v-4.571zM3.429 9.714c5.029 0 9.143 4.114 9.143 9.143h-4.571c0-2.514-2.057-4.571-4.571-4.571v-4.571zM6.857 16.571c0 1.257-1.029 2.286-2.286 2.286s-2.286-1.029-2.286-2.286 1.029-2.286 2.286-2.286 2.286 1.029 2.286 2.286z" />
            </svg>
            RSS Feed
          </a>
        </div>

        {/* Filters and Sorting */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-accent-primary text-text-inverse'
                    : 'bg-card-bg text-text-primary border border-border-medium hover:border-accent-primary'
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
                      : 'bg-cream dark:bg-charcoal text-charcoal dark:text-cream border border-soft-gray dark:border-charcoal-light hover:border-bronze'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-text-metadata">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
                className="px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              >
                <option value="date">Date (Newest First)</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-card-bg rounded-lg border border-error-text/30">
            <p className="text-error-text">Error loading posts: {error}</p>
          </div>
        ) : filteredAndSortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPosts.map((post) => (
              <BlogCard 
                key={post.id} 
                id={post.id}
                title={post.title}
                excerpt={post.excerpt || ''}
                date={post.published_at || post.created_at}
                author={post.author_name}
                tags={post.tags}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card-bg rounded-lg border border-border-medium">
            <p className="text-lg text-text-primary">
              No posts found matching your selected tag.
            </p>
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  )
}

