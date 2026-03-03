'use client'

// Renders the current date in the user's locale. Used on the homepage so the date
// is always correct (client-side), avoiding static build or cache showing an old date.
export default function CurrentDate() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return <span>{today}</span>
}
