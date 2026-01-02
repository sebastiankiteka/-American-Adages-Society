'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple password check - in production, use proper authentication
    // For now, using a simple password. In production, implement proper auth
    if (password === 'AAS2025Admin') {
      // Store admin session (in production, use secure session management)
      localStorage.setItem('adminAuthenticated', 'true')
      router.push('/admin')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-soft-gray">
        <h1 className="text-3xl font-bold font-serif mb-2 text-charcoal text-center">
          Admin Login
        </h1>
        <p className="text-charcoal-light text-center mb-8">
          Enter your password to access the admin panel
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
          >
            Login
          </button>
        </form>

        <p className="text-xs text-charcoal-light text-center mt-6">
          This is a protected area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}

