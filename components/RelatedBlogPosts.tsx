'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/db-types'
import { format } from 'date-fns'

interface RelatedBlogPostsProps {
  currentPostId: string
  tags?: string[]
}

export default function RelatedBlogPosts({ currentPostId, tags }: RelatedBlogPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true)
        // Fetch posts with matching tags, excluding current post
        const response = await fetch(`/api/blog-posts?limit=3`)
        const result = await response.json()
        
        if (result.success && result.data) {
          // Filter out current post and find posts with matching tags
          const filtered = result.data
            .filter((post: BlogPost) => post.id !== currentPostId)
            .filter((post: BlogPost) => {
              if (!tags || tags.length === 0) return true
              return post.tags?.some(tag => tags.includes(tag))
            })
            .slice(0, 3)
          
          setRelatedPosts(filtered)
        }
      } catch (err) {
        console.error('Failed to fetch related posts:', err)
      } finally {
        setLoading(false)
      }
    }

    if (tags && tags.length > 0) {
      fetchRelated()
    } else {
      setLoading(false)
    }
  }, [currentPostId, tags])

  if (loading || relatedPosts.length === 0) return null

  return (
    <section className="mt-12 bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
      <h2 className="text-2xl font-bold font-serif text-charcoal mb-6">Related Posts</h2>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug || post.id}`}
            className="block p-4 bg-cream rounded-lg border border-soft-gray hover:border-bronze transition-colors group"
          >
            <h3 className="text-lg font-semibold text-charcoal group-hover:text-bronze transition-colors mb-2">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-sm text-charcoal-light mb-2 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <p className="text-xs text-charcoal-light">
              {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}


