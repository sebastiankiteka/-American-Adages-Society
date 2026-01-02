import Link from 'next/link'
import { adages } from '@/lib/data'

export default function AdageDetail({ params }: { params: { id: string } }) {
  const adage = adages.find(a => a.id === params.id)

  if (!adage) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/archive"
            className="text-bronze hover:text-bronze/80 mb-6 inline-block"
          >
            ← Back to Archive
          </Link>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h1 className="text-4xl font-bold font-serif mb-6 text-charcoal">
              Adage Not Found
            </h1>
            <p className="text-charcoal-light">
              The adage you're looking for doesn't exist in our archive.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/archive"
          className="text-bronze hover:text-bronze/80 mb-6 inline-block"
        >
          ← Back to Archive
        </Link>
        
        <article className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-charcoal">
            "{adage.adage}"
          </h1>

          <div className="prose prose-lg max-w-none text-charcoal-light space-y-6">
            <section>
              <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Definition</h2>
              <p className="text-lg leading-relaxed">{adage.definition}</p>
            </section>

            {adage.origin && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Origin</h2>
                <p className="text-lg leading-relaxed">{adage.origin}</p>
              </section>
            )}

            {adage.etymology && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Etymology</h2>
                <p className="text-lg leading-relaxed">{adage.etymology}</p>
              </section>
            )}

            {adage.historicalContext && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Historical Context</h2>
                <p className="text-lg leading-relaxed">{adage.historicalContext}</p>
              </section>
            )}

            {adage.interpretation && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Interpretation</h2>
                <p className="text-lg leading-relaxed">{adage.interpretation}</p>
              </section>
            )}

            {adage.modernPracticality && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Modern Practicality</h2>
                <p className="text-lg leading-relaxed">{adage.modernPracticality}</p>
              </section>
            )}

            {adage.tags && adage.tags.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {adage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-soft-gray text-charcoal-light rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
