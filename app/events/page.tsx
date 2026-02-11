'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/EventCard'
import EventCalendar from '@/components/EventCalendar'
import { Event } from '@/lib/db-types'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

function generateICalLink(event: Event & { date?: string; time?: string }) {
  const eventDate = event.date || event.event_date
  const startDate = new Date(eventDate + ' ' + (event.time?.split(' - ')[0] || '12:00 PM'))
  const endDate = new Date(eventDate + ' ' + (event.time?.split(' - ')[1] || '1:00 PM'))
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//American Adages Society//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location || 'TBA'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return 'data:text/calendar;charset=utf8,' + encodeURIComponent(icalContent)
}

export default function Events() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPastEvents, setShowPastEvents] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        
        // Fetch upcoming events
        const upcomingResponse = await fetch('/api/events?upcoming=true')
        const upcomingResult: ApiResponse<Event[]> = await upcomingResponse.json()
        
        // Fetch past events
        const pastResponse = await fetch('/api/events?past=true&limit=20')
        const pastResult: ApiResponse<Event[]> = await pastResponse.json()
        
        if (upcomingResult.success && upcomingResult.data) {
          setUpcomingEvents(upcomingResult.data)
        }
        
        if (pastResult.success && pastResult.data) {
          // Sort past events by date descending (most recent first)
          const sorted = pastResult.data.sort((a, b) => 
            new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
          )
          setPastEvents(sorted)
        }
        
        if (!upcomingResult.success && !pastResult.success) {
          setError(upcomingResult.error || pastResult.error || 'Failed to load events')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const allEvents = [...upcomingEvents, ...pastEvents]
  const eventTypes = Array.from(new Set(allEvents.map((e) => e.event_type).filter(Boolean))) as string[]

  const filterEvents = (events: Event[]) => {
    return events.filter((event) => {
      if (selectedType === null) return true
      return event.event_type === selectedType
    })
  }

  const filteredUpcoming = filterEvents(upcomingEvents)
  const filteredPast = filterEvents(pastEvents)

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Events & Calendar
          </h1>
          <p className="text-lg text-text-primary max-w-2xl mx-auto">
            Join us for discussions, workshops, guest speakers, and creative 
            explorations of language and wisdom. All events are open to the public.
          </p>
        </div>

        {/* Visual Calendar */}
        <EventCalendar events={allEvents} />

        {/* Filter by Event Type */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === null
                    ? 'bg-accent-primary text-text-inverse'
                    : 'bg-card-bg text-text-primary border border-border-medium hover:border-accent-primary'
                }`}
            >
              All Events
            </button>
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-accent-primary text-text-inverse'
                    : 'bg-card-bg text-text-primary border border-border-medium hover:border-accent-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Upcoming Events
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-metadata">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-card-bg rounded-lg border border-error-text/30">
              <p className="text-error-text">Error loading events: {error}</p>
            </div>
          ) : filteredUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filteredUpcoming.map((event) => {
              const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
              const googleStartDate = new Date(event.event_date).toISOString().replace(/[-:]/g, '').split('.')[0]
              const googleEndDate = event.end_date 
                ? new Date(event.end_date).toISOString().replace(/[-:]/g, '').split('.')[0]
                : new Date(new Date(event.event_date).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]

              return (
                <div key={event.id}>
                  <EventCard 
                    id={event.id}
                    title={event.title}
                    date={eventDate}
                    description={event.description || ''}
                    location={event.location}
                    type={event.event_type}
                  />
                  <div className="mt-4 flex gap-2">
                    <a
                      href={generateICalLink({ ...event, date: eventDate })}
                      download={`${event.title.replace(/\s+/g, '-')}.ics`}
                      className="text-sm px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors"
                    >
                      Download iCal
                    </a>
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${googleStartDate}/${googleEndDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors"
                    >
                      Add to Google Calendar
                    </a>
                  </div>
                </div>
              )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-card-bg rounded-lg border border-border-medium">
              <p className="text-lg text-text-primary">
                No upcoming events found{selectedType ? ` matching "${selectedType}"` : ''}.
              </p>
            </div>
          )}
        </section>

        {/* Past Events */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-serif text-text-primary">
              Past Events
            </h2>
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors text-sm"
            >
              {showPastEvents ? 'Hide' : 'Show'} Past Events
            </button>
          </div>
          
          {showPastEvents && (
            <>
              {filteredPast.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {filteredPast.map((event) => {
                    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    const googleStartDate = new Date(event.event_date).toISOString().replace(/[-:]/g, '').split('.')[0]
                    const googleEndDate = event.end_date 
                      ? new Date(event.end_date).toISOString().replace(/[-:]/g, '').split('.')[0]
                      : new Date(new Date(event.event_date).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]

                    return (
                      <div key={event.id} className="opacity-75">
                        <EventCard 
                          id={event.id}
                          title={event.title}
                          date={eventDate}
                          description={event.description || ''}
                          location={event.location}
                          type={event.event_type}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-card-bg rounded-lg border border-border-medium">
                  <p className="text-lg text-text-primary">
                    No past events found{selectedType ? ` matching "${selectedType}"` : ''}.
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Subscribe Section */}
        <div className="mt-12 bg-card-bg p-8 rounded-lg border border-border-medium">
          <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">
            Stay Updated
          </h2>
          <p className="text-text-secondary mb-6">
            Never miss an event! Join our mailing list to receive updates about 
            upcoming discussions, workshops, and special events.
          </p>
          <a
            href="/get-involved"
            className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
          >
            Join Mailing List
          </a>
        </div>
      </div>
    </div>
  )
}
