'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Adage } from '@/lib/db-types'
import { format } from 'date-fns'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface FeaturedAdage extends Adage {
  featured_reason?: string
  featured_dates?: Array<{
    featured_from: string
    featured_until?: string
    reason?: string
  }>
}

export default function WeeklyAdage() {
  const [adages, setAdages] = useState<FeaturedAdage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedAdages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/adages/featured?limit=3')
        const result: ApiResponse<FeaturedAdage[]> = await response.json()

        if (result.success && result.data && result.data.length > 0) {
          setAdages(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch featured adages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedAdages()
  }, [])

  if (loading || adages.length === 0) {
    return null // Don't show anything if loading or no featured adages
  }

  const adage = adages[currentIndex]
  const isStillFeatured = !adage.featured_until || new Date(adage.featured_until) > new Date()

  if (!isStillFeatured) {
    return null
  }

  const nextAdage = () => {
    setCurrentIndex((prev) => (prev + 1) % adages.length)
  }

  const prevAdage = () => {
    setCurrentIndex((prev) => (prev - 1 + adages.length) % adages.length)
  }

  return (
    <section className="relative py-16 px-4 bg-gradient-to-br from-bronze/10 via-cream to-bronze/5 overflow-hidden">
      {/* Decorative border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-bronze to-transparent"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139,115,85,0.1) 2px, rgba(139,115,85,0.1) 4px)`,
        }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-2 bg-accent-primary text-text-inverse rounded-full text-sm font-semibold mb-4">
            Weekly Featured Adage
          </span>
          {adage.featured_dates && adage.featured_dates.length > 0 && (
            <div className="mt-2 text-sm text-text-secondary">
              {adage.featured_dates[0] && (
                <p className="italic">
                  Featured: {format(new Date(adage.featured_dates[0].featured_from), 'MMM d, yyyy')}
                  {adage.featured_dates[0].featured_until && ` - ${format(new Date(adage.featured_dates[0].featured_until), 'MMM d, yyyy')}`}
                  {!adage.featured_dates[0].featured_until && ' (ongoing)'}
                </p>
              )}
              {adage.featured_dates.length > 1 && (
                <p className="text-xs mt-1">
                  Previously: {adage.featured_dates.slice(1, 4).map((date, idx) => (
                    <span key={idx}>
                      {idx > 0 && ', '}
                      {format(new Date(date.featured_from), 'MMM d, yyyy')}
                      {date.featured_until && ` - ${format(new Date(date.featured_until), 'MMM d, yyyy')}`}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card-bg p-8 md:p-12 rounded-lg shadow-lg border-2 border-accent-primary/30 dark:border-accent-primary/50 relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full"></div>
          
          {/* Navigation arrows for rotation */}
          {adages.length > 1 && (
            <>
              <button
                onClick={prevAdage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-accent-primary/20 hover:bg-accent-primary/40 text-accent-primary rounded-full p-2 transition-colors z-10"
                aria-label="Previous featured adage"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextAdage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-accent-primary/20 hover:bg-accent-primary/40 text-accent-primary rounded-full p-2 transition-colors z-10"
                aria-label="Next featured adage"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-text-primary text-center">
              "{adage.adage}"
            </h2>
            
            <p className="text-lg text-text-secondary mb-6 text-center leading-relaxed">
              {adage.definition}
            </p>

            {adage.featured_reason && (
              <p className="text-sm text-accent-primary italic text-center mb-2 px-4">
                Featured: {adage.featured_reason}
              </p>
            )}
            {adage.featured_until && (
              <p className="text-xs text-text-secondary text-center mb-4 px-4">
                Featured until {format(new Date(adage.featured_until), 'MMM d, yyyy')}
              </p>
            )}

            {adage.origin && (
              <p className="text-sm text-accent-primary italic text-center mb-6">
                {adage.origin}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {adage.tags && adage.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-card-bg-muted border border-border-subtle text-text-secondary rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="text-center space-y-3">
              <Link
                href={`/archive/${adage.id}`}
                className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
              >
                Explore This Adage →
              </Link>
              <div>
                <Link
                  href="/featured-calendar"
                  className="text-sm text-text-secondary hover:text-accent-primary underline"
                >
                  View Featured Calendar
                </Link>
              </div>
            </div>
          </div>

          {/* Dots indicator for rotation */}
          {adages.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {adages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-accent-primary' : 'bg-accent-primary/30'
                  }`}
                  aria-label={`Go to featured adage ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


