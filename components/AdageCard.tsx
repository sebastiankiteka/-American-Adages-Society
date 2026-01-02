import Link from 'next/link'

interface AdageCardProps {
  id: string
  adage: string
  definition: string
  origin?: string
  tags?: string[]
}

export default function AdageCard({ id, adage, definition, origin, tags }: AdageCardProps) {
  return (
    <Link 
      href={`/archive/${id}`}
      className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-soft-gray hover:border-bronze group"
    >
      <h3 className="text-2xl font-bold font-serif mb-3 text-charcoal group-hover:text-bronze transition-colors">
        "{adage}"
      </h3>
      <p className="text-charcoal-light mb-4 line-clamp-2">
        {definition}
      </p>
      {origin && (
        <p className="text-sm text-bronze italic mb-2">
          Origin: {origin}
        </p>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-soft-gray text-charcoal-light rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

