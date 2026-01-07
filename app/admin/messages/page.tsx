'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  category: string
  read_at?: string
  created_at: string
  reply_text?: string
  reply_sent_at?: string
  user_id?: string
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
  }
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export default function AdminMessages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [replies, setReplies] = useState<MessageReply[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationRead, setNotificationRead] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === 'loading' || !session) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (showUnreadOnly) params.append('unread', 'true')
        if (categoryFilter !== 'all') params.append('category', categoryFilter)
        const url = `/api/contact${params.toString() ? '?' + params.toString() : ''}`
        const response = await fetch(url)
        const result: ApiResponse<ContactMessage[]> = await response.json()

        if (result.success && result.data) {
          setMessages(result.data)
        } else {
          setError(result.error || 'Failed to load messages')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
    fetchUnreadCount()
    // Check if notification was already read
    const readStatus = localStorage.getItem('admin_messages_read') === 'true'
    setNotificationRead(readStatus)
  }, [session, status, showUnreadOnly, categoryFilter])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/counts')
      const result: ApiResponse<{ messages: number }> = await response.json()
      if (result.success && result.data) {
        setUnreadCount(result.data.messages || 0)
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const markNotificationAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel: 'messages' }),
      })
      localStorage.setItem('admin_messages_read', 'true')
      setNotificationRead(true)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_at: new Date().toISOString() }),
      })

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, read_at: new Date().toISOString() } : msg
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
      const result = await response.json()

      if (result.success && result.data) {
        setReplies(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch replies:', err)
    } finally {
      setLoadingReplies(false)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setReplying(true)
    try {
      const response = await fetch('/api/message-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: selectedMessage.id,
          content: replyText.trim(),
          sender_type: 'admin',
        }),
      })

      const result = await response.json()
      if (result.success) {
        setReplyText('')
        fetchReplies(selectedMessage.id)
        // Send email notification
        try {
          await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply_text: replyText }),
          })
        } catch (emailErr) {
          console.error('Failed to send email notification:', emailErr)
        }
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-charcoal">Contact Messages</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
            >
              Back to Admin
            </button>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="correction">Correction/Appeal</option>
              <option value="event">Event</option>
              <option value="partnership">Partnership</option>
              <option value="donation">Donation</option>
              <option value="get_involved">Get Involved</option>
              <option value="other">Other</option>
            </select>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showUnreadOnly
                  ? 'bg-bronze text-cream'
                  : 'bg-white text-charcoal border border-soft-gray hover:border-bronze'
              }`}
            >
              {showUnreadOnly ? 'Show All' : `Show Unread Only (${messages.filter(m => !m.read_at).length})`}
            </button>
          </div>
        </div>

        {unreadCount > 0 && !notificationRead && (
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-yellow-800 mb-1">
                Unread Messages ({unreadCount})
              </h3>
              <p className="text-yellow-700 text-sm">
                There are {unreadCount} unread message(s) that need your attention.
              </p>
            </div>
            <button
              onClick={markNotificationAsRead}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Mark as Read
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-charcoal-light">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray text-center">
            <p className="text-charcoal-light">No messages found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white p-6 rounded-lg shadow-sm border-2 ${
                  !message.read_at ? 'border-bronze' : 'border-soft-gray'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold font-serif text-charcoal">
                        {message.name}
                      </h3>
                      {!message.read_at && (
                        <span className="px-2 py-1 bg-bronze text-cream rounded-full text-xs font-medium">
                          New
                        </span>
                      )}
                      <span className="px-2 py-1 bg-soft-gray text-charcoal-light rounded-full text-xs">
                        {message.category}
                      </span>
                    </div>
                    <p className="text-charcoal-light">
                      <a href={`mailto:${message.email}`} className="text-bronze hover:underline">
                        {message.email}
                      </a>
                    </p>
                    {message.subject && (
                      <p className="text-charcoal font-semibold mt-2">{message.subject}</p>
                    )}
                    <p className="text-sm text-charcoal-light mt-2">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!message.read_at && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
                <div className="mt-4 p-4 bg-cream rounded-lg">
                  <p className="text-charcoal-light whitespace-pre-line">{message.message}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMessage(message)
                      setReplyText('')
                    }}
                    className="px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors text-sm"
                  >
                    {replies.length > 0 ? 'Continue Conversation' : 'Reply'}
                  </button>
                  {!message.read_at && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors text-sm"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMessage(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold font-serif mb-4 text-charcoal">Conversation with {selectedMessage.name}</h3>
              
              {/* Conversation Thread */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {/* Original Message */}
                <div className="bg-cream p-4 rounded-lg border border-soft-gray">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-charcoal">{selectedMessage.name}</p>
                    <p className="text-xs text-charcoal-light">
                      {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="text-charcoal whitespace-pre-line">{selectedMessage.message}</p>
                </div>

                {/* Replies */}
                {loadingReplies ? (
                  <p className="text-charcoal-light text-center py-4">Loading replies...</p>
                ) : replies.length > 0 ? (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-lg border ${
                        reply.sender_type === 'admin'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-charcoal">
                          {reply.sender_type === 'admin'
                            ? 'American Adages Society'
                            : reply.sender?.display_name || reply.sender?.username || selectedMessage.name}
                        </p>
                        <p className="text-xs text-charcoal-light">
                          {new Date(reply.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <p className="text-charcoal whitespace-pre-line">{reply.content}</p>
                    </div>
                  ))
                ) : null}
              </div>

              {/* Reply Form */}
              <div className="border-t border-soft-gray pt-4">
                <label className="block text-sm font-medium text-charcoal mb-2">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-soft-gray focus:border-bronze focus:outline-none focus:ring-2 focus:ring-bronze/20 bg-white text-charcoal"
                  placeholder="Type your reply here..."
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyText.trim()}
                    className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors disabled:opacity-50"
                  >
                    {replying ? 'Sending...' : 'Send Reply'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMessage(null)
                      setReplyText('')
                    }}
                    className="px-6 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

