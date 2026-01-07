'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      verifyToken(tokenParam)
    } else {
      setTokenValid(false)
    }
  }, [searchParams])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password-token?token=${tokenToVerify}`)
      const result = await response.json()
      setTokenValid(result.success)
      if (!result.success) {
        setError('Invalid or expired reset token. Please request a new password reset.')
      }
    } catch (err) {
      setTokenValid(false)
      setError('Failed to verify reset token')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?reset=success')
        }, 2000)
      } else {
        setError(result.error || 'Failed to reset password')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
          <p className="text-charcoal text-center">Verifying reset token...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
              Invalid Reset Link
            </h1>
            <p className="text-charcoal-light">
              This password reset link is invalid or has expired.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="text-center space-y-4">
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
            >
              Back to Login
            </Link>
            <Link
              href="/forgot-password"
              className="block text-sm text-bronze hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
              Password Reset Successful
            </h1>
            <p className="text-charcoal-light mb-6">
              Your password has been reset successfully. Redirecting to login...
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal">
            Reset Password
          </h1>
          <p className="text-charcoal-light">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-charcoal mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
              placeholder="Enter new password"
              required
              disabled={loading}
              minLength={8}
            />
            <p className="text-xs text-charcoal-light mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
              placeholder="Confirm new password"
              required
              disabled={loading}
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-bronze hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}


