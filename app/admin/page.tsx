'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuth) {
      router.push('/admin/login')
    } else {
      setAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    router.push('/admin/login')
  }

  if (!authenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">
            Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-charcoal text-cream rounded-lg hover:bg-charcoal-light transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold font-serif text-charcoal">Welcome, Administrator</h2>
              <p className="text-charcoal-light">
                Manage content across the website. Changes are saved to your browser's local storage.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/adages"
            className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray hover:border-bronze hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-charcoal group-hover:text-bronze">
              Manage Adages
            </h3>
            <p className="text-charcoal-light text-sm">
              Add, edit, or delete adages in the archive
            </p>
          </Link>

          <Link
            href="/admin/blog"
            className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray hover:border-bronze hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-charcoal group-hover:text-bronze">
              Manage Blog Posts
            </h3>
            <p className="text-charcoal-light text-sm">
              Create, edit, or delete blog posts
            </p>
          </Link>

          <Link
            href="/admin/events"
            className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray hover:border-bronze hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-charcoal group-hover:text-bronze">
              Manage Events
            </h3>
            <p className="text-charcoal-light text-sm">
              Add or update events and calendar items
            </p>
          </Link>

          <Link
            href="/admin/leadership"
            className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray hover:border-bronze hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-charcoal group-hover:text-bronze">
              Manage Leadership
            </h3>
            <p className="text-charcoal-light text-sm">
              Update leadership team information
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray hover:border-bronze hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-charcoal group-hover:text-bronze">
              Site Settings
            </h3>
            <p className="text-charcoal-light text-sm">
              Configure site-wide settings
            </p>
          </Link>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg border border-soft-gray">
          <h3 className="font-semibold text-charcoal mb-4">Quick Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-charcoal-light">
            <li>All changes are saved automatically to your browser's local storage</li>
            <li>To add images, upload them to the <code className="bg-soft-gray px-1 rounded">/public</code> folder and reference them by path (e.g., <code className="bg-soft-gray px-1 rounded">/images/photo.jpg</code>)</li>
            <li>Changes will be visible immediately on the website</li>
            <li>For production, consider connecting to a database or CMS for persistent storage</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

