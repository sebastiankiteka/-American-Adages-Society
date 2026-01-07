'use client'

import { useState, useEffect } from 'react'

interface ProgressData {
  adagesCount: number
  adagesGoal: number
  totalViews: number
  viewsGoal: number
}

export default function Agenda() {
  const [progress, setProgress] = useState<ProgressData>({
    adagesCount: 0,
    adagesGoal: 100,
    totalViews: 0,
    viewsGoal: 1000,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Fetch adages count
        const adagesResponse = await fetch('/api/adages')
        const adagesResult = await adagesResponse.json()
        const adagesCount = adagesResult.success && adagesResult.data ? adagesResult.data.length : 0

        // Calculate total views (sum of all adage views)
        const totalViews = adagesResult.success && adagesResult.data
          ? adagesResult.data.reduce((sum: number, adage: any) => sum + (adage.views_count || 0), 0)
          : 0

        setProgress({
          adagesCount,
          adagesGoal: 100, // Goal for Fall 2026
          totalViews,
          viewsGoal: 1000, // Initial goal
        })
      } catch (err) {
        console.error('Failed to fetch progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const adagesProgress = Math.min((progress.adagesCount / progress.adagesGoal) * 100, 100)
  const viewsProgress = Math.min((progress.totalViews / progress.viewsGoal) * 100, 100)

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-text-primary">
          Agenda & Growth Plan
        </h1>

        {/* Progress Tracking */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Progress Tracking
          </h2>
          
          {loading ? (
            <p className="text-text-metadata">Loading progress...</p>
          ) : (
            <div className="space-y-6">
              {/* Adages Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-text-primary">Archive Expansion</h3>
                  <span className="text-text-metadata">
                    {progress.adagesCount} / {progress.adagesGoal} adages
                  </span>
                </div>
                <div className="w-full bg-card-bg-muted rounded-full h-4">
                  <div
                    className="bg-accent-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${adagesProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-text-metadata mt-2">
                  Goal: {progress.adagesGoal} adages by Fall 2026
                </p>
              </div>

              {/* Views Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-text-primary">Website Traffic</h3>
                  <span className="text-text-metadata">
                    {progress.totalViews.toLocaleString()} / {progress.viewsGoal.toLocaleString()} views
                  </span>
                </div>
                <div className="w-full bg-card-bg-muted rounded-full h-4">
                  <div
                    className="bg-accent-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${viewsProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-text-metadata mt-2">
                  Total page views across all adages
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Goals Section */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Our Goals
          </h2>
          <div className="space-y-4 text-text-primary">
            <div className="flex items-start">
              <span className="text-accent-primary text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-text-primary">Expand the Archive:</strong> Build a comprehensive, 
                searchable database of American adages with detailed definitions, origins, and cultural context.
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-accent-primary text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-text-primary">Foster Dialogue:</strong> Create regular opportunities 
                for students to engage with language, wisdom, and cultural heritage through discussions 
                and workshops.
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-accent-primary text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-text-primary">Build Community:</strong> Connect students, faculty, 
                and community members who share a passion for language, philosophy, and cultural preservation.
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-accent-primary text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-text-primary">Promote Scholarship:</strong> Support research and 
                creative projects that explore the significance of adages in contemporary culture.
              </p>
            </div>
          </div>
        </section>

        {/* Long-term Vision */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Long-term Vision
          </h2>
          <div className="prose prose-lg max-w-none text-text-primary">
            <p className="mb-4">
              Over the next five years, we envision the American Adages Society as a recognized 
              center for the study and preservation of linguistic wisdom. Our goals include:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Establishing partnerships with academic departments, libraries, and cultural institutions</li>
              <li>Publishing an annual journal featuring student research and creative work</li>
              <li>Hosting an annual conference on language, culture, and wisdom</li>
              <li>Creating educational resources for K-12 educators</li>
              <li>Expanding our digital archive to include multimedia content and interactive features</li>
            </ul>
            <p>
              We believe that by preserving and engaging with the wisdom of the past, we can 
              better understand the present and shape a more thoughtful future.
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Roadmap
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-bronze pl-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-text-primary">
                Spring 2026
              </h3>
              <ul className="list-disc list-inside space-y-1 text-text-primary ml-4">
                <li>Launch website and digital archive</li>
                <li>Host monthly discussion series</li>
                <li>Begin creative writing workshop program</li>
                <li>Recruit new members and volunteers</li>
              </ul>
            </div>

            <div className="border-l-4 border-bronze pl-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-text-primary">
                Fall 2026
              </h3>
              <ul className="list-disc list-inside space-y-1 text-text-primary ml-4">
                <li>Expand archive to 100+ adages</li>
                <li>Host guest speaker series</li>
                <li>Establish partnerships with academic departments</li>
                <li>Launch community outreach initiatives</li>
              </ul>
            </div>

            <div className="border-l-4 border-bronze pl-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-text-primary">
                2027 & Beyond
              </h3>
              <ul className="list-disc list-inside space-y-1 text-text-primary ml-4">
                <li>Publish first annual journal</li>
                <li>Host inaugural conference</li>
                <li>Develop educational resources</li>
                <li>Expand digital platform capabilities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Impact & Support */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            How Support Translates to Impact
          </h2>
          <div className="prose prose-lg max-w-none text-charcoal-light">
            <p className="mb-4">
              Your support—whether through membership, volunteering, partnerships, or donations—directly 
              enables us to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Maintain and expand our digital archive with quality research and documentation</li>
              <li>Host engaging events, workshops, and guest speakers</li>
              <li>Provide resources and opportunities for student research and creative projects</li>
              <li>Build a sustainable organization that can serve future generations of students</li>
              <li>Create educational materials that benefit the broader community</li>
            </ul>
            <p className="mb-6">
              Every contribution helps us preserve linguistic heritage and foster thoughtful dialogue 
              about the wisdom embedded in our language.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/get-involved"
                className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
              >
                Get Involved
              </a>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors font-medium"
              >
                Partner With Us
              </a>
            </div>
          </div>
        </section>

        {/* Future Enhancements */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mt-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">Future Enhancements</h2>
          <ul className="space-y-3 text-text-primary">
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">Multilingual Support:</strong> Translation layer for adages with support for multiple languages and translator notes</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">Enhanced Inbox Notifications:</strong> Email and in-app notifications for new replies in message threads and improved notification management</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">Semantic Search:</strong> AI-powered semantic search capabilities for more intelligent content discovery</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">Social Sharing:</strong> Enhanced social sharing features with preview cards and analytics</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">Mobile App:</strong> Native mobile application for iOS and Android</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">API Access:</strong> Public API for developers to integrate adage data into their applications</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent-primary mr-2">•</span>
              <span><strong className="text-text-primary">Advanced Analytics:</strong> Detailed analytics dashboard with user behavior insights and content performance metrics</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}

