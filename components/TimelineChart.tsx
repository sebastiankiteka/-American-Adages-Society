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
      <div className="relative bg-cream p-6 rounded-lg border border-soft-gray">
        {/* Timeline Bar */}
        <div className="relative h-32 mb-8">
          {/* Year markers */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-charcoal/20"></div>
          {yearMarkers.map((year) => {
            const position = getPosition(new Date(year, 0, 1))
            return (
              <div
                key={year}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                <div className="w-0.5 h-4 bg-charcoal"></div>
                <div className="text-xs text-charcoal-light mt-1 whitespace-nowrap transform -translate-x-1/2">
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
                className="absolute top-4 rounded-lg border-2 border-white shadow-sm"
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
                    <div className="text-xs text-white/80 text-center mt-1 truncate w-full px-1" title={period.primary_location}>
                      📍 {period.primary_location}
                    </div>
                  )}
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-charcoal text-cream text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
                      <div className="font-semibold mb-1">{level.label}</div>
                      {period.primary_location && (
                        <div className="mt-1 text-cream/90">
                          <span className="font-semibold">Location:</span> {period.primary_location}
                        </div>
                      )}
                      {period.geographic_changes && (
                        <div className="mt-1 text-cream/90">
                          <span className="font-semibold">Changes:</span> {period.geographic_changes}
                        </div>
                      )}
                      {period.notes && <div className="mt-1 max-w-xs">{period.notes}</div>}
                      {period.sources && period.sources.length > 0 && (
                        <div className="mt-1 text-cream/80">
                          Sources: {period.sources.length}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-charcoal"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mt-4 pt-4 border-t border-soft-gray">
          {Object.entries(popularityLevels).map(([key, level]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${level.color}`}></div>
              <span className="text-sm text-charcoal-light">{level.label}</span>
            </div>
          ))}
        </div>

        {/* Detailed list (collapsible) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-bronze hover:text-bronze/80 font-semibold">
            View Detailed Timeline
          </summary>
          <div className="mt-4 space-y-3">
            {sortedTimeline.map((period) => {
              const level = popularityLevels[period.popularity_level]
              const startDate = new Date(period.time_period_start)
              const endDate = period.time_period_end ? new Date(period.time_period_end) : null

              return (
                <div key={period.id} className="bg-white p-4 rounded-lg border border-soft-gray">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                      <span className="text-sm font-semibold text-charcoal">
                        {format(startDate, 'yyyy')}
                        {endDate && ` - ${format(endDate, 'yyyy')}`}
                        {!endDate && ' - Present'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        period.popularity_level === 'ubiquitous' ? 'bg-green-100 text-green-800' :
                        period.popularity_level === 'very_common' ? 'bg-blue-100 text-blue-800' :
                        period.popularity_level === 'common' ? 'bg-yellow-100 text-yellow-800' :
                        period.popularity_level === 'uncommon' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {level.label}
                      </span>
                    </div>
                  </div>
                  {period.primary_location && (
                    <div className="mt-2">
                      <p className="text-xs text-charcoal-light font-semibold mb-1">Primary Location:</p>
                      <p className="text-sm text-charcoal">{period.primary_location}</p>
                    </div>
                  )}
                  {period.geographic_changes && (
                    <div className="mt-2">
                      <p className="text-xs text-charcoal-light font-semibold mb-1">Geographic Changes:</p>
                      <p className="text-sm text-charcoal">{period.geographic_changes}</p>
                    </div>
                  )}
                  {period.notes && (
                    <p className="text-sm text-charcoal-light mt-2">{period.notes}</p>
                  )}
                  {period.sources && period.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-charcoal-light font-semibold mb-1">Sources:</p>
                      <ul className="text-xs text-charcoal-light list-disc list-inside">
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

