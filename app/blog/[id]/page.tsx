import Link from 'next/link'
import { blogPosts } from '@/lib/data'

export default function BlogPost({ params }: { params: { id: string } }) {
  const post = blogPosts.find(p => p.id === params.id)

  if (!post) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/blog"
            className="text-bronze hover:text-bronze/80 mb-6 inline-block"
          >
            ← Back to Blog
          </Link>
          <article className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray">
            <h1 className="text-4xl font-bold font-serif mb-6 text-charcoal">
              Post Not Found
            </h1>
            <p className="text-charcoal-light">
              The blog post you're looking for doesn't exist.
            </p>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/blog"
          className="text-bronze hover:text-bronze/80 mb-6 inline-block"
        >
          ← Back to Blog
        </Link>
        
        <article className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-charcoal">
            {post.title}
          </h1>
          
          <div className="text-sm text-charcoal-light mb-8 pb-6 border-b border-soft-gray">
            <span>{new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            {post.author && (
              <>
                <span className="mx-2">•</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-soft-gray text-charcoal-light rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-lg max-w-none text-charcoal-light leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  )
}
