'use client'

import { useEffect, useState } from 'react'

// Renders the current date only after mount. Server sends an empty span so no
// static or cached date (e.g. February 11, 2026) can appear in the initial HTML.
export default function CurrentDate() {
  const [date, setDate] = useState('')

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    setDate(today)
  }, [])

  return <span>{date}</span>
}
