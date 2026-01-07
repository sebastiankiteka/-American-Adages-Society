'use client'

import { useState, useRef, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  rows = 6,
  className = '',
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleFormat = (command: string, value?: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value || textarea.value.substring(start, end)
    const before = textarea.value.substring(0, start)
    const after = textarea.value.substring(end)

    let formattedText = selectedText
    let newCursorPos = start

    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`
        newCursorPos = start + 2 + selectedText.length
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        newCursorPos = start + 1 + selectedText.length
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) {
          formattedText = `[${selectedText}](${url})`
          newCursorPos = start + selectedText.length + 3 + url.length
        } else {
          return
        }
        break
      case 'list':
        const lines = selectedText.split('\n')
        formattedText = lines.map(line => line.trim() ? `- ${line.trim()}` : line).join('\n')
        newCursorPos = start + formattedText.length
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        newCursorPos = start + 2 + selectedText.length
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        newCursorPos = start + 1 + selectedText.length
        break
      default:
        return
    }

    const newValue = before + formattedText + after
    onChange(newValue)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className={`border border-soft-gray rounded-lg overflow-hidden ${isFocused ? 'border-bronze ring-2 ring-bronze/20' : ''} ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-soft-gray border-b border-soft-gray">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className="p-2 hover:bg-white rounded text-charcoal hover:text-bronze transition-colors"
          title="Bold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className="p-2 hover:bg-white rounded text-charcoal hover:text-bronze transition-colors"
          title="Italic"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleFormat('link')}
          className="p-2 hover:bg-white rounded text-charcoal hover:text-bronze transition-colors"
          title="Insert Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <div className="w-px h-6 bg-charcoal-light/30 mx-1" />
        <button
          type="button"
          onClick={() => handleFormat('list')}
          className="p-2 hover:bg-white rounded text-charcoal hover:text-bronze transition-colors"
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleFormat('quote')}
          className="p-2 hover:bg-white rounded text-charcoal hover:text-bronze transition-colors"
          title="Quote"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleFormat('code')}
          className="p-2 hover:bg-white rounded text-charcoal hover:text-bronze transition-colors"
          title="Code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <div className="flex-1" />
        <span className="text-xs text-charcoal-light px-2">Markdown supported</span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2 rounded-lg focus:outline-none bg-white text-charcoal resize-y"
      />
    </div>
  )
}


