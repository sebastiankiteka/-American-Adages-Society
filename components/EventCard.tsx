interface EventCardProps {
  id: string
  title: string
  date: string
  time?: string
  location?: string
  description: string
  type?: 'discussion' | 'workshop' | 'speaker' | 'other'
}

export default function EventCard({ 
  title, 
  date, 
  time, 
  location, 
  description,
  type 
}: EventCardProps) {
  const typeColors = {
    discussion: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    speaker: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold font-serif text-charcoal">
          {title}
        </h3>
        {type && (
          <span className={`text-xs px-2 py-1 rounded ${typeColors[type] || typeColors.other}`}>
            {type}
          </span>
        )}
      </div>
      <div className="space-y-2 mb-4 text-sm text-charcoal-light">
        <p className="font-semibold text-charcoal">{date}</p>
        {time && <p>Time: {time}</p>}
        {location && <p>Location: {location}</p>}
      </div>
      <p className="text-charcoal-light">{description}</p>
    </div>
  )
}

