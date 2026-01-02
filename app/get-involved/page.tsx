'use client'

import { useState } from 'react'

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
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would submit to a backend API
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        utEid: '',
        interests: '',
        message: '',
        involvementType: 'volunteer',
        mailingList: false,
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-charcoal">
            Get Involved
          </h1>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Join our community of thinkers exploring how collective language and inherited wisdom 
            can illuminate a strong path forward. We recruit year-round—no application required!
          </p>
        </div>

        {/* Interest Form */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Join Us
          </h2>
          <p className="text-charcoal-light mb-8">
            Interested in becoming a member, volunteering, or learning more? Fill out the form below, 
            and we'll get in touch with you soon.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg">
              <p className="font-semibold">Thank you for your interest!</p>
              <p>We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>

              <div>
                <label htmlFor="utEid" className="block text-sm font-medium text-charcoal mb-2">
                  UT EID (if applicable)
                </label>
                <input
                  type="text"
                  id="utEid"
                  value={formData.utEid}
                  onChange={(e) => setFormData({ ...formData, utEid: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>

              <div>
                <label htmlFor="involvementType" className="block text-sm font-medium text-charcoal mb-2">
                  I'm interested in:
                </label>
                <select
                  id="involvementType"
                  value={formData.involvementType}
                  onChange={(e) => setFormData({ ...formData, involvementType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                >
                  <option value="volunteer">Volunteering</option>
                  <option value="member">Becoming a Member</option>
                  <option value="partner">Partnership/Collaboration</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-charcoal mb-2">
                  Areas of Interest
                </label>
                <textarea
                  id="interests"
                  rows={3}
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g., Archive research, event planning, creative writing..."
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mailingList"
                  checked={formData.mailingList}
                  onChange={(e) => setFormData({ ...formData, mailingList: e.target.checked })}
                  className="w-4 h-4 text-bronze border-soft-gray rounded focus:ring-bronze"
                />
                <label htmlFor="mailingList" className="ml-2 text-sm text-charcoal-light">
                  Join our mailing list for updates and event announcements
                </label>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
              >
                Submit
              </button>
            </form>
          )}
        </section>

        {/* Donation Section */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Support Our Mission
          </h2>
          <p className="text-charcoal-light mb-6">
            While membership is free, donations help us expand our programs, maintain our archive, 
            and host events. Your support directly enables us to preserve linguistic heritage and 
            foster thoughtful dialogue.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
          >
            Contact Us About Donations
          </a>
        </section>

        {/* Partner/Collaborate */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-12">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Partner & Collaborate
          </h2>
          <p className="text-charcoal-light mb-6">
            We're always interested in partnering with other organizations, academic departments, 
            cultural institutions, and community groups. Whether you're interested in co-hosting 
            events, sharing resources, or collaborating on research, we'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors font-medium"
          >
            Reach Out
          </a>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-bold font-serif mb-8 text-center text-charcoal">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-soft-gray transition-colors"
                >
                  <h3 className="font-semibold text-charcoal">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-bronze transition-transform ${
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
                  <div className="px-6 py-4 text-charcoal-light border-t border-soft-gray">
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

