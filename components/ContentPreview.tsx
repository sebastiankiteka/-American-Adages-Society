'use client'

import { useState } from 'react'

interface ContentPreviewProps {
  title: string
  content: string
  excerpt?: string
  type: 'adage' | 'blog'
}

export default function ContentPreview({ title, content, excerpt, type }: ContentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-soft-gray text-charcoal rounded-lg hover:bg-charcoal hover:text-cream transition-colors text-sm font-medium"
        type="button"
      >
        Preview
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-soft-gray flex justify-between items-center">
          <h2 className="text-2xl font-bold font-serif text-charcoal">Preview: {title}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-charcoal-light hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-bronze rounded"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-lg max-w-none">
            {type === 'adage' ? (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-serif text-charcoal mb-4">"{title}"</h1>
                <div className="text-charcoal-light whitespace-pre-line">{content}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold font-serif text-charcoal mb-4">{title}</h1>
                {excerpt && (
                  <p className="text-xl text-charcoal-light italic mb-6">{excerpt}</p>
                )}
                <div className="text-charcoal-light whitespace-pre-line">{content}</div>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 border-t border-soft-gray flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  )
}


