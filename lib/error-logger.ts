/**
 * Error logging utility
 * Ready for integration with Sentry or other error tracking services
 */

interface ErrorContext {
  userId?: string
  userRole?: string
  url?: string
  userAgent?: string
  timestamp?: string
  [key: string]: any
}

class ErrorLogger {
  private enabled: boolean
  private service: 'console' | 'sentry' | 'custom' = 'console'

  constructor() {
    // Enable in production or when explicitly enabled
    // Safe for both server and client usage
    this.enabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_ERROR_LOGGING === 'true'
    // Default to console if no service specified
    this.service = (process.env.NEXT_PUBLIC_ERROR_LOGGING_SERVICE as any) || 'console'
  }

  /**
   * Initialize error logging service
   * Call this in your app initialization (optional)
   * If not called, defaults to console logging
   */
  init(service: 'console' | 'sentry' | 'custom' = 'console') {
    this.service = service

    // Sentry initialization should be done in a separate file
    // This is just a placeholder for future integration
    if (service === 'sentry' && typeof window !== 'undefined') {
      // Example Sentry initialization (uncomment and configure when ready)
      // import * as Sentry from '@sentry/nextjs'
      // Sentry.init({
      //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: 0.1,
      // })
    }
  }

  /**
   * Log an error
   */
  logError(error: Error | string, context?: ErrorContext) {
    if (!this.enabled) return

    const errorMessage = error instanceof Error ? error.message : error
    const errorStack = error instanceof Error ? error.stack : undefined

    const logData = {
      message: errorMessage,
      stack: errorStack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    }

    switch (this.service) {
      case 'console':
        console.error('Error logged:', logData)
        break
      case 'sentry':
        // if (typeof window !== 'undefined' && (window as any).Sentry) {
        //   (window as any).Sentry.captureException(error, { extra: context })
        // }
        console.error('Error (Sentry not configured):', logData)
        break
      case 'custom':
        // Implement custom logging (e.g., send to your API)
        this.sendToCustomService(logData)
        break
    }
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: ErrorContext) {
    if (!this.enabled) return

    const logData = {
      message,
      level: 'warning',
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    }

    switch (this.service) {
      case 'console':
        console.warn('Warning logged:', logData)
        break
      case 'sentry':
        // if (typeof window !== 'undefined' && (window as any).Sentry) {
        //   (window as any).Sentry.captureMessage(message, 'warning', { extra: context })
        // }
        console.warn('Warning (Sentry not configured):', logData)
        break
      case 'custom':
        this.sendToCustomService(logData)
        break
    }
  }

  /**
   * Log an info message
   */
  logInfo(message: string, context?: ErrorContext) {
    if (!this.enabled) return

    const logData = {
      message,
      level: 'info',
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
    }

    switch (this.service) {
      case 'console':
        console.info('Info logged:', logData)
        break
      case 'sentry':
        // Sentry typically doesn't log info, but you can if needed
        console.info('Info:', logData)
        break
      case 'custom':
        this.sendToCustomService(logData)
        break
    }
  }

  /**
   * Send error to custom service (e.g., your API endpoint)
   */
  private async sendToCustomService(data: any) {
    try {
      // Example: Send to your API
      // await fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })
      console.log('Custom logging (not configured):', data)
    } catch (err) {
      console.error('Failed to send error to custom service:', err)
    }
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()

// Export types
export type { ErrorContext }

