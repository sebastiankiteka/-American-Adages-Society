'use client'

// Client-side page view tracker
// This component should be included in the root layout to track all page visits
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function PageViewTracker() {
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Don't track admin pages or API routes
    if (pathname?.startsWith('/api') || pathname?.startsWith('/admin')) {
      return
    }

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/track-page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof document !== 'undefined' ? document.referrer || null : null,
          }),
        })
      } catch (error) {
        // Silently fail - don't break the page if tracking fails
        console.error('Failed to track page view:', error)
      }
    }

    // Small delay to ensure page is loaded
    const timeoutId = setTimeout(trackPageView, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null // This component doesn't render anything
}

