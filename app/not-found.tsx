import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-bold font-serif text-charcoal mb-4">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-charcoal mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-charcoal-light mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
          >
            Go Home
          </Link>
          <Link
            href="/archive"
            className="px-6 py-3 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors font-medium"
          >
            Browse Archive
          </Link>
        </div>
      </div>
    </div>
  )
}














