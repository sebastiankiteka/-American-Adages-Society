'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Adage, AdageVariant, AdageTranslation, AdageTimeline, AdageUsageExample, Citation } from '@/lib/db-types'
import SaveAdageButton from '@/components/SaveAdageButton'
import CommentsSection from '@/components/CommentsSection'
import dynamic from 'next/dynamic'

const TimelineChart = dynamic(() => import('@/components/TimelineChart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-card-bg-muted rounded-lg animate-pulse" />
})
import ShareButtons from '@/components/ShareButtons'
import ReadingProgress from '@/components/ReadingProgress'
import { analytics } from '@/lib/analytics'
import { format } from 'date-fns'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface Commendation {
  id: string
  content: string
  user_id: string
  user?: {
    id: string
    username?: string
    display_name?: string
    profile_image_url?: string
  }
  created_at: string
  updated_at: string
}

interface ExtendedAdage extends Omit<Adage, 'first_known_usage_uncertain'> {
  variants?: AdageVariant[]
  translations?: AdageTranslation[]
  related?: Array<{ related_adage: Adage; relationship_type: string; notes?: string }>
  usageExamples?: Array<AdageUsageExample & { created_by_user?: { username?: string; display_name?: string } }>
  timeline?: AdageTimeline[]
  citations?: Array<Citation & { submitted_by_user?: { username?: string; display_name?: string } }>
  commendations?: Commendation[]
  first_known_usage?: string
  first_known_usage_date?: string
  first_known_usage_uncertain?: boolean
  geographic_spread?: string
}

export default function AdageDetail({ params }: { params: { id: string } }) {
  const [adage, setAdage] = useState<ExtendedAdage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAdage = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/adages/${params.id}`)
        const result: ApiResponse<ExtendedAdage> = await response.json()
        
        if (result.success && result.data) {
          setAdage(result.data)
          // Track adage view
          analytics.trackAdageView(result.data.id, result.data.adage)
        } else {
          setError(result.error || 'Adage not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load adage')
      } finally {
        setLoading(false)
      }
    }

    fetchAdage()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-card-bg-muted py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/archive"
            className="text-accent-primary hover:text-accent-primary/80 mb-6 inline-block"
          >
            ← Back to Archive
          </Link>
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
            <p className="text-text-secondary">Loading adage...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !adage) {
    return (
      <div className="min-h-screen bg-card-bg-muted py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/archive"
            className="text-accent-primary hover:text-accent-primary/80 mb-6 inline-block"
          >
            ← Back to Archive
          </Link>
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
            <h1 className="text-4xl font-bold font-serif mb-6 text-text-primary">
              Adage Not Found
            </h1>
            <p className="text-text-secondary">
              {error || "The adage you're looking for doesn't exist in our archive."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-card-bg-muted py-12 px-4">
      <ReadingProgress />
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/archive"
          className="text-accent-primary hover:text-accent-primary/80 mb-6 inline-block"
        >
          ← Back to Archive
        </Link>
        
              <article className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary mb-2">
                "{adage.adage}"
              </h1>
              <div className="flex items-center gap-4 flex-wrap text-sm text-text-secondary mb-2">
                {(adage as any).save_count !== undefined && (
                  <span>
                    Saved by {(adage as any).save_count} user{(adage as any).save_count !== 1 ? 's' : ''}
                  </span>
                )}
                {adage.created_at && (
                  <span>
                    Created: {format(new Date(adage.created_at), 'MMMM d, yyyy')}
                  </span>
                )}
                {adage.updated_at && adage.updated_at !== adage.created_at && (
                  <span>
                    Last updated: {format(new Date(adage.updated_at), 'MMMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4">
              <SaveAdageButton adageId={adage.id} />
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-border">
            <ShareButtons
              url={`/archive/${adage.id}`}
              title={`"${adage.adage}"`}
              description={adage.definition.substring(0, 100)}
            />
          </div>

          <div className="prose prose-lg max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Definition</h2>
              <p className="text-lg leading-relaxed">{adage.definition}</p>
            </section>

            {adage.origin && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Origin</h2>
                <p className="text-lg leading-relaxed">{adage.origin}</p>
              </section>
            )}

            {adage.etymology && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Etymology</h2>
                <p className="text-lg leading-relaxed">{adage.etymology}</p>
              </section>
            )}

            {adage.historical_context && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Historical Context</h2>
                <p className="text-lg leading-relaxed">{adage.historical_context}</p>
              </section>
            )}

            {adage.interpretation && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Interpretation</h2>
                <p className="text-lg leading-relaxed">{adage.interpretation}</p>
              </section>
            )}

            {adage.modern_practicality && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Modern Practicality</h2>
                <p className="text-lg leading-relaxed">{adage.modern_practicality}</p>
              </section>
            )}

            {adage.tags && adage.tags.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {adage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-card-bg-muted text-text-secondary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {adage.first_known_usage && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">
                  First Known Usage
                  {adage.first_known_usage_uncertain && (
                    <span className="ml-2 text-sm font-normal text-text-secondary">(uncertain)</span>
                  )}
                </h2>
                <p className="text-lg leading-relaxed">{adage.first_known_usage}</p>
                {adage.first_known_usage_date && (
                  <p className="text-sm text-text-secondary mt-2">
                    Date: {format(new Date(adage.first_known_usage_date), 'MMMM d, yyyy')}
                  </p>
                )}
              </section>
            )}

            {adage.geographic_spread && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Geographic & Cultural Spread</h2>
                <p className="text-lg leading-relaxed">{adage.geographic_spread}</p>
              </section>
            )}

            {adage.variants && adage.variants.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Variants</h2>
                <div className="space-y-3">
                  {adage.variants.map((variant) => (
                    <div key={variant.id} className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                      <p className="text-lg font-semibold text-text-primary italic">"{variant.variant_text}"</p>
                      {variant.notes && (
                        <p className="text-sm text-text-secondary mt-2">{variant.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {adage.translations && adage.translations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Translations</h2>
                <div className="space-y-3">
                  {adage.translations.map((translation) => (
                    <div key={translation.id} className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-accent-primary uppercase">
                          {translation.language_code}
                        </span>
                      </div>
                      <p className="text-lg text-text-primary italic">"{translation.translated_text}"</p>
                      {translation.translator_notes && (
                        <p className="text-sm text-text-secondary mt-2">{translation.translator_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {adage.timeline && adage.timeline.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Timeline of Popularity</h2>
                <TimelineChart timeline={adage.timeline} />
              </section>
            )}

            {adage.related && adage.related.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Related Adages</h2>
                <div className="space-y-3">
                  {adage.related.map((rel, idx) => (
                    <div key={rel.related_adage.id || idx} className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-accent-primary/20 text-accent-primary rounded">
                          {rel.relationship_type.replace('_', ' ')}
                        </span>
                      </div>
                      <Link
                        href={`/archive/${rel.related_adage.id}`}
                        className="block group"
                      >
                        <p className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors italic">
                          "{rel.related_adage.adage}"
                        </p>
                        <p className="text-sm text-text-secondary mt-1">{rel.related_adage.definition}</p>
                      </Link>
                      {rel.notes && (
                        <p className="text-sm text-text-secondary mt-2">{rel.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {adage.usageExamples && adage.usageExamples.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Usage Examples</h2>
                <div className="space-y-4">
                  {adage.usageExamples.map((example) => (
                    <div key={example.id} className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          example.source_type === 'official'
                            ? 'bg-accent-primary text-text-inverse'
                            : 'bg-card-bg-muted text-text-secondary'
                        }`}>
                          {example.source_type === 'official' ? 'Official' : 'Community'}
                        </span>
                        {example.created_by_user && (
                          <span className="text-xs text-text-secondary">
                            by {example.created_by_user.display_name || example.created_by_user.username || 'User'}
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-text-primary leading-relaxed">"{example.example_text}"</p>
                      {example.context && (
                        <p className="text-sm text-text-secondary mt-2 italic">Context: {example.context}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold font-serif text-text-primary mb-3">Sources & Citations</h2>
              {adage.citations && adage.citations.length > 0 ? (
                <div className="space-y-3">
                  {adage.citations.map((citation) => (
                    <div key={citation.id} className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          citation.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {citation.verified ? 'Verified' : 'Pending Verification'}
                        </span>
                        {citation.source_type && (
                          <span className="text-xs text-text-secondary capitalize">{citation.source_type}</span>
                        )}
                      </div>
                      <p className="text-text-primary">{citation.source_text}</p>
                      {citation.source_url && (
                        <a
                          href={citation.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent-primary hover:underline mt-2 inline-block"
                        >
                          View Source →
                        </a>
                      )}
                      {citation.submitted_by_user && (
                        <p className="text-xs text-text-secondary mt-2">
                          Submitted by {citation.submitted_by_user.display_name || citation.submitted_by_user.username || 'User'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card-bg-muted p-6 rounded-lg border border-border-medium text-center">
                  <p className="text-text-secondary italic">
                    Sources and citations for this adage are being compiled. Check back soon for academic references and verified sources.
                  </p>
                </div>
              )}
            </section>

            {/* Commendations (Official AAS Comments) */}
            {adage.commendations && adage.commendations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">Official Commendations</h2>
                <div className="space-y-4">
                  {adage.commendations.map((commendation) => (
                    <div key={commendation.id} className="bg-accent-primary/10 border-2 border-accent-primary/30 p-6 rounded-lg">
                      <div className="flex items-start gap-3 mb-2">
                        {commendation.user?.profile_image_url ? (
                          <img
                            src={commendation.user.profile_image_url}
                            alt={commendation.user.display_name || commendation.user.username || 'Admin'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent-primary text-text-inverse flex items-center justify-center font-semibold">
                            {(commendation.user?.display_name || commendation.user?.username || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-text-primary">
                              {commendation.user?.display_name || commendation.user?.username || 'American Adages Society'}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-accent-primary text-text-inverse rounded font-medium">
                              Official
                            </span>
                            <span className="text-xs text-text-metadata">
                              {format(new Date(commendation.created_at), 'MMMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{commendation.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>

        <CommentsSection targetType="adage" targetId={adage.id} />
      </div>
    </div>
  )
}
