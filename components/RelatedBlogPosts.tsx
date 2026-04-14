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
    <section className="mt-12 rounded-lg border border-border-medium bg-card-bg p-8 shadow-sm">
      <h2 className="mb-6 font-serif text-2xl font-bold text-text-primary">Related Posts</h2>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug || post.id}`}
            className="group block rounded-lg border border-border-medium bg-card-bg-muted p-4 transition-colors hover:border-accent-primary"
          >
            <h3 className="mb-2 text-lg font-semibold text-text-primary transition-colors group-hover:text-accent-primary">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mb-2 line-clamp-2 text-sm text-text-secondary">
                {post.excerpt}
              </p>
            )}
            <p className="text-xs text-text-metadata">
              {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}














