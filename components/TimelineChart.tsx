'use client'

import { AdageTimeline } from '@/lib/db-types'
import { format } from 'date-fns'

interface TimelineChartProps {
  timeline: AdageTimeline[]
}

const popularityLevels = {
  rare: { value: 1, color: 'bg-gray-400', label: 'Rare' },
  uncommon: { value: 2, color: 'bg-orange-400', label: 'Uncommon' },
  common: { value: 3, color: 'bg-yellow-400', label: 'Common' },
  very_common: { value: 4, color: 'bg-blue-400', label: 'Very Common' },
  ubiquitous: { value: 5, color: 'bg-green-400', label: 'Ubiquitous' },
} as const

export default function TimelineChart({ timeline }: TimelineChartProps) {
  if (!timeline || timeline.length === 0) {
    return null
  }

  // Sort timeline by start date
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(a.time_period_start).getTime() - new Date(b.time_period_start).getTime()
  )

  // Get date range
  const earliestDate = new Date(sortedTimeline[0].time_period_start)
  const latestEntry = sortedTimeline[sortedTimeline.length - 1]
  const latestDate = latestEntry.time_period_end 
    ? new Date(latestEntry.time_period_end) 
    : new Date()

  // Calculate total time span in years
  const totalYears = latestDate.getFullYear() - earliestDate.getFullYear() + 1
  const currentYear = new Date().getFullYear()

  // Create year markers
  const yearMarkers: number[] = []
  for (let year = earliestDate.getFullYear(); year <= latestDate.getFullYear(); year += Math.max(1, Math.floor(totalYears / 10))) {
    yearMarkers.push(year)
  }
  if (!yearMarkers.includes(latestDate.getFullYear())) {
    yearMarkers.push(latestDate.getFullYear())
  }

  // Calculate positions for each period
  const getPosition = (date: Date) => {
    const yearsFromStart = date.getFullYear() - earliestDate.getFullYear()
    return (yearsFromStart / totalYears) * 100
  }

  const getWidth = (start: Date, end: Date | undefined) => {
    if (!end) {
      // If no end date, extend to current year or latest date
      const endDate = latestDate
      const yearsSpan = endDate.getFullYear() - start.getFullYear() + 1
      return (yearsSpan / totalYears) * 100
    }
    const yearsSpan = end.getFullYear() - start.getFullYear() + 1
    return (yearsSpan / totalYears) * 100
  }

  return (
    <div className="w-full">
      <div className="relative rounded-lg border border-border-medium bg-card-bg p-6">
        {/* Timeline Bar */}
        <div className="relative mb-8 h-32">
          {/* Year markers */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-border-medium/80 dark:bg-border-medium" />
          {yearMarkers.map((year) => {
            const position = getPosition(new Date(year, 0, 1))
            return (
              <div
                key={year}
                className="absolute top-0 -translate-x-1/2 transform"
                style={{ left: `${position}%` }}
              >
                <div className="h-4 w-0.5 bg-text-primary/70" />
                <div className="mt-1 -translate-x-1/2 transform whitespace-nowrap text-xs text-text-metadata">
                  {year}
                </div>
              </div>
            )
          })}

          {/* Timeline periods */}
          {sortedTimeline.map((period, idx) => {
            const startDate = new Date(period.time_period_start)
            const endDate = period.time_period_end ? new Date(period.time_period_end) : latestDate
            const left = getPosition(startDate)
            const width = getWidth(startDate, endDate)
            const level = popularityLevels[period.popularity_level]

            return (
              <div
                key={period.id}
                className="absolute top-4 rounded-lg border-2 border-card-bg shadow-sm dark:border-border-medium"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  height: '80px',
                }}
              >
                <div className={`h-full ${level.color} rounded-lg flex flex-col justify-center items-center p-2 relative group`}>
                  <div className="text-xs font-semibold text-white text-center mb-1">
                    {level.label}
                  </div>
                  <div className="text-xs text-white/90 text-center">
                    {format(startDate, 'yyyy')}
                    {period.time_period_end && ` - ${format(endDate, 'yyyy')}`}
                    {!period.time_period_end && ' - Present'}
                  </div>
                  {period.primary_location && (
                    <div className="mt-1 w-full truncate px-1 text-center text-xs text-white/80" title={period.primary_location}>
                      {period.primary_location}
                    </div>
                  )}
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform group-hover:block">
                    <div className="max-w-xs rounded-lg border border-border-medium bg-card-bg px-3 py-2 text-xs text-text-primary shadow-lg">
                      <div className="mb-1 font-semibold">{level.label}</div>
                      {period.primary_location && (
                        <div className="mt-1 text-text-secondary">
                          <span className="font-semibold">Location:</span> {period.primary_location}
                        </div>
                      )}
                      {period.geographic_changes && (
                        <div className="mt-1 text-text-secondary">
                          <span className="font-semibold">Changes:</span> {period.geographic_changes}
                        </div>
                      )}
                      {period.notes && <div className="mt-1 max-w-xs text-text-secondary">{period.notes}</div>}
                      {period.sources && period.sources.length > 0 && (
                        <div className="mt-1 text-text-metadata">
                          Sources: {period.sources.length}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-1/2 translate-y-full -translate-x-1/2 transform">
                        <div className="border-4 border-transparent border-t-border-medium" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 border-t border-border-medium pt-4">
          {Object.entries(popularityLevels).map(([key, level]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded ${level.color}`} />
              <span className="text-sm text-text-metadata">{level.label}</span>
            </div>
          ))}
        </div>

        {/* Detailed list (collapsible) */}
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold text-accent-primary hover:text-accent-hover">
            View Detailed Timeline
          </summary>
          <div className="mt-4 space-y-3">
            {sortedTimeline.map((period) => {
              const level = popularityLevels[period.popularity_level]
              const startDate = new Date(period.time_period_start)
              const endDate = period.time_period_end ? new Date(period.time_period_end) : null

              const popularityBadge =
                period.popularity_level === 'ubiquitous'
                  ? 'bg-success-bg text-success-text dark:bg-green-900/35 dark:text-green-200'
                  : period.popularity_level === 'very_common'
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/35 dark:text-blue-200'
                    : period.popularity_level === 'common'
                      ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100'
                      : period.popularity_level === 'uncommon'
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-900/35 dark:text-orange-100'
                        : 'bg-card-bg-muted text-text-primary dark:bg-neutral-800 dark:text-neutral-200'

              return (
                <div
                  key={period.id}
                  className="rounded-lg border border-border-medium bg-card-bg-muted p-4 dark:bg-card-bg"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${level.color}`} />
                      <span className="text-sm font-semibold text-text-primary">
                        {format(startDate, 'yyyy')}
                        {endDate && ` - ${format(endDate, 'yyyy')}`}
                        {!endDate && ' - Present'}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${popularityBadge}`}>
                        {level.label}
                      </span>
                    </div>
                  </div>
                  {period.primary_location && (
                    <div className="mt-2">
                      <p className="mb-1 text-xs font-semibold text-text-metadata">Primary Location:</p>
                      <p className="text-sm text-text-primary">{period.primary_location}</p>
                    </div>
                  )}
                  {period.geographic_changes && (
                    <div className="mt-2">
                      <p className="mb-1 text-xs font-semibold text-text-metadata">Geographic Changes:</p>
                      <p className="text-sm text-text-primary">{period.geographic_changes}</p>
                    </div>
                  )}
                  {period.notes && (
                    <p className="mt-2 text-sm text-text-secondary">{period.notes}</p>
                  )}
                  {period.sources && period.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="mb-1 text-xs font-semibold text-text-metadata">Sources:</p>
                      <ul className="list-inside list-disc text-xs text-text-secondary">
                        {period.sources.map((source, idx) => (
                          <li key={idx}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </details>
      </div>
    </div>
  )
}

