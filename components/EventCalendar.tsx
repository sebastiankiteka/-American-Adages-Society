'use client'

import { useState } from 'react'
import { Event } from '@/lib/db-types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, parse, isValid } from 'date-fns'
import EventModal from './EventModal'

interface EventCalendarProps {
  events: Event[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dateSearch, setDateSearch] = useState('')
  const [searchError, setSearchError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Get first day of week (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = getDay(monthStart)
  
  // Create array with empty cells for days before month starts
  const emptyDays = Array(firstDayOfWeek).fill(null)
  
  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const eventDate = format(new Date(event.event_date), 'yyyy-MM-dd')
    if (!acc[eventDate]) {
      acc[eventDate] = []
    }
    acc[eventDate].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
    setDateSearch('')
    setSearchError('')
  }

  const handleDateSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    
    if (!dateSearch.trim()) {
      return
    }

    // Try multiple date formats
    const dateFormats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'MM-dd-yyyy',
      'MMMM d, yyyy',
      'MMM d, yyyy',
      'd MMMM yyyy',
      'd MMM yyyy',
    ]

    let parsedDate: Date | null = null
    for (const dateFormat of dateFormats) {
      try {
        const parsed = parse(dateSearch.trim(), dateFormat, new Date())
        if (isValid(parsed)) {
          parsedDate = parsed
          break
        }
      } catch {
        continue
      }
    }

    // Also try just parsing as-is
    if (!parsedDate) {
      const directParse = new Date(dateSearch.trim())
      if (isValid(directParse)) {
        parsedDate = directParse
      }
    }

    if (parsedDate) {
      setCurrentMonth(parsedDate)
      setDateSearch('')
    } else {
      setSearchError('Invalid date format. Try: YYYY-MM-DD, MM/DD/YYYY, or "January 15, 2024"')
    }
  }

  const isToday = (day: Date) => {
    return isSameDay(day, new Date())
  }

  const isPast = (day: Date) => {
    return day < new Date() && !isToday(day)
  }

  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-card-bg rounded-lg shadow-sm border border-border-medium p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold font-serif text-text-primary">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Date Search */}
          <form onSubmit={handleDateSearch} className="flex gap-2">
            <input
              type="text"
              value={dateSearch}
              onChange={(e) => {
                setDateSearch(e.target.value)
                setSearchError('')
              }}
              placeholder="Search date (e.g., 2024-01-15)"
              className="px-3 py-1 border border-border-subtle rounded-lg focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary text-sm flex-1 min-w-[150px]"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm whitespace-nowrap"
            >
              Go
            </button>
          </form>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 bg-bg-secondary text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 bg-bg-secondary text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors text-sm"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-bg-secondary text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {searchError && (
        <div className="mb-4 p-2 bg-error-bg border border-error-text/30 text-error-text rounded text-sm">
          {searchError}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-text-secondary py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isTodayDate = isToday(day)
          const isPastDate = isPast(day)

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square border border-border-subtle rounded-lg p-1 ${
                isTodayDate
                  ? 'bg-accent-primary/20 border-accent-primary dark:border-accent-primary'
                  : isPastDate
                  ? 'bg-card-bg-muted opacity-60'
                  : 'bg-card-bg hover:bg-card-bg-muted'
              } transition-colors`}
            >
              <div className="flex flex-col h-full">
                <div
                  className={`text-xs font-medium mb-1 ${
                    isTodayDate
                      ? 'text-accent-primary font-bold'
                      : isPastDate
                      ? 'text-text-muted'
                      : 'text-text-primary'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="flex-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(event)
                        setIsModalOpen(true)
                      }}
                      className="block w-full text-left text-[10px] px-1 py-0.5 mb-0.5 bg-accent-primary/30 text-text-primary dark:text-text-primary rounded truncate hover:bg-accent-primary/50 transition-colors cursor-pointer"
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Show first event if more than 2
                        if (dayEvents[0]) {
                          setSelectedEvent(dayEvents[0])
                          setIsModalOpen(true)
                        }
                      }}
                      className="text-[10px] text-text-muted px-1 hover:text-text-primary cursor-pointer"
                    >
                      +{dayEvents.length - 2} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-primary/20 border border-accent-primary rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-primary/30 rounded"></div>
          <span>Event</span>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
      />
    </div>
  )
}

