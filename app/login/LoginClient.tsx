'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const registered = searchParams.get('registered')
    const verified = searchParams.get('verified')
    const reset = searchParams.get('reset')
    
    if (registered === 'true') {
      setSuccessMessage('Registration successful! Please check your email to verify your account.')
    } else if (verified === 'true') {
      setSuccessMessage('Email verified! You can now sign in.')
    } else if (reset === 'success') {
      setSuccessMessage('Password reset successful! You can now sign in with your new password.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
      } else if (result?.ok) {
        // Successful login - redirect based on user role
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card-bg p-8 rounded-lg shadow-lg border border-border-medium">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2 text-text-primary">
            Login
          </h1>
          <p className="text-text-secondary">
            Sign in to your American Adages Society account
          </p>
          <p className="text-sm text-text-metadata mt-2">
            Login via email and password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-accent-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              required
              disabled={loading}
            />
          </div>

          {successMessage && (
            <div className="bg-success-bg border border-success-text/30 text-success-text p-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link href="/register" className="text-accent-primary hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-border-medium">
          <p className="text-xs text-text-metadata text-center">
            Admin access?{' '}
            <Link href="/admin/login" className="text-accent-primary hover:underline">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

