'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

function PasswordResetSection() {
  const [showReset, setShowReset] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setShowReset(false)
          setSuccess(false)
        }, 3000)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-serif text-text-primary">
          Password Reset
        </h2>
            <button
              onClick={() => {
                setShowReset(!showReset)
                setError('')
                setSuccess(false)
              }}
              className="px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm"
            >
              {showReset ? 'Cancel' : 'Change Password'}
            </button>
          </div>

      {showReset && (
        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="bg-error-bg border border-error-text/30 text-error-text p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-success-bg border border-success-text/30 text-success-text p-3 rounded-lg text-sm">
              Password updated successfully!
            </div>
          )}
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-text-metadata mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              name="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border-medium rounded-lg focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-text-metadata mb-1">
              New Password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border-medium rounded-lg focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              required
              minLength={8}
            />
            <p className="text-xs text-text-metadata mt-1">Must be at least 8 characters</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-metadata mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border-medium rounded-lg focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  )
}

interface EmailPreferences {
  email_weekly_adage: boolean
  email_events: boolean
  email_site_updates: boolean
  email_archive_additions: boolean
  email_comment_notifications: boolean
}

function EmailPreferencesSection({ userEmail }: { userEmail: string }) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const statusResponse = await fetch(`/api/mailing-list/status?email=${encodeURIComponent(userEmail)}`)
        const statusResult = await statusResponse.json()
        if (statusResult.success) {
          setSubscribed(statusResult.data?.subscribed || false)
        }
      } catch (err) {
        console.error('Failed to fetch mailing list status:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userEmail) {
      fetchStatus()
    }
  }, [userEmail])

  if (loading) {
    return <p className="text-sm text-text-metadata">Loading...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-metadata">Mailing List Subscription:</span>
        <span className={`text-sm font-medium ${subscribed ? 'text-green-600' : 'text-text-metadata'}`}>
          {subscribed ? '✓ Subscribed' : 'Not Subscribed'}
        </span>
      </div>
      <p className="text-xs text-text-metadata">
        Manage your mailing list subscription and email preferences in{' '}
        <Link href="/profile/edit" className="text-accent-primary hover:underline">
          Edit Profile
        </Link>
      </p>
    </div>
  )
}

interface UserData {
  id: string
  email: string
  username?: string
  display_name?: string
  bio?: string
  profile_image_url?: string
  role: string
  email_verified: boolean
  created_at: string
  stats?: {
    saved_adages: number
    collections: number
    comments: number
  }
  commendationStats?: {
    reports: {
      received: number
      accepted: number
    }
    votes: {
      upvotes: number
      downvotes: number
      net: number
    }
    contributions: {
      citations: number
      challenges: number
      comments: number
      blogPosts: number
      adages: number
    }
    popularPosts: Array<{
      id: string
      type: 'comment' | 'blog' | 'adage' | 'forum_reply' | 'forum_thread'
      content?: string
      title?: string
      adage?: string
      score: number
      created_at: string
      target_type?: string
      target_id?: string
      thread_id?: string
      slug?: string
    }>
  }
}

function CommendationStatsSection({ stats }: { stats: UserData['commendationStats'] }) {
  if (!stats) {
    return null
  }


  const getPostUrl = (post: typeof stats.popularPosts[0]) => {
    if (post.type === 'comment' && post.target_type && post.target_id) {
      if (post.target_type === 'adage') {
        return `/archive/${post.target_id}#comment-${post.id}`
      } else if (post.target_type === 'blog') {
        return `/blog/${post.target_id}#comment-${post.id}`
      } else if (post.target_type === 'forum') {
        return `/forum#comment-${post.id}`
      }
    } else if (post.type === 'blog' && post.slug) {
      return `/blog/${post.slug}`
    } else if (post.type === 'adage') {
      return `/archive/${post.id}`
    } else if (post.type === 'forum_reply' && post.thread_id) {
      return `/forum/thread/${post.thread_id}#reply-${post.id}`
    } else if (post.type === 'forum_thread' && post.slug) {
      return `/forum/thread/${post.slug}`
    }
    return '#'
  }

  const getPostTitle = (post: typeof stats.popularPosts[0]) => {
    if (post.type === 'comment') {
      return post.content ? `${post.content.substring(0, 60)}...` : 'Comment'
    } else if (post.type === 'blog') {
      return post.title || 'Blog Post'
    } else if (post.type === 'adage') {
      return post.adage || 'Adage'
    } else if (post.type === 'forum_reply') {
      return post.content ? `${post.content.substring(0, 60)}...` : 'Forum Reply'
    } else if (post.type === 'forum_thread') {
      return post.title || 'Forum Thread'
    }
    return 'Post'
  }

  return (
    <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
      <h2 className="text-2xl font-bold font-serif mb-6 text-text-primary">
        Commendation Stats
      </h2>

      {/* Reports Received */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Reports</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
            <div className="text-2xl font-bold text-text-primary">{stats.reports.received}</div>
            <div className="text-sm text-text-metadata">Reports Received</div>
          </div>
          <div className="bg-[#800020]/10 p-4 rounded-lg border border-[#800020]/30">
            <div className="text-2xl font-bold text-[#800020]">{stats.reports.accepted}</div>
            <div className="text-sm text-[#800020]">Accepted</div>
          </div>
        </div>
      </div>

      {/* Votes Received */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Votes Received</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">+{stats.votes.upvotes}</div>
            <div className="text-sm text-green-700">Upvotes</div>
          </div>
          <div className="bg-[#800020]/10 p-4 rounded-lg border border-[#800020]/30">
            <div className="text-2xl font-bold text-[#800020]">-{stats.votes.downvotes}</div>
            <div className="text-sm text-[#800020]">Downvotes</div>
          </div>
          <div className={`p-4 rounded-lg border ${
            stats.votes.net >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-[#800020]/10 border-[#800020]/30'
          }`}>
            <div className={`text-2xl font-bold ${
              stats.votes.net >= 0 ? 'text-green-600' : 'text-[#800020]'
            }`}>
              {stats.votes.net >= 0 ? '+' : ''}{stats.votes.net}
            </div>
            <div className={`text-sm ${
              stats.votes.net >= 0 ? 'text-green-700' : 'text-[#800020]'
            }`}>
              Net Score
            </div>
          </div>
        </div>
      </div>

      {/* Contributions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Contributions</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-card-bg-muted p-3 rounded-lg border border-border-medium text-center">
            <div className="text-xl font-bold text-accent-primary">{stats.contributions.citations}</div>
            <div className="text-xs text-text-metadata">Citations</div>
          </div>
          <div className="bg-card-bg-muted p-3 rounded-lg border border-border-medium text-center">
            <div className="text-xl font-bold text-accent-primary">{stats.contributions.challenges}</div>
            <div className="text-xs text-text-metadata">Challenges</div>
          </div>
          <div className="bg-card-bg-muted p-3 rounded-lg border border-border-medium text-center">
            <div className="text-xl font-bold text-accent-primary">{stats.contributions.comments}</div>
            <div className="text-xs text-text-metadata">Comments</div>
          </div>
          <div className="bg-card-bg-muted p-3 rounded-lg border border-border-medium text-center">
            <div className="text-xl font-bold text-accent-primary">{stats.contributions.blogPosts}</div>
            <div className="text-xs text-text-metadata">Blog Posts</div>
          </div>
          <div className="bg-card-bg-muted p-3 rounded-lg border border-border-medium text-center">
            <div className="text-xl font-bold text-accent-primary">{stats.contributions.adages}</div>
            <div className="text-xs text-text-metadata">Adages</div>
          </div>
        </div>
      </div>

      {/* Most Popular Posts */}
      {stats.popularPosts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Most Popular Posts</h3>
          <div className="space-y-2">
            {stats.popularPosts.map((post) => (
              <Link
                key={`${post.type}-${post.id}`}
                href={getPostUrl(post)}
                className="block bg-card-bg-muted p-3 rounded-lg border border-border-medium hover:border-accent-primary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-1 bg-accent-primary text-text-inverse rounded capitalize">
                        {post.type}
                      </span>
                      <span className={`text-sm font-semibold ${
                        post.score >= 0 ? 'text-green-600' : 'text-[#800020]'
                      }`}>
                        {post.score >= 0 ? '+' : ''}{post.score} votes
                      </span>
                    </div>
                    <p className="text-sm text-text-primary line-clamp-1">{getPostTitle(post)}</p>
                    <p className="text-xs text-text-metadata mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface NotificationCounts {
  notifications: number
  messages: number
  friendRequests: number
  commentReactions: number
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    notifications: 0,
    messages: 0,
    friendRequests: 0,
    commentReactions: 0,
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Fetch full user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/me?_t=${Date.now()}`, {
          cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUserData(data.data)
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
    fetchNotificationCounts()
    
    // Listen for stats update events to refresh "Your Stats" and commendation stats
    const handleStatsUpdate = () => {
      setTimeout(() => {
        fetchUserData()
        fetchNotificationCounts()
      }, 1000)
    }
    
    window.addEventListener('stats-update', handleStatsUpdate)
    window.addEventListener('vote-cast', handleStatsUpdate)
    
    // Refresh notification counts periodically
    const interval = setInterval(fetchNotificationCounts, 30000) // Every 30 seconds
    
    return () => {
      window.removeEventListener('stats-update', handleStatsUpdate)
      window.removeEventListener('vote-cast', handleStatsUpdate)
      clearInterval(interval)
    }
  }, [session, status, router])

  const fetchNotificationCounts = async () => {
    try {
      const response = await fetch('/api/users/notifications/counts')
      const result = await response.json()
      if (result.success && result.data) {
        setNotificationCounts(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch notification counts:', err)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')

    try {
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // Sign out and redirect to home
        await signOut({ callbackUrl: '/' })
      } else {
        setDeleteError(result.error || 'Failed to delete account')
        setDeleting(false)
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred while deleting your account')
      setDeleting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  const userRole = (session.user as any)?.role || 'user'
  const isAdmin = userRole === 'admin'
  const isModerator = userRole === 'moderator'

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-text-primary">
          My Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-metadata mb-1">
                    Email
                  </label>
                  <p className="text-text-primary">{userData?.email || session.user?.email}</p>
                  {!userData?.email_verified && (
                    <p className="text-sm text-yellow-600 mt-1">
                      ⚠️ Email not verified. Please check your email.
                    </p>
                  )}
                </div>
                {userData?.username && (
                  <div>
                  <label className="block text-sm font-medium text-text-metadata mb-1">
                    Username
                  </label>
                  <p className="text-text-primary">{userData.username}</p>
                  </div>
                )}
                {userData?.display_name && (
                  <div>
                  <label className="block text-sm font-medium text-text-metadata mb-1">
                    Display Name
                  </label>
                  <p className="text-text-primary">{userData.display_name}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-metadata mb-1">
                    Role
                  </label>
                  <p className="text-text-primary capitalize">
                    {userRole}
                    {isAdmin && ' 👑'}
                    {isModerator && ' 🛡️'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-metadata mb-1">
                    Member Since
                  </label>
                  <p className="text-text-primary">
                    {userData?.created_at
                      ? new Date(userData.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">
                Your Stats
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-primary">{userData?.stats?.collections || 0}</div>
                  <div className="text-sm text-text-metadata mt-1">Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-primary">{userData?.stats?.saved_adages || 0}</div>
                  <div className="text-sm text-text-metadata mt-1">Saved Adages</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent-primary">{userData?.stats?.comments || 0}</div>
                  <div className="text-sm text-text-metadata mt-1">Comments</div>
                </div>
              </div>
            </div>

            {/* User Actions */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-2xl font-bold font-serif mb-4 text-text-primary">
                My Content
              </h2>
              <div className="space-y-3">
                <Link
                  href="/profile/collections"
                  className="block px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors relative"
                >
                  My Collections
                </Link>
                <Link
                  href="/profile/saved"
                  className="block px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors relative"
                >
                  Saved Adages
                </Link>
                <Link
                  href="/profile/comments"
                  className="block px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors relative"
                >
                  My Comments
                  {notificationCounts.commentReactions > 0 && (
                    <span className="absolute top-1 right-1 bg-accent-primary text-text-inverse text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCounts.commentReactions > 99 ? '99+' : notificationCounts.commentReactions}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile/inbox"
                  className="block px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors relative"
                >
                  Inbox
                  {(notificationCounts.messages > 0 || notificationCounts.notifications > 0) && (
                    <span className="absolute top-1 right-1 bg-accent-primary text-text-inverse text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {(notificationCounts.messages + notificationCounts.notifications) > 99 ? '99+' : (notificationCounts.messages + notificationCounts.notifications)}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile/friends"
                  className="block px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors relative"
                >
                  Friends
                  {notificationCounts.friendRequests > 0 && (
                    <span className="absolute top-1 right-1 bg-accent-primary text-text-inverse text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCounts.friendRequests > 99 ? '99+' : notificationCounts.friendRequests}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Password Reset */}
            <PasswordResetSection />

            {/* Commendation Stats */}
            {userData?.commendationStats && <CommendationStatsSection stats={userData.commendationStats} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-xl font-bold font-serif mb-4 text-text-primary">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-center font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                {isModerator && (
                  <Link
                    href="/moderator"
                    className="block px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-center font-medium"
                  >
                    Moderator Panel
                  </Link>
                )}
                <Link
                  href="/profile/edit"
                  className="block px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-text-primary hover:text-text-inverse transition-colors text-center"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors border border-error-text/30"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors mt-2 border border-error-text/30"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-xl font-bold font-serif mb-4 text-text-primary">
                Account Status
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-metadata">Email Verified</span>
                  <span className={`text-sm font-medium ${userData?.email_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {userData?.email_verified ? '✓ Verified' : '⚠ Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-metadata">Account Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>

            {/* Email Preferences */}
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-xl font-bold font-serif mb-4 text-text-primary">
                Email Preferences
              </h2>
              <EmailPreferencesSection userEmail={userData?.email || session.user?.email || ''} />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold font-serif text-center text-text-primary mb-2">
                Delete Account
              </h2>
              <p className="text-center text-text-primary">
                Are you sure you want to delete your account?
              </p>
            </div>

            <div className="bg-error-bg border border-error-text/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-error-text font-semibold mb-2">This action cannot be undone.</p>
              <ul className="text-sm text-error-text space-y-1 list-disc list-inside">
                <li>Your account will be permanently deleted</li>
                <li>All your comments, collections, and saved content will be removed</li>
                <li>You will be logged out immediately</li>
                <li>You will need to create a new account to use the site again</li>
              </ul>
            </div>

            {deleteError && (
              <div className="bg-error-bg border border-error-text/30 text-error-text p-3 rounded-lg text-sm mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteError('')
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-text-primary hover:text-text-inverse transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

