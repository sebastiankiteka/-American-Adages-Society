'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4 flex items-center justify-center">
        <p className="text-charcoal">Loading...</p>
      </div>
    )
  }

  if ((session.user as any)?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">Site Settings</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
          >
            Back to Admin
          </button>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  defaultValue="American Adages Society"
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  disabled
                />
                <p className="text-xs text-charcoal-light mt-1">
                  Site name is configured in the codebase
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="sebastiankiteka@utexas.edu"
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  disabled
                />
                <p className="text-xs text-charcoal-light mt-1">
                  Contact email is configured in environment variables
                </p>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">Database Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Database Provider</span>
                <span className="font-medium text-charcoal">Supabase</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Connection Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Authentication</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif mb-6 text-charcoal">System Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Logged in as</span>
                <span className="font-medium text-charcoal">{session.user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">User Role</span>
                <span className="font-medium text-charcoal capitalize">{(session.user as any)?.role || 'admin'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-light">Framework</span>
                <span className="font-medium text-charcoal">Next.js 14</span>
              </div>
            </div>
          </div>

          {/* Future Settings Placeholder */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray border-dashed">
            <h2 className="text-2xl font-bold font-serif mb-4 text-charcoal">Coming Soon</h2>
            <p className="text-charcoal-light mb-4">
              Additional site settings will be available here, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-charcoal-light">
              <li>Email notification preferences</li>
              <li>Content moderation settings</li>
              <li>Feature flags</li>
              <li>Analytics configuration</li>
              <li>Backup and export options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}



