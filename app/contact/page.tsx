'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function Contact() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    if (session?.user) {
      // Fetch user data to auto-fill form
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setUserData(data.data)
            setFormData(prev => ({
              ...prev,
              name: data.data.display_name || data.data.username || '',
              email: data.data.email || '',
            }))
          }
        })
        .catch(err => console.error('Failed to fetch user data:', err))
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: 'general',
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
      } else {
        setError(result.error || 'Failed to send message. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-text-primary">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
            <h2 className="text-2xl font-bold font-serif mb-6 text-text-primary">
              Get in Touch
            </h2>
            <div className="space-y-4 text-text-primary">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Email</h3>
                <a
                  href="mailto:sebastiankiteka@utexas.edu"
                  className="text-accent-primary hover:underline"
                >
                  sebastiankiteka@utexas.edu
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Location</h3>
                <p>at the University of Texas - Austin</p>
                <p className="text-sm mt-1">Austin, Texas</p>
              </div>
              <div className="bg-card-bg-muted p-4 rounded-lg border-2 border-accent-primary/30">
                <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  HornsLink
                </h3>
                <a
                  href="https://utexas.campuslabs.com/engage/organization/americanadagessociety"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline font-medium flex items-center gap-1"
                >
                  <span>View our official HornsLink page</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.instagram.com/americanadagessociety/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/american-adages-society"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map/Location Reference */}
          <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
            <h2 className="text-2xl font-bold font-serif mb-6 text-text-primary">
              Find Us
            </h2>
            <div className="bg-card-bg-muted rounded-lg h-64 flex items-center justify-center text-text-metadata">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-accent-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="font-semibold text-text-primary">at the University of Texas - Austin</p>
                <p className="text-sm mt-2">Austin, Texas</p>
                <p className="text-sm mt-4">Meeting locations vary by event.</p>
                <p className="text-sm">Check our Events page for details.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Official Links Section */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Official Links
          </h2>
          <p className="text-text-secondary mb-6">
            Connect with us through our official channels and resources.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://linktr.ee/AmericanAdagesSociety"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-4 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
            >
              <span>Visit Our Linktree</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfIGXsWgozbMYhfkCpA9J2H6TA0vCrz6Yy28IiA_W4YSaYw5w/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-4 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
            >
              <span>Submit Interest Form</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Send Us a Message
          </h2>
          <p className="text-text-primary mb-8">
            Have a question, suggestion, or want to propose an adage for our archive? 
            Fill out the form below, and we'll get back to you as soon as possible.
          </p>

          {submitted ? (
            <div className="bg-success-bg border border-success-text/30 text-success-text p-6 rounded-lg">
              <p className="font-semibold">Thank you for your message!</p>
              <p>We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-bg border border-error-text/30 text-error-text px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

