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
    discussion: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    workshop: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    speaker: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    other: 'bg-card-bg-muted text-text-metadata',
  }

  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold font-serif text-text-primary">
          {title}
        </h3>
        {type && (
          <span className={`text-xs px-2 py-1 rounded ${typeColors[type] || typeColors.other}`}>
            {type}
          </span>
        )}
      </div>
      <div className="space-y-2 mb-4 text-sm text-text-metadata">
        <p className="font-semibold text-text-primary">{date}</p>
        {time && <p>Time: {time}</p>}
        {location && <p>Location: {location}</p>}
      </div>
      <p className="text-text-primary">{description}</p>
    </div>
  )
}

