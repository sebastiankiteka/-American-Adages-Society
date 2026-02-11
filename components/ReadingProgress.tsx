'use client'

import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const scrolled = scrollTop / scrollableHeight
      setProgress(Math.min(100, Math.max(0, scrolled * 100)))
    }

    window.addEventListener('scroll', updateProgress)
    updateProgress() // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  if (progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-soft-gray">
      <div
        className="h-full bg-bronze transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  )
}














