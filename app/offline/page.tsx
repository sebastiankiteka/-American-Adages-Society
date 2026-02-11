import Link from 'next/link'

export default function Offline() {
  return (
    <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold font-serif text-charcoal mb-4">
          You're Offline
        </h1>
        <p className="text-lg text-charcoal-light mb-6">
          It looks like you're not connected to the internet. Some content may not be available.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}














