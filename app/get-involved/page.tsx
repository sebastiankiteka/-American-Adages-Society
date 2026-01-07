'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const faqs = [
  {
    question: 'How do I become a member?',
    answer: 'Membership is open to all University of Texas students. We recruit new members year-round and do not require an application, interview, or membership dues. Simply attend one of our general meetings or events, or fill out the interest form below.',
  },
  {
    question: 'When and where are meetings held?',
    answer: 'We hold monthly general meetings, typically on the second Tuesday of each month at 6:00 PM. Meeting locations vary but are usually on campus. Check our Events page for the most current schedule.',
  },
  {
    question: 'Are there membership dues?',
    answer: 'No, membership in the American Adages Society is completely free. We do not collect membership dues. We are a student organization funded through university resources and optional donations.',
  },
  {
    question: 'What is the organization structure?',
    answer: 'We are led by an elected executive board (President, Vice President, Treasurer, Secretary) and operate under our Constitution and Bylaws. All members are welcome to participate in decision-making and can run for leadership positions.',
  },
  {
    question: 'Do I need to be an English or Philosophy major?',
    answer: 'Not at all! We welcome students from all majors and backgrounds. Our members come from diverse fields, united by an interest in language, culture, and wisdom. General members typically spend approximately 1 hour per week on organization activities.',
  },
  {
    question: 'How can I contribute to the archive?',
    answer: 'You can propose adages for inclusion in our archive through our contact form or by attending one of our archive contribution sessions. We welcome research, definitions, origins, and cultural context.',
  },
  {
    question: 'What is your non-hazing policy?',
    answer: 'The American Adages Society has a strict non-hazing policy. We are committed to creating an inclusive, respectful environment where all members feel welcome and valued.',
  },
]

export default function GetInvolved() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    utEid: '',
    interests: '',
    message: '',
    involvementType: 'volunteer',
    mailingList: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
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

  interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Submit contact form
      const contactResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: `Get Involved: ${formData.involvementType}`,
            message: `UT EID: ${formData.utEid || 'N/A'}\nInterests: ${formData.interests || 'N/A'}\n\nMessage:\n${formData.message || 'N/A'}`,
            category: 'get_involved', // Will work after running migration
          }),
      })

      const contactResult: ApiResponse = await contactResponse.json()

      if (!contactResult.success) {
        setError(contactResult.error || 'Failed to submit form. Please try again.')
        setLoading(false)
        return
      }

      // Add to mailing list if checked
      if (formData.mailingList) {
        const mailingListResponse = await fetch('/api/mailing-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            source: 'get_involved',
          }),
        })

        const mailingListResult: ApiResponse = await mailingListResponse.json()
        // Don't fail if mailing list fails, just log it
        if (!mailingListResult.success) {
          console.warn('Mailing list subscription failed:', mailingListResult.error)
        }
      }

      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        utEid: '',
        interests: '',
        message: '',
        involvementType: 'volunteer',
        mailingList: false,
      })
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Get Involved
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join our community of thinkers exploring how collective language and inherited wisdom 
            can illuminate a strong path forward. We recruit year-round—no application required!
          </p>
        </div>

        {/* Interest Form */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Join Us
          </h2>
          <p className="text-text-secondary mb-8">
            Interested in becoming a member, volunteering, or learning more? Fill out the form below, 
            and we'll get in touch with you soon.
          </p>

          {submitted ? (
            <div className="bg-success-bg border border-success-text/30 text-success-text p-6 rounded-lg">
              <p className="font-semibold">Thank you for your interest!</p>
              <p>We'll be in touch soon.</p>
              {formData.mailingList && (
                <p className="mt-2 text-sm">You've been added to our mailing list.</p>
              )}
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
                <label htmlFor="utEid" className="block text-sm font-medium text-text-primary mb-2">
                  UT EID (if applicable)
                </label>
                <input
                  type="text"
                  id="utEid"
                  value={formData.utEid}
                  onChange={(e) => setFormData({ ...formData, utEid: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <div>
                <label htmlFor="involvementType" className="block text-sm font-medium text-text-primary mb-2">
                  I'm interested in:
                </label>
                <select
                  id="involvementType"
                  value={formData.involvementType}
                  onChange={(e) => setFormData({ ...formData, involvementType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                >
                  <option value="volunteer">Volunteering</option>
                  <option value="member">Becoming a Member</option>
                  <option value="partner">Partnership/Collaboration</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-text-primary mb-2">
                  Areas of Interest
                </label>
                <textarea
                  id="interests"
                  rows={3}
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., Archive research, event planning, creative writing..."
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mailingList"
                  checked={formData.mailingList}
                  onChange={(e) => setFormData({ ...formData, mailingList: e.target.checked })}
                  className="w-4 h-4 text-accent-primary border-border-medium rounded focus:ring-accent-primary"
                />
                <label htmlFor="mailingList" className="ml-2 text-sm text-text-secondary">
                  Join our mailing list for updates and event announcements
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
        </section>

        {/* Donation Section */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Support Our Mission
          </h2>
          <p className="text-text-secondary mb-6">
            While membership is free, donations help us expand our programs, maintain our archive, 
            and host events. Your support directly enables us to preserve linguistic heritage and 
            foster thoughtful dialogue.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
          >
            Contact Us About Donations
          </a>
        </section>

        {/* Partner/Collaborate */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Partner & Collaborate
          </h2>
          <p className="text-text-secondary mb-6">
            We're always interested in partnering with other organizations, academic departments, 
            cultural institutions, and community groups. Whether you're interested in co-hosting 
            events, sharing resources, or collaborating on research, we'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors font-medium"
          >
            Reach Out
          </a>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold font-serif mb-8 text-center text-text-primary">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-card-bg-muted transition-colors"
                >
                  <h3 className="font-semibold text-text-primary">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-accent-primary transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 text-text-secondary border-t border-border-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

