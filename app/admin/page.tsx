'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import AdminSearch from '@/components/AdminSearch'

interface AdminCounts {
  messages: number
  citations: number
  challenges: number
  deletedItems: number
  appealedItems: number
  weeklyEmailNotifications: number
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [counts, setCounts] = useState<AdminCounts>({
    messages: 0,
    citations: 0,
    challenges: 0,
    deletedItems: 0,
    appealedItems: 0,
    weeklyEmailNotifications: 0,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/admin/counts')
        const result = await response.json()
        if (result.success && result.data) {
          setCounts(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch admin counts:', err)
      }
    }

    fetchCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [session, status])

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary">
            Admin Panel
          </h1>
          <div className="flex gap-4 items-center">
            <AdminSearch />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-text-primary text-text-inverse rounded-lg hover:bg-text-secondary transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold font-serif text-text-primary">Welcome, Administrator</h2>
              <p className="text-text-secondary">
                Manage content across the website. All changes are saved to the database.
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Logged in as: {session.user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/adages"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Manage Adages
            </h3>
            <p className="text-text-secondary text-sm">
              Add, edit, or delete adages in the archive
            </p>
          </Link>

          <Link
            href="/admin/blog"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Manage Blog Posts
            </h3>
            <p className="text-text-secondary text-sm">
              Create, edit, or delete blog posts
            </p>
          </Link>

          <Link
            href="/admin/events"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Manage Events
            </h3>
            <p className="text-text-secondary text-sm">
              Add or update events and calendar items
            </p>
          </Link>

          <Link
            href="/admin/leadership"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Manage Leadership
            </h3>
            <p className="text-text-secondary text-sm">
              Update leadership team information
            </p>
          </Link>

          <Link
            href="/admin/documents"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Manage Documents
            </h3>
            <p className="text-text-secondary text-sm">
              Add, edit, or delete transparency documents
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Site Settings
            </h3>
            <p className="text-text-secondary text-sm">
              Configure site-wide settings
            </p>
          </Link>

          <Link
            href="/admin/messages"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group relative"
          >
            {counts.messages > 0 && (
              <span className="absolute top-2 right-2 bg-error-text text-text-inverse rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {counts.messages > 99 ? '99+' : counts.messages}
              </span>
            )}
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Contact Messages
            </h3>
            <p className="text-text-secondary text-sm">
              View and manage contact form submissions
            </p>
          </Link>

          <Link
            href="/admin/mailing-list"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group relative"
          >
            {counts.weeklyEmailNotifications > 0 && (
              <span className="absolute top-2 right-2 bg-accent-primary text-text-inverse rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {counts.weeklyEmailNotifications > 99 ? '99+' : counts.weeklyEmailNotifications}
              </span>
            )}
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Mailing List
            </h3>
            <p className="text-text-secondary text-sm">
              Manage mailing list subscribers{counts.weeklyEmailNotifications > 0 && (
                <span className="text-accent-primary font-semibold"> • Weekly email ready</span>
              )}
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              User Management
            </h3>
            <p className="text-text-secondary text-sm">
              View all users, manage roles, and restore deleted accounts
            </p>
          </Link>

          <Link
            href="/admin/forum"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Forum Management
            </h3>
            <p className="text-text-secondary text-sm">
              Manage forum sections, threads, and moderation
            </p>
          </Link>

          <Link
            href="/admin/citations"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group relative"
          >
            {(counts.citations > 0 || counts.challenges > 0) && (
              <span className="absolute top-2 right-2 bg-error-text text-text-inverse rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {counts.citations + counts.challenges > 99 ? '99+' : counts.citations + counts.challenges}
              </span>
            )}
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Citations & Challenges
            </h3>
            <p className="text-text-secondary text-sm">
              Review and manage submitted citations and reader challenges
            </p>
          </Link>

          <Link
            href="/admin/deleted-items"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group relative"
          >
            {counts.appealedItems > 0 && (
              <span className="absolute top-2 right-2 bg-error-text text-text-inverse rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {counts.appealedItems > 99 ? '99+' : counts.appealedItems}
              </span>
            )}
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Deleted Items
            </h3>
            <p className="text-text-secondary text-sm">
              Review and restore deleted content (comments, adages, blog posts, etc.)
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium hover:border-accent-primary hover:shadow-md transition-all group"
          >
            <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary">
              Analytics & Foot Traffic
            </h3>
            <p className="text-text-secondary text-sm">
              View website traffic, views, and engagement metrics
            </p>
          </Link>
        </div>

        <div className="mt-8 bg-card-bg p-6 rounded-lg border border-border-medium">
          <h3 className="font-semibold text-text-primary mb-4">Quick Tips</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-text-secondary">
            <li>All changes are saved automatically to the database</li>
            <li>To add images, upload them to the <code className="bg-card-bg-muted px-1 rounded">/public</code> folder and reference them by path (e.g., <code className="bg-card-bg-muted px-1 rounded">/images/photo.jpg</code>)</li>
            <li>Changes will be visible immediately on the website</li>
            <li>Content is now persisted in Supabase database</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

