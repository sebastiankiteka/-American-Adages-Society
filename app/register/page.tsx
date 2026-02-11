'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
          display_name: formData.displayName || undefined,
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?registered=true')
        }, 3000)
      } else {
        setError(result.error || 'Registration failed. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-card-bg p-8 rounded-lg shadow-lg border border-border-medium">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-success-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold font-serif mb-2 text-text-primary">
              Registration Successful!
            </h1>
            <p className="text-text-secondary mb-4">
              Your account has been created. Please check your email to verify your account.
            </p>
            <p className="text-sm text-text-secondary">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card-bg p-8 rounded-lg shadow-lg border border-border-medium">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2 text-text-primary">
            Create Account
          </h1>
          <p className="text-text-secondary">
            Join the American Adages Society community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
              Username (optional)
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value })
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              placeholder="username"
              disabled={loading}
            />
            <p className="text-xs text-text-secondary mt-1">
              If not provided, we'll use your email username
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-text-primary mb-2">
              Display Name (optional)
            </label>
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => {
                setFormData({ ...formData, displayName: e.target.value })
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              placeholder="Your Name"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-xs text-text-secondary mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-error-bg border border-error-text/30 text-error-text p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}












