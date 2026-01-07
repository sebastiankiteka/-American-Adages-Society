'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfDay, isAfter, isBefore } from 'date-fns'

interface FeaturedHistory {
  id: string
  adage_id: string
  featured_from: string
  featured_until?: string
  reason?: string
  adage: {
    id: string
    adage: string
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function FeaturedCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [featuredHistory, setFeaturedHistory] = useState<FeaturedHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchFeaturedHistory()
  }, [])

  const fetchFeaturedHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/featured-adages/calendar')
      const result: ApiResponse<FeaturedHistory[]> = await response.json()

      if (result.success && result.data) {
        setFeaturedHistory(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch featured history:', err)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get featured adages for a specific date
  const getFeaturedForDate = (date: Date) => {
    const dateStart = startOfDay(date)
    const today = startOfDay(new Date())
    return featuredHistory.filter((item) => {
      const from = startOfDay(parseISO(item.featured_from))
      // Cap featured display at 7 days from featured_from
      const maxUntil = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000)
      const until = item.featured_until 
        ? startOfDay(parseISO(item.featured_until)) 
        : today
      // Use the earlier of the actual until date or 7 days from start
      const effectiveUntil = until.getTime() < maxUntil.getTime() ? until : startOfDay(maxUntil)
      
      // Check if date falls within the featured range (inclusive, max 7 days)
      return (isAfter(dateStart, from) || dateStart.getTime() === from.getTime()) && 
             (isBefore(dateStart, effectiveUntil) || dateStart.getTime() === effectiveUntil.getTime())
    })
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif mb-4 text-text-primary">
            Featured Adages Calendar
          </h1>
          <p className="text-lg text-text-secondary">
            View which adages were featured on each day
          </p>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPreviousMonth}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-text-primary">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={goToNextMonth}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors"
            >
              Next →
            </button>
          </div>
          <div className="text-center mb-4">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm"
            >
              Go to Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-text-secondary text-sm py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            {daysInMonth.map((day) => {
              const featured = getFeaturedForDate(day)
              const isToday = isSameDay(day, new Date())
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                    isToday
                      ? 'border-accent-primary bg-accent-primary/20'
                      : isSelected
                      ? 'border-accent-primary bg-accent-primary/10'
                      : featured.length > 0
                      ? 'border-accent-primary/50 bg-accent-primary/10 hover:bg-accent-primary/20'
                      : 'border-border-medium hover:border-accent-primary/30'
                  }`}
                >
                  <div className="text-sm font-medium text-text-primary mb-1">
                    {format(day, 'd')}
                  </div>
                  {featured.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-accent-primary font-semibold leading-tight">
                        {featured.length} featured
                      </div>
                      {featured.length === 1 && featured[0].adage && (
                        <div className="text-[9px] text-text-secondary leading-tight line-clamp-1">
                          "{featured[0].adage.adage}"
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
            <h3 className="text-2xl font-bold font-serif mb-4 text-text-primary">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {getFeaturedForDate(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getFeaturedForDate(selectedDate).map((item) => (
                  <div key={item.id} className="border-l-4 border-accent-primary pl-4 py-2">
                    <Link
                      href={`/archive/${item.adage_id}`}
                      className="text-xl font-bold text-accent-primary hover:underline mb-2 block"
                    >
                      "{item.adage.adage}"
                    </Link>
                    {item.reason && (
                      <p className="text-sm text-text-secondary mb-2">
                        <span className="font-semibold">Reason:</span> {item.reason}
                      </p>
                    )}
                    <p className="text-xs text-text-metadata">
                      Featured from {format(parseISO(item.featured_from), 'MMM d, yyyy')}
                      {item.featured_until && ` until ${format(parseISO(item.featured_until), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-primary">No adages were featured on this date.</p>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/archive"
            className="text-accent-primary hover:underline"
          >
            ← Back to Archive
          </Link>
        </div>
      </div>
    </div>
  )
}

