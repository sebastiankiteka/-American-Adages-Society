'use client'

import { useEffect, useState } from 'react'

const SHOW_AFTER_PX = 300

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border-medium bg-card-bg text-text-primary shadow-md transition-colors hover:bg-card-bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary md:bottom-28"
      aria-label="Scroll to top"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
