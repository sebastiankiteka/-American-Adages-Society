'use client'

import { useState } from 'react'

interface MailingListSignupProps {
  source?: string
  className?: string
  compact?: boolean
}

export default function MailingListSignup({ source = 'signup', className = '', compact = false }: MailingListSignupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Successfully subscribed!' })
        setEmail('')
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to subscribe' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to subscribe' })
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 relative ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
        {message && (
          <div className={`absolute mt-12 px-4 py-2 rounded-lg text-sm z-10 ${
            message.type === 'success' ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    )
  }

  return (
    <div className={`bg-card-bg p-6 rounded-lg border border-border-medium ${className}`}>
      <h3 className="text-xl font-bold font-serif text-text-primary mb-2">Stay Updated</h3>
      <p className="text-text-secondary mb-4">
        Subscribe to our mailing list to receive updates about new adages, events, and community news.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Subscribing...' : 'Subscribe to Mailing List'}
        </button>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-success-bg text-success-text' : 'bg-error-bg text-error-text'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}

