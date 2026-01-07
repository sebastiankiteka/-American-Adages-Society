import Link from 'next/link'

interface BlogCardProps {
  id: string
  title: string
  excerpt: string
  date: string
  author?: string
  tags?: string[]
}

export default function BlogCard({ id, title, excerpt, date, author, tags }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${id}`}
      className="block bg-card-bg p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border-subtle hover:border-accent-primary group"
    >
      <h3 className="text-2xl font-bold font-serif mb-3 text-text-primary group-hover:text-accent-primary transition-colors">
        {title}
      </h3>
      <div className="text-sm text-text-metadata mb-3">
        <span>{new Date(date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
        {author && <span className="mx-2">•</span>}
        {author && <span>{author}</span>}
      </div>
      <p className="text-text-primary mb-4 line-clamp-3">
        {excerpt}
      </p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-card-bg-muted border border-border-subtle text-text-metadata rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

