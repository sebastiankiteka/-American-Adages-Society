// API route for admins to send event, site update, or archive addition emails
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'
import { sendEventNotificationEmail, sendSiteUpdateEmail, sendArchiveAdditionEmail } from '@/lib/email-helpers'

// POST /api/admin/send-email - Send email to mailing list
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { type, title, description, link, adage_id, adage_text } = body

    if (!type || !['event', 'site_update', 'archive_addition'].includes(type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email type. Must be "event", "site_update", or "archive_addition"',
      }, { status: 400 })
    }

    let sentCount = 0

    if (type === 'event') {
      if (!title || !description) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Title and description are required for event emails',
        }, { status: 400 })
      }
      sentCount = await sendEventNotificationEmail(title, description, body.date, link)
    } else if (type === 'site_update') {
      if (!title || !description) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Title and description are required for site update emails',
        }, { status: 400 })
      }
      sentCount = await sendSiteUpdateEmail(title, description, link)
    } else if (type === 'archive_addition') {
      if (!adage_id || !adage_text) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'adage_id and adage_text are required for archive addition emails',
        }, { status: 400 })
      }
      sentCount = await sendArchiveAdditionEmail(adage_id, adage_text)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Email sent to ${sentCount} recipients`,
      data: { sent: sentCount },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to send email',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


