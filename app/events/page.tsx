'use client'

import { useState, useEffect } from 'react'
import EventCard from '@/components/EventCard'
import { getEvents, type Event } from '@/lib/adminData'

function generateICalLink(event: Event) {
  const startDate = new Date(event.date + ' ' + (event.time?.split(' - ')[0] || '12:00 PM'))
  const endDate = new Date(event.date + ' ' + (event.time?.split(' - ')[1] || '1:00 PM'))
  
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
  const [sampleEvents, setSampleEvents] = useState<Event[]>(getEvents())

  useEffect(() => {
    const refreshEvents = () => {
      setSampleEvents(getEvents())
    }
    refreshEvents()
    window.addEventListener('storage', refreshEvents)
    return () => window.removeEventListener('storage', refreshEvents)
  }, [])

  const eventTypes = Array.from(new Set(sampleEvents.map((e) => e.type).filter(Boolean))) as string[]

  const filteredEvents = sampleEvents.filter((event) => {
    if (selectedType === null) return true
    return event.type === selectedType
  })

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-charcoal">
            Events & Calendar
          </h1>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Join us for discussions, workshops, guest speakers, and creative 
            explorations of language and wisdom. All events are open to the public.
          </p>
        </div>

        {/* Filter by Event Type */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === null
                  ? 'bg-bronze text-cream'
                  : 'bg-white text-charcoal border border-soft-gray hover:border-bronze'
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
                    ? 'bg-bronze text-cream'
                    : 'bg-white text-charcoal border border-soft-gray hover:border-bronze'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredEvents.map((event) => (
            <div key={event.id}>
              <EventCard {...event} />
              <div className="mt-4 flex gap-2">
                <a
                  href={generateICalLink(event)}
                  download={`${event.title.replace(/\s+/g, '-')}.ics`}
                  className="text-sm px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors"
                >
                  Download iCal
                </a>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.date + ' ' + (event.time?.split(' - ')[0] || '12:00 PM')).toISOString().replace(/[-:]/g, '').split('.')[0]}/${new Date(event.date + ' ' + (event.time?.split(' - ')[1] || '1:00 PM')).toISOString().replace(/[-:]/g, '').split('.')[0]}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors"
                >
                  Add to Google Calendar
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-soft-gray">
            <p className="text-lg text-charcoal-light">
              No events found matching your filter.
            </p>
          </div>
        )}

        {/* Subscribe Section */}
        <div className="mt-12 bg-white p-8 rounded-lg border border-soft-gray">
          <h2 className="text-2xl font-bold font-serif mb-4 text-charcoal">
            Stay Updated
          </h2>
          <p className="text-charcoal-light mb-6">
            Never miss an event! Join our mailing list to receive updates about 
            upcoming discussions, workshops, and special events.
          </p>
          <a
            href="/get-involved"
            className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
          >
            Join Mailing List
          </a>
        </div>
      </div>
    </div>
  )
}
