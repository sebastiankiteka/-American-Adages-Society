'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-lg text-text-secondary mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors font-medium"
              >
                Refresh Page
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-card-bg-muted text-text-primary rounded-lg hover:bg-accent-primary hover:text-text-inverse transition-colors font-medium"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}











