'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ImageUpload from '@/components/ImageUpload'

interface UserData {
  id: string
  email: string
  username?: string
  display_name?: string
  bio?: string
  profile_image_url?: string
  profile_private?: boolean
  comments_friends_only?: boolean
  email_preferences?: {
    email_weekly_adage: boolean
    email_events: boolean
    email_site_updates: boolean
    email_archive_additions: boolean
    email_comment_notifications: boolean
  }
}

interface MailingListStatus {
  subscribed: boolean
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function EditProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState<UserData>({
    id: '',
    email: '',
    username: '',
    display_name: '',
    bio: '',
    profile_image_url: '',
    profile_private: false,
    comments_friends_only: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mailingListSubscribed, setMailingListSubscribed] = useState<boolean | null>(null)
  const [emailPreferences, setEmailPreferences] = useState({
    email_weekly_adage: true,
    email_events: true,
    email_site_updates: true,
    email_archive_additions: true,
    email_comment_notifications: true,
  })
  const [subscribing, setSubscribing] = useState(false)
  const [unsubscribing, setUnsubscribing] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/me')
        const result: ApiResponse<UserData> = await response.json()

        if (result.success && result.data) {
          setFormData(result.data)
          if (result.data.email_preferences) {
            setEmailPreferences(result.data.email_preferences)
          }
        }

        // Fetch mailing list status
        const mailingListResponse = await fetch(`/api/mailing-list/status?email=${encodeURIComponent(result.data?.email || '')}`)
        const mailingListResult: ApiResponse<MailingListStatus> = await mailingListResponse.json()
        if (mailingListResult.success && mailingListResult.data) {
          setMailingListSubscribed(mailingListResult.data.subscribed)
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username || null,
          display_name: formData.display_name || null,
          bio: formData.bio || null,
          profile_image_url: formData.profile_image_url || null,
          profile_private: formData.profile_private || false,
          comments_friends_only: formData.comments_friends_only || false,
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Update email preferences separately
        const prefsResponse = await fetch('/api/users/me/email-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPreferences),
        })
        const prefsResult = await prefsResponse.json()
        
        if (prefsResult.success) {
          setSuccess(true)
          setTimeout(() => {
            router.push('/profile')
          }, 2000)
        } else {
          setError(prefsResult.error || 'Profile updated but email preferences failed')
        }
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
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
    return null
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-text-primary">Edit Profile</h1>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg hover:border-border-medium border border-border-medium transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-border-medium bg-card-bg-muted text-text-metadata cursor-not-allowed"
            />
            <p className="text-xs text-text-metadata mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              placeholder="username"
            />
            <p className="text-xs text-text-metadata mt-1">Your unique username (optional)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.display_name || ''}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              placeholder="Your Name"
            />
            <p className="text-xs text-text-metadata mt-1">How your name appears to others</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-text-metadata mt-1">A short bio about yourself (optional)</p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.profile_private || false}
                onChange={(e) => setFormData({ ...formData, profile_private: e.target.checked })}
                className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">Private Profile</span>
                <p className="text-xs text-text-metadata">Prevent others from sending you friend requests</p>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.comments_friends_only || false}
                onChange={(e) => setFormData({ ...formData, comments_friends_only: e.target.checked })}
                className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">Friends-Only Comments</span>
                <p className="text-xs text-text-metadata">Only allow friends to comment on your adages and blog posts</p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Profile Image
            </label>
            <div className="space-y-3">
              {formData.profile_image_url && !formData.profile_image_url.startsWith('data:') && (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.profile_image_url}
                    alt="Current profile"
                    className="w-24 h-24 object-cover rounded-full border-2 border-accent-primary"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile_image_url: '' })}
                    className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                  >
                    Remove Image
                  </button>
                </div>
              )}
              
              <details className="group">
                <summary className="cursor-pointer px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors text-sm font-medium border border-border-medium">
                  {formData.profile_image_url ? 'Change Profile Image' : 'Upload Profile Image'}
                </summary>
                <div className="mt-3 p-4 bg-card-bg-muted rounded-lg border border-border-medium">
                  <ImageUpload
                    currentImageUrl={formData.profile_image_url}
                    onImageChange={(imageUrl) => setFormData({ ...formData, profile_image_url: imageUrl })}
                    onCancel={() => {}}
                  />
                </div>
              </details>

              <div className="text-xs text-text-metadata">
                Or enter a URL:
              </div>
              <input
                type="url"
                value={formData.profile_image_url?.startsWith('data:') ? '' : (formData.profile_image_url || '')}
                onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg-muted text-text-primary"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Mailing List Subscription */}
          <div className="border-t border-border-medium pt-6">
            <h2 className="text-xl font-bold font-serif mb-4 text-text-primary">Mailing List</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Subscription Status:</span>
                <span className={`text-sm font-medium ${mailingListSubscribed ? 'text-success-text' : 'text-text-metadata'}`}>
                  {mailingListSubscribed ? '✓ Subscribed' : 'Not Subscribed'}
                </span>
              </div>

              {!mailingListSubscribed ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.email) {
                      alert('Email address is required')
                      return
                    }
                    setSubscribing(true)
                    try {
                      const response = await fetch('/api/mailing-list', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email, source: 'profile' }),
                      })
                      const result = await response.json()
                      if (result.success) {
                        setMailingListSubscribed(true)
                        alert('Successfully subscribed to mailing list!')
                      } else {
                        alert(result.error || 'Failed to subscribe')
                      }
                    } catch (err) {
                      alert('An error occurred. Please try again.')
                    } finally {
                      setSubscribing(false)
                    }
                  }}
                  disabled={subscribing}
                  className="w-full px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe to Mailing List'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Are you sure you want to unsubscribe from the mailing list?')) {
                      return
                    }
                    setUnsubscribing(true)
                    try {
                      const response = await fetch('/api/mailing-list/unsubscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formData.email }),
                      })
                      const result = await response.json()
                      if (result.success) {
                        setMailingListSubscribed(false)
                        alert('Successfully unsubscribed from mailing list')
                      } else {
                        alert(result.error || 'Failed to unsubscribe')
                      }
                    } catch (err) {
                      alert('An error occurred. Please try again.')
                    } finally {
                      setUnsubscribing(false)
                    }
                  }}
                  disabled={unsubscribing}
                  className="w-full px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm disabled:opacity-50 border border-error-text/30"
                >
                  {unsubscribing ? 'Unsubscribing...' : 'Unsubscribe from Mailing List'}
                </button>
              )}
            </div>
          </div>

          {/* Email Preferences */}
          {mailingListSubscribed && (
            <div className="border-t border-border-medium pt-6">
              <h2 className="text-xl font-bold font-serif mb-4 text-text-primary">Email Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-text-primary">Weekly Featured Adage</span>
                    <p className="text-xs text-text-metadata">Receive the weekly featured adage in your inbox</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPreferences.email_weekly_adage}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, email_weekly_adage: e.target.checked })}
                    className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-text-primary">Events</span>
                    <p className="text-xs text-text-metadata">Get notified about upcoming events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPreferences.email_events}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, email_events: e.target.checked })}
                    className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-text-primary">Site Updates</span>
                    <p className="text-xs text-text-metadata">News about new features and improvements</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPreferences.email_site_updates}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, email_site_updates: e.target.checked })}
                    className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-text-primary">Archive Additions</span>
                    <p className="text-xs text-text-metadata">Notifications when new adages are added</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPreferences.email_archive_additions}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, email_archive_additions: e.target.checked })}
                    className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-text-primary">Comment Notifications</span>
                    <p className="text-xs text-text-metadata">Get notified when someone comments on your content</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailPreferences.email_comment_notifications}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, email_comment_notifications: e.target.checked })}
                    className="w-5 h-5 text-accent-primary rounded focus:ring-accent-primary"
                  />
                </label>

              </div>
            </div>
          )}

          {error && (
            <div className="bg-error-bg border border-error-text/30 text-error-text p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success-bg border border-success-text/30 text-success-text p-3 rounded-lg text-sm">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-6 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

