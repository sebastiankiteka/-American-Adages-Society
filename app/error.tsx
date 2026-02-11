'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-charcoal mb-4">
          Something went wrong
        </h1>
        <p className="text-lg text-charcoal-light mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}














