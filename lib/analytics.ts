/**
 * Analytics tracking utility
 * Ready for integration with Google Analytics, Plausible, or custom analytics
 * 
 * Configuration:
 * - Set NEXT_PUBLIC_ANALYTICS_ENABLED=true to enable tracking
 * - Set NEXT_PUBLIC_ANALYTICS_SERVICE to 'ga4', 'plausible', or 'custom'
 * - If not configured, all tracking calls are no-ops (safe for production)
 * 
 * Usage:
 * - Import: import { analytics } from '@/lib/analytics'
 * - Track page view: analytics.trackPageView({ path: '/page', title: 'Page Title' })
 * - Track event: analytics.trackEvent({ category: 'User', action: 'click', label: 'button' })
 * 
 * Note: This utility is client-side only. Calls from server components are ignored.
 */

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  [key: string]: any
}

interface PageView {
  path: string
  title?: string
  [key: string]: any
}

class Analytics {
  private enabled: boolean
  private service: 'none' | 'ga4' | 'plausible' | 'custom' = 'none'

  constructor() {
    // Only enable in browser environment
    if (typeof window === 'undefined') {
      this.enabled = false
      this.service = 'none'
      return
    }
    this.enabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
    this.service = (process.env.NEXT_PUBLIC_ANALYTICS_SERVICE as any) || 'none'
  }

  /**
   * Initialize analytics service
   */
  init() {
    if (!this.enabled || this.service === 'none') return

    if (typeof window === 'undefined') return

    switch (this.service) {
      case 'ga4':
        // Google Analytics 4
        // Add your GA4 script tag in layout.tsx or use next/script
        // Example: <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        break
      case 'plausible':
        // Plausible Analytics
        // Add script tag: <Script data-domain="yourdomain.com" src="https://plausible.io/js/script.js" />
        break
      case 'custom':
        // Custom analytics endpoint
        break
    }
  }

  /**
   * Track a page view
   */
  trackPageView(data: PageView) {
    if (!this.enabled) return

    if (typeof window === 'undefined') return

    switch (this.service) {
      case 'ga4':
        // if ((window as any).gtag) {
        //   (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        //     page_path: data.path,
        //     page_title: data.title,
        //   })
        // }
        this.log('Page view', data)
        break
      case 'plausible':
        // if ((window as any).plausible) {
        //   (window as any).plausible('pageview', { url: data.path })
        // }
        this.log('Page view', data)
        break
      case 'custom':
        this.sendToCustomService('pageview', data)
        break
      default:
        this.log('Page view', data)
    }
  }

  /**
   * Track an event
   * Safe to call from client components only
   */
  trackEvent(event: AnalyticsEvent) {
    // Early return if not enabled or in server environment
    if (!this.enabled || typeof window === 'undefined') return

    switch (this.service) {
      case 'ga4':
        // if ((window as any).gtag) {
        //   (window as any).gtag('event', event.action, {
        //     event_category: event.category,
        //     event_label: event.label,
        //     value: event.value,
        //   })
        // }
        this.log('Event', event)
        break
      case 'plausible':
        // Plausible uses custom events
        // if ((window as any).plausible) {
        //   (window as any).plausible(event.action, { props: event })
        // }
        this.log('Event', event)
        break
      case 'custom':
        this.sendToCustomService('event', event)
        break
      default:
        this.log('Event', event)
    }
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      category: 'Search',
      action: 'search',
      label: query,
      value: resultsCount,
    })
  }

  /**
   * Track adage view
   */
  trackAdageView(adageId: string, adage: string) {
    this.trackEvent({
      category: 'Adage',
      action: 'view',
      label: adage,
      adageId,
    })
  }

  /**
   * Track blog post view
   */
  trackBlogView(postId: string, title: string) {
    this.trackEvent({
      category: 'Blog',
      action: 'view',
      label: title,
      postId,
    })
  }

  /**
   * Track user action (save, favorite, comment, etc.)
   */
  trackUserAction(action: string, targetType: string, targetId: string) {
    this.trackEvent({
      category: 'User Action',
      action,
      label: `${targetType}:${targetId}`,
      targetType,
      targetId,
    })
  }

  /**
   * Send to custom analytics service
   */
  private async sendToCustomService(type: string, data: any) {
    try {
      // Example: Send to your API
      // await fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, data, timestamp: new Date().toISOString() }),
      // })
      this.log(`Custom analytics (${type})`, data)
    } catch (err) {
      console.error('Failed to send analytics:', err)
    }
  }

  /**
   * Fallback logging
   */
  private log(type: string, data: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${type}:`, data)
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Export types
export type { AnalyticsEvent, PageView }

