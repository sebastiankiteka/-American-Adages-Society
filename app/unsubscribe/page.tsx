'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const email = searchParams.get('email')

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus('error')
        setMessage('Invalid unsubscribe link. Please check your email.')
        return
      }

      try {
        const response = await fetch('/api/mailing-list/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        const result: ApiResponse = await response.json()

        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'You have been successfully unsubscribed from our mailing list.')
        } else {
          setStatus('error')
          setMessage(result.error || 'Failed to unsubscribe. Please try again or contact us.')
        }
      } catch (err: any) {
        setStatus('error')
        setMessage('An error occurred. Please try again or contact us.')
      }
    }

    unsubscribe()
  }, [email])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bronze mx-auto"></div>
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
                Unsubscribing...
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
                Unsubscribed
              </h1>
              <p className="text-charcoal-light mb-4">
                {message}
              </p>
              <p className="text-sm text-charcoal-light">
                You can resubscribe at any time by visiting our{' '}
                <a href="/get-involved" className="text-bronze hover:underline">
                  Get Involved
                </a>{' '}
                page.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
                Error
              </h1>
              <p className="text-charcoal-light mb-6">
                {message}
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
              >
                Contact Us
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Unsubscribe() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-charcoal">Loading...</p>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}



