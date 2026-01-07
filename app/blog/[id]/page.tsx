'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/db-types'
import CommentsSection from '@/components/CommentsSection'
import ShareButtons from '@/components/ShareButtons'
import ReadingProgress from '@/components/ReadingProgress'
import RelatedBlogPosts from '@/components/RelatedBlogPosts'
import { analytics } from '@/lib/analytics'
import { calculateReadingTime, formatReadingTime } from '@/lib/utils'
import { format } from 'date-fns'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function BlogPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        // Try by slug first, then by ID
        let response = await fetch(`/api/blog-posts/slug/${params.id}`)
        let result: ApiResponse<BlogPost> = await response.json()
        
        // If not found by slug, try by ID
        if (!result.success) {
          response = await fetch(`/api/blog-posts/${params.id}`)
          result = await response.json()
        }
        
        if (result.success && result.data) {
          setPost(result.data)
          // Track blog post view
          analytics.trackBlogView(result.data.id, result.data.title)
        } else {
          setError(result.error || 'Blog post not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog"
            className="text-bronze hover:text-bronze/80 mb-6 inline-block"
          >
            ← Back to Blog
          </Link>
          <div className="bg-cream dark:bg-charcoal p-8 rounded-lg shadow-sm border border-border">
            <p className="text-text-secondary">Loading blog post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog"
            className="text-bronze hover:text-bronze/80 mb-6 inline-block"
          >
            ← Back to Blog
          </Link>
          <article className="bg-cream dark:bg-charcoal p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray dark:border-charcoal-light">
            <h1 className="text-4xl font-bold font-serif mb-6 text-charcoal">
              Post Not Found
            </h1>
            <p className="text-text-secondary">
              {error || "The blog post you're looking for doesn't exist."}
            </p>
          </article>
        </div>
      </div>
    )
  }

  const readingTime = post?.content ? calculateReadingTime(post.content) : null

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <ReadingProgress />
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/blog"
          className="text-bronze hover:text-bronze/80 mb-6 inline-block"
        >
          ← Back to Blog
        </Link>
        
        <article className="bg-surface dark:bg-surface p-8 md:p-12 rounded-lg shadow-sm border border-border">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-charcoal">
            {post.title}
          </h1>
          
          <div className="text-sm text-text-secondary mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-4 flex-wrap mb-4">
              <span>{format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}</span>
              {post.updated_at && post.updated_at !== post.published_at && (
                <>
                  <span>•</span>
                  <span>Last updated: {format(new Date(post.updated_at), 'MMMM d, yyyy')}</span>
                </>
              )}
              {post.author_name && (
                <>
                  <span>•</span>
                  <span>{post.author_name}</span>
                </>
              )}
              {readingTime && (
                <>
                  <span>•</span>
                  <span>{formatReadingTime(readingTime)}</span>
                </>
              )}
              {(post as any).activity_count !== undefined && (
                <>
                  <span>•</span>
                  <span>
                    {(post as any).comment_count || 0} comment{((post as any).comment_count || 0) !== 1 ? 's' : ''}
                    {((post as any).score || 0) > 0 && (
                      <> • {(post as any).score} reaction{((post as any).score !== 1) ? 's' : ''}</>
                    )}
                  </span>
                </>
              )}
            </div>
            <ShareButtons
              url={`/blog/${params.id}`}
              title={post.title}
              description={post.excerpt || undefined}
            />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-soft-gray dark:bg-charcoal-light/20 text-text-secondary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </article>

        <RelatedBlogPosts currentPostId={post.id} tags={post.tags} />

        <CommentsSection targetType="blog" targetId={post.id} />
      </div>
    </div>
  )
}
