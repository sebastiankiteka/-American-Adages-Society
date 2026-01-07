'use client'

import { useEffect } from 'react'
import { Event } from '@/lib/db-types'
import { format, isValid } from 'date-fns'

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

function generateICalLink(event: Event) {
  try {
    const eventDate = new Date(event.event_date)
    if (!isValid(eventDate)) {
      console.error('Invalid event_date:', event.event_date)
      return '#'
    }

    let startDate = new Date(eventDate)
    let endDate = event.end_date ? new Date(event.end_date) : new Date(eventDate.getTime() + 60 * 60 * 1000)

    const formatDate = (date: Date) => {
      if (!isValid(date)) {
        console.error('Invalid date in formatDate:', date)
        return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }
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
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || 'TBA'}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    return 'data:text/calendar;charset=utf8,' + encodeURIComponent(icalContent)
  } catch (error) {
    console.error('Error generating iCal link:', error)
    return '#'
  }
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !event) return null

  const eventDate = new Date(event.event_date)
  const isValidDate = isValid(eventDate)
  const formattedDate = isValidDate ? format(eventDate, 'EEEE, MMMM d, yyyy') : 'Date TBA'
  
  let googleStartDate = ''
  let googleEndDate = ''
  if (isValidDate) {
    googleStartDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]
    googleEndDate = event.end_date && isValid(new Date(event.end_date))
      ? new Date(event.end_date).toISOString().replace(/[-:]/g, '').split('.')[0]
      : new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-soft-gray p-4 flex justify-between items-start">
          <h2 className="text-2xl font-bold font-serif text-charcoal pr-4">
            {event.title}
          </h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {event.event_type && (
            <span className="inline-block px-3 py-1 bg-bronze/20 text-bronze rounded-full text-sm font-medium mb-4 capitalize">
              {event.event_type}
            </span>
          )}

          <div className="flex flex-wrap gap-4 text-charcoal-light mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{formattedDate}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="prose prose-lg max-w-none text-charcoal-light mb-6">
              <div className="whitespace-pre-line">{event.description}</div>
            </div>
          )}

          {event.end_date && event.end_date !== event.event_date && isValid(new Date(event.end_date)) && (
            <div className="bg-cream p-4 rounded-lg border border-soft-gray mb-6">
              <p className="text-sm text-charcoal-light">
                <strong>End Date:</strong> {format(new Date(event.end_date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-6 border-t border-soft-gray">
            <a
              href={generateICalLink(event)}
              download={`${event.title.replace(/\s+/g, '-')}.ics`}
              className="px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Download iCal
            </a>
            {googleStartDate && (
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${googleStartDate}/${googleEndDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Add to Google Calendar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



