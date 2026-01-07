'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Appeal Button Component
function AppealButton({ notificationId, relatedId, relatedType }: { notificationId: string; relatedId?: string; relatedType?: string }) {
  const [showAppealForm, setShowAppealForm] = useState(false)
  const [appealMessage, setAppealMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [canAppeal, setCanAppeal] = useState(true)

  useEffect(() => {
    // Check if appeal is allowed
    const checkAppealStatus = async () => {
      if (!relatedId || !relatedType) return
      
      try {
        const response = await fetch(`/api/challenges?target_type=${relatedType}&target_id=${relatedId}&status=accepted`)
        const result = await response.json()
        
        if (result.success && result.data && result.data.length > 0) {
          const challenge = result.data[0]
          if (challenge.appeal_allowed === false || (challenge.appeal_count && challenge.appeal_count >= 1)) {
            setCanAppeal(false)
          }
        }
      } catch (err) {
        console.error('Failed to check appeal status:', err)
      }
    }

    checkAppealStatus()
  }, [relatedId, relatedType])

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!appealMessage.trim()) {
      setError('Please provide a reason for your appeal')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_id: notificationId,
          appeal_message: appealMessage.trim(),
          related_id: relatedId,
          related_type: relatedType,
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        alert('Appeal submitted successfully! Our team will review it and get back to you.')
        setShowAppealForm(false)
        setAppealMessage('')
        setCanAppeal(false) // Disable further appeals
      } else {
        setError(result.error || 'Failed to submit appeal')
        if (result.error?.includes('already submitted')) {
          setCanAppeal(false)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit appeal')
    } finally {
      setSubmitting(false)
    }
  }

  if (!canAppeal) {
    return (
      <p className="text-sm text-error-text">
        You have already submitted an appeal for this report. Further appeals are not allowed.
      </p>
    )
  }

  if (!showAppealForm) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowAppealForm(true)
        }}
        className="px-4 py-2 bg-warning-bg text-warning-text rounded-lg hover:bg-warning-text/20 transition-colors text-sm border border-warning-text/30"
      >
        Appeal This Decision
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmitAppeal} className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <textarea
        value={appealMessage}
        onChange={(e) => setAppealMessage(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-warning-text/30 focus:border-warning-text focus:outline-none focus:ring-2 focus:ring-warning-text/20 bg-card-bg-muted text-text-primary text-sm"
        placeholder="Please explain why you believe this decision is incorrect..."
        required
      />
      {error && (
        <p className="text-sm text-error-text">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !appealMessage.trim()}
          className="px-4 py-2 bg-warning-bg text-warning-text rounded-lg hover:bg-warning-text/20 transition-colors text-sm disabled:opacity-50 border border-warning-text/30"
        >
          {submitting ? 'Submitting...' : 'Submit Appeal'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowAppealForm(false)
            setAppealMessage('')
            setError('')
          }}
          className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

interface Message {
  id: string
  name: string
  email: string
  message: string
  category: string
  created_at: string
  reply_text?: string
  reply_sent_at?: string
  read_at?: string
}

interface MessageReply {
  id: string
  message_id: string
  sender_type: 'user' | 'admin'
  sender_id?: string
  content: string
  created_at: string
  sender?: {
    username?: string
    display_name?: string
    profile_image_url?: string
  }
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  related_id?: string
  related_type?: string
  read_at?: string
  created_at: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function Inbox() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages')
  const [messages, setMessages] = useState<Message[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replies, setReplies] = useState<MessageReply[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [newReply, setNewReply] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [messagesRes, notificationsRes] = await Promise.all([
          fetch('/api/users/inbox'),
          fetch('/api/notifications'),
        ])

        const messagesResult: ApiResponse<Message[]> = await messagesRes.json()
        const notificationsResult: ApiResponse<Notification[]> = await notificationsRes.json()

        if (messagesResult.success && messagesResult.data) {
          setMessages(messagesResult.data)
        }

        if (notificationsResult.success && notificationsResult.data) {
          setNotifications(notificationsResult.data)
        }

        if (!messagesResult.success && !notificationsResult.success) {
          setError(messagesResult.error || notificationsResult.error || 'Failed to load inbox')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load inbox')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/users/inbox/${messageId}/read`, {
        method: 'POST',
      })
      const result: ApiResponse = await response.json()

      if (result.success) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
        ))
      }
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const fetchReplies = async (messageId: string) => {
    setLoadingReplies(true)
    try {
      const response = await fetch(`/api/message-replies?message_id=${messageId}`)
      const result: ApiResponse<MessageReply[]> = await response.json()

      if (result.success && result.data) {
        setReplies(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch replies:', err)
    } finally {
      setLoadingReplies(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !newReply.trim()) return

    setReplying(true)
    try {
      const response = await fetch('/api/message-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: selectedMessage.id,
          content: newReply.trim(),
          sender_type: 'user',
        }),
      })

      const result: ApiResponse = await response.json()
      if (result.success) {
        setNewReply('')
        fetchReplies(selectedMessage.id)
      } else {
        alert(result.error || 'Failed to send reply')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  useEffect(() => {
    if (selectedMessage) {
      fetchReplies(selectedMessage.id)
    } else {
      setReplies([])
    }
  }, [selectedMessage])

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

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      const result: ApiResponse = await response.json()

      if (result.success) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        ))
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const unreadMessagesCount = messages.filter(m => !m.read_at).length
  const unreadNotificationsCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif text-text-primary">Inbox</h1>
            {activeTab === 'messages' && unreadMessagesCount > 0 && (
              <p className="text-text-secondary mt-2">
                {unreadMessagesCount} unread message{unreadMessagesCount !== 1 ? 's' : ''}
              </p>
            )}
            {activeTab === 'notifications' && unreadNotificationsCount > 0 && (
              <p className="text-text-secondary mt-2">
                {unreadNotificationsCount} unread notification{unreadNotificationsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg border border-border-medium transition-colors"
          >
            Back to Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-medium mb-6">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'messages'
                ? 'border-b-2 border-accent-primary text-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Messages {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-lg font-medium ${
              activeTab === 'notifications'
                ? 'border-b-2 border-accent-primary text-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Notifications {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
          </button>
        </div>

        {error && (
          <div className="bg-error-bg border border-error-text/30 text-error-text p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {activeTab === 'notifications' ? (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
                <p className="text-lg text-text-secondary">You don't have any notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-card-bg p-6 rounded-lg shadow-sm border ${
                    notification.read_at ? 'border-border-medium' : 'border-accent-primary border-2'
                  }`}
                  onClick={() => {
                    if (!notification.read_at) {
                      markNotificationAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold font-serif text-text-primary">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!notification.read_at && (
                        <span className="w-3 h-3 bg-accent-primary rounded-full"></span>
                      )}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to dismiss this notification?')) {
                            try {
                              const response = await fetch(`/api/notifications/${notification.id}`, {
                                method: 'DELETE',
                              })
                              const result: ApiResponse = await response.json()
                              if (result.success) {
                                setNotifications(notifications.filter(n => n.id !== notification.id))
                              } else {
                                alert(result.error || 'Failed to dismiss notification')
                              }
                            } catch (err: any) {
                              alert(err.message || 'Failed to dismiss notification')
                            }
                          }
                        }}
                        className="text-text-metadata hover:text-error-text text-sm px-2 py-1"
                        title="Dismiss notification"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="text-text-secondary mb-2">
                    {/* Display notification message with proper formatting */}
                    {notification.type === 'appeal_response' ? (
                      <div className="space-y-2">
                        <p className="whitespace-pre-line">{notification.message}</p>
                        {notification.related_id && notification.related_type && (
                          <a
                            href={
                              notification.related_type === 'comment'
                                ? `/archive/${notification.related_id}`
                                : notification.related_type === 'adage'
                                ? `/archive/${notification.related_id}`
                                : notification.related_type === 'blog'
                                ? `/blog/${notification.related_id}`
                                : '#'
                            }
                            className="inline-block px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-primary/90 transition-colors text-sm mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Content →
                          </a>
                        )}
                      </div>
                    ) : notification.message.includes('View reported content:') ? (
                      notification.message.split('View reported content:').map((part, idx) => {
                        if (idx === 0) {
                          return <p key={idx} className="whitespace-pre-line">{part.trim()}</p>
                        }
                        const url = part.trim().split('\n')[0]
                        return (
                          <div key={idx} className="mt-2">
                            <a
                              href={url}
                              className="inline-block px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-primary/90 transition-colors text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Reported Content →
                            </a>
                          </div>
                        )
                      })
                    ) : (
                      <p className="whitespace-pre-line">{notification.message}</p>
                    )}
                  </div>
                  <p className="text-xs text-text-metadata">
                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {notification.type === 'report_warning' && (
                    <div className="mt-4 p-3 bg-warning-bg border border-warning-text/30 rounded-lg">
                      <p className="text-sm text-warning-text mb-3">
                        If you believe this decision is incorrect, you can appeal this warning.
                      </p>
                      <AppealButton 
                        notificationId={notification.id}
                        relatedId={notification.related_id}
                        relatedType={notification.related_type}
                      />
                    </div>
                  )}
                  {notification.type === 'friend_request' && notification.related_id && (
                    <div className="mt-4 p-3 bg-card-bg-muted border border-border-medium rounded-lg">
                      <p className="text-sm text-text-primary mb-3">
                        You can accept or reject this friend request.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              // Extract user ID from notification message or related_id
                              // The related_id is the friendship ID, we need to get the user_id from it
                              const friendshipResponse = await fetch(`/api/friends?status=all`)
                              const friendshipResult: ApiResponse<any[]> = await friendshipResponse.json()
                              if (friendshipResult.success && friendshipResult.data) {
                                const friendship = friendshipResult.data.find(f => f.id === notification.related_id)
                                if (friendship) {
                                  const requesterId = friendship.direction === 'incoming' 
                                    ? friendship.user_id 
                                    : friendship.friend_id
                                  const response = await fetch(`/api/friends/${requesterId}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'accept' }),
                                  })
                                  const result: ApiResponse = await response.json()
                                  if (result.success) {
                                    setNotifications(notifications.filter(n => n.id !== notification.id))
                                    alert('Friend request accepted!')
                                    // Refresh notifications
                                    const refreshResponse = await fetch('/api/notifications')
                                    const refreshResult: ApiResponse<any[]> = await refreshResponse.json()
                                    if (refreshResult.success && refreshResult.data) {
                                      setNotifications(refreshResult.data)
                                    }
                                  } else {
                                    alert(result.error || 'Failed to accept friend request')
                                  }
                                }
                              }
                            } catch (err: any) {
                              alert(err.message || 'Failed to accept friend request')
                            }
                          }}
                          className="px-4 py-2 bg-success-bg text-success-text rounded-lg hover:bg-success-text/20 transition-colors text-sm border border-success-text/30"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('Are you sure you want to reject this friend request?')) {
                              try {
                                const friendshipResponse = await fetch(`/api/friends?status=all`)
                                const friendshipResult: ApiResponse<any[]> = await friendshipResponse.json()
                                if (friendshipResult.success && friendshipResult.data) {
                                  const friendship = friendshipResult.data.find(f => f.id === notification.related_id)
                                  if (friendship) {
                                    const requesterId = friendship.direction === 'incoming' 
                                      ? friendship.user_id 
                                      : friendship.friend_id
                                    const response = await fetch(`/api/friends/${requesterId}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ action: 'reject' }),
                                    })
                                    const result: ApiResponse = await response.json()
                                    if (result.success) {
                                      setNotifications(notifications.filter(n => n.id !== notification.id))
                                      alert('Friend request rejected')
                                      // Refresh notifications
                                      const refreshResponse = await fetch('/api/notifications')
                                      const refreshResult: ApiResponse<any[]> = await refreshResponse.json()
                                      if (refreshResult.success && refreshResult.data) {
                                        setNotifications(refreshResult.data)
                                      }
                                    } else {
                                      alert(result.error || 'Failed to reject friend request')
                                    }
                                  }
                                }
                              } catch (err: any) {
                                alert(err.message || 'Failed to reject friend request')
                              }
                            }
                          }}
                          className="px-4 py-2 bg-error-bg text-error-text rounded-lg hover:bg-error-text/20 transition-colors text-sm border border-error-text/30"
                        >
                          Reject
                        </button>
                        <Link
                          href={`/profile/friends`}
                          className="px-4 py-2 bg-card-bg-muted text-text-primary rounded-lg hover:bg-card-bg hover:text-text-inverse transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Friends
                        </Link>
                      </div>
                    </div>
                  )}
                  {notification.type === 'appeal_response' && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      notification.title === 'Appeal Accepted'
                        ? 'bg-success-bg border-success-text/30'
                        : 'bg-error-bg border-error-text/30'
                    }`}>
                      <p className={`text-sm ${
                        notification.title === 'Appeal Accepted'
                          ? 'text-success-text'
                          : 'text-error-text'
                      }`}>
                        {notification.title === 'Appeal Accepted'
                          ? '✓ Your appeal has been accepted and the warning has been removed.'
                          : 'This decision is final and no further appeals are allowed.'}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
            <p className="text-lg text-text-secondary mb-4">You don't have any messages yet.</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="md:col-span-1 space-y-2">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg)
                    if (!msg.read_at) {
                      markAsRead(msg.id)
                    }
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedMessage?.id === msg.id
                      ? 'bg-accent-primary text-text-inverse border-accent-primary'
                      : msg.read_at
                      ? 'bg-card-bg border-border-medium hover:border-accent-primary/50'
                      : 'bg-card-bg-muted border-accent-primary/50 hover:border-accent-primary'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className={`font-semibold ${selectedMessage?.id === msg.id ? 'text-text-inverse' : 'text-text-primary'}`}>
                      {msg.category === 'get_involved' ? 'Get Involved' : msg.category}
                    </p>
                    {!msg.read_at && (
                      <span className="w-2 h-2 bg-accent-primary rounded-full"></span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${selectedMessage?.id === msg.id ? 'text-text-inverse/90' : 'text-text-secondary'}`}>
                    {msg.message.substring(0, 50)}...
                  </p>
                  <p className={`text-xs mt-2 ${selectedMessage?.id === msg.id ? 'text-text-inverse/80' : 'text-text-metadata'}`}>
                    {new Date(msg.created_at).toLocaleDateString()}
                  </p>
                  {msg.reply_text && (
                    <p className={`text-xs mt-1 ${selectedMessage?.id === msg.id ? 'text-text-inverse/80' : 'text-success-text'}`}>
                      ✓ Replied
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Message Detail */}
            <div className="md:col-span-2">
              {selectedMessage ? (
                <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">
                        {selectedMessage.category === 'get_involved' ? 'Get Involved' : selectedMessage.category}
                      </h2>
                      <p className="text-text-metadata">
                        {new Date(selectedMessage.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-metadata mb-1">From</label>
                      <p className="text-text-primary">{selectedMessage.name} ({selectedMessage.email})</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-metadata mb-1">Message</label>
                      <div className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                        <p className="text-text-primary whitespace-pre-line">{selectedMessage.message}</p>
                      </div>
                    </div>

                    {/* Threaded Conversation */}
                    <div>
                      <label className="block text-sm font-medium text-text-metadata mb-2">Conversation</label>
                      <div className="space-y-3">
                        {/* Original Message */}
                        <div className="bg-card-bg-muted p-4 rounded-lg border border-border-medium">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-text-primary">{selectedMessage.name}</p>
                            <p className="text-xs text-text-metadata">
                              {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <p className="text-text-primary whitespace-pre-line">{selectedMessage.message}</p>
                        </div>

                        {/* Replies */}
                        {loadingReplies ? (
                          <p className="text-text-secondary text-center py-4">Loading replies...</p>
                        ) : replies.length > 0 ? (
                          replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`p-4 rounded-lg border ${
                                reply.sender_type === 'admin'
                                  ? 'bg-success-bg border-success-text/30'
                                  : 'bg-card-bg-muted border-border-medium'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-text-primary">
                                  {reply.sender_type === 'admin'
                                    ? 'American Adages Society'
                                    : reply.sender?.display_name || reply.sender?.username || 'You'}
                                </p>
                                <p className="text-xs text-text-metadata">
                                  {new Date(reply.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <p className="text-text-primary whitespace-pre-line">{reply.content}</p>
                            </div>
                          ))
                        ) : null}

                        {/* Reply Form */}
                        <form onSubmit={handleReply} className="mt-4">
                          <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-border-medium focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 bg-card-bg text-text-primary"
                            placeholder="Type your reply..."
                          />
                          <button
                            type="submit"
                            disabled={replying || !newReply.trim()}
                            className="mt-2 px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
                          >
                            {replying ? 'Sending...' : 'Send Reply'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card-bg p-12 rounded-lg shadow-sm border border-border-medium text-center">
                  <p className="text-text-secondary">Select a message to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

