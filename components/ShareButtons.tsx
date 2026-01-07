'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
}

export default function ShareButtons({ url, title, description, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const fullUrl = typeof window !== 'undefined' ? window.location.href : url
  const shareText = description ? `${title} - ${description}` : title

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: fullUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer')
  }

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer')
  }

  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      <span className="text-sm font-medium text-charcoal-light">Share:</span>
      
      {hasNativeShare && (
        <button
          onClick={handleNativeShare}
          className="px-3 py-1.5 text-sm bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors"
          aria-label="Share using native share dialog"
        >
          Share
        </button>
      )}
      
      <button
        onClick={handleCopyLink}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          copied
            ? 'bg-green-100 text-green-800'
            : 'bg-soft-gray text-charcoal hover:bg-bronze hover:text-cream'
        }`}
        aria-label="Copy link to clipboard"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>

      <button
        onClick={shareToTwitter}
        className="px-3 py-1.5 text-sm bg-soft-gray text-charcoal rounded-lg hover:bg-[#1DA1F2] hover:text-white transition-colors"
        aria-label="Share on Twitter"
      >
        Twitter
      </button>

      <button
        onClick={shareToFacebook}
        className="px-3 py-1.5 text-sm bg-soft-gray text-charcoal rounded-lg hover:bg-[#1877F2] hover:text-white transition-colors"
        aria-label="Share on Facebook"
      >
        Facebook
      </button>

      <button
        onClick={shareToLinkedIn}
        className="px-3 py-1.5 text-sm bg-soft-gray text-charcoal rounded-lg hover:bg-[#0A66C2] hover:text-white transition-colors"
        aria-label="Share on LinkedIn"
      >
        LinkedIn
      </button>
    </div>
  )
}


