'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link. Please check your email and try again.')
        return
      }

      try {
        const response = await fetch('/api/users/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        })

        const result: ApiResponse = await response.json()

        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Your email has been verified successfully!')
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Verification failed. The link may have expired.')
        }
      } catch (err: any) {
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

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
                Verifying Email...
              </h1>
              <p className="text-charcoal-light">
                Please wait while we verify your email address.
              </p>
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
                Email Verified!
              </h1>
              <p className="text-charcoal-light mb-4">
                {message}
              </p>
              <p className="text-sm text-charcoal-light">
                Redirecting to login page...
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
                Verification Failed
              </h1>
              <p className="text-charcoal-light mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium text-center"
                >
                  Go to Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors text-center"
                >
                  Register Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
          <div className="text-center">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bronze mx-auto"></div>
            </div>
            <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

