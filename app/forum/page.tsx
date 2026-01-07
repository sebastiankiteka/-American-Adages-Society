'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface ForumSection {
  id: string
  title: string
  slug: string
  description?: string
  rules?: string
  subsection_of?: string
  locked: boolean
  subsections?: ForumSection[]
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function Forum() {
  const { data: session } = useSession()
  const [sections, setSections] = useState<ForumSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/forum/sections')
        const result: ApiResponse<ForumSection[]> = await response.json()

        if (result.success && result.data) {
          setSections(result.data)
        } else {
          setError(result.error || 'Failed to load forum sections')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load forum sections')
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading forum...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-accent-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <img 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-text-primary">
            Community Forum
          </h1>
          <p className="text-lg text-text-primary max-w-2xl mx-auto">
            Join the conversation about adages, their meanings, origins, and cultural significance.
          </p>
        </div>

        {!session && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              <Link href="/login" className="text-bronze hover:underline font-semibold">Log in</Link> or{' '}
              <Link href="/register" className="text-bronze hover:underline font-semibold">register</Link> to participate in discussions.
            </p>
          </div>
        )}

        {sections.length === 0 ? (
          <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-text-primary text-lg mb-4">No forum sections available yet.</p>
            {session && (session.user as any)?.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
              >
                Create Forum Section
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-card-bg rounded-lg shadow-sm border border-border-medium hover:border-accent-primary transition-all"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link
                        href={`/forum/${section.slug}`}
                        className="block group"
                      >
                        <h2 className="text-2xl font-bold font-serif text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                          {section.title}
                        </h2>
                      </Link>
                      {section.description && (
                        <p className="text-text-primary mb-3">{section.description}</p>
                      )}
                      {section.rules && (
                        <details className="mt-3">
                          <summary className="text-sm text-bronze cursor-pointer hover:underline">
                            View Rules
                          </summary>
                          <div className="mt-2 p-3 bg-card-bg-muted rounded border border-border-medium text-sm text-text-primary whitespace-pre-line">
                            {section.rules}
                          </div>
                        </details>
                      )}
                    </div>
                    {section.locked && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Locked
                      </span>
                    )}
                  </div>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-soft-gray">
                      <h3 className="text-sm font-semibold text-text-metadata mb-2">Subsections:</h3>
                      <div className="flex flex-wrap gap-2">
                        {section.subsections.map((subsection) => (
                          <Link
                            key={subsection.id}
                            href={`/forum/${subsection.slug}`}
                            className="px-3 py-1 bg-card-bg-muted hover:bg-card-bg rounded text-sm text-text-primary hover:text-accent-primary transition-colors"
                          >
                            {subsection.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      href={`/forum/${section.slug}`}
                      className="inline-block px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                    >
                      View Section →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



