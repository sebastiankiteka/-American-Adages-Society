// API route to send weekly featured adage email
// This should be called by a cron job weekly
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmailNotification } from '@/lib/notifications'
import { format } from 'date-fns'

// POST /api/mailing-list/send-weekly - Send weekly featured adage email (admin-triggered)
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const { requireAdmin } = await import('@/lib/api-helpers')
    await requireAdmin()

    // Get currently featured adage
    const { data: featuredAdage, error: adageError } = await supabase
      .from('adages')
      .select('id, adage, definition, origin, featured_reason, featured_from, featured_until')
      .eq('featured', true)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('featured_at', { ascending: false })
      .limit(1)
      .single()

    if (adageError || !featuredAdage) {
      return NextResponse.json({
        success: false,
        error: 'No featured adage found',
      }, { status: 404 })
    }

    // Get all users who want weekly adage emails
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, display_name, username, email_weekly_adage')
      .eq('email_weekly_adage', true)
      .is('deleted_at', null)
      .is('email_verified', true)
    

    if (usersError) {
      return NextResponse.json({
        success: false,
        error: usersError.message,
      }, { status: 500 })
    }

    // Also get non-user mailing list subscribers (only confirmed)
    const { data: mailingList, error: mailingListError } = await supabase
      .from('mailing_list')
      .select('email')
      .is('unsubscribed_at', null)
      .is('deleted_at', null)
      .eq('confirmed', true) // Only confirmed subscribers
      .is('user_id', null) // Only non-user subscribers

    if (mailingListError) {
      console.error('Error fetching mailing list:', mailingListError)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const featuredFrom = featuredAdage.featured_from ? format(new Date(featuredAdage.featured_from), 'MMMM d, yyyy') : ''
    const featuredUntil = featuredAdage.featured_until ? format(new Date(featuredAdage.featured_until), 'MMMM d, yyyy') : ''
    const featuredDateRange = featuredFrom && featuredUntil ? `${featuredFrom} - ${featuredUntil}` : featuredFrom || ''

    // Prepare email content
    const subject = `Weekly Featured Adage: "${featuredAdage.adage}"`
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b7355 0%, #6b5a45 100%); color: #f5f1e8; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
            .adage { font-size: 28px; font-weight: bold; color: #8b7355; margin: 20px 0; text-align: center; font-style: italic; }
            .definition { font-size: 16px; color: #555; margin: 20px 0; }
            .origin { font-size: 14px; color: #777; font-style: italic; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #8b7355; color: #f5f1e8; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
            .unsubscribe { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>American Adages Society</h1>
              <p>Weekly Featured Adage</p>
            </div>
            <div class="content">
              ${featuredDateRange ? `<p style="text-align: center; color: #777; font-size: 12px;">Featured: ${featuredDateRange}</p>` : ''}
              ${featuredAdage.featured_reason ? `<p style="text-align: center; color: #8b7355; font-size: 14px; font-style: italic;">${featuredAdage.featured_reason}</p>` : ''}
              <div class="adage">"${featuredAdage.adage}"</div>
              <div class="definition">${featuredAdage.definition}</div>
              ${featuredAdage.origin ? `<div class="origin">Origin: ${featuredAdage.origin}</div>` : ''}
              <div style="text-align: center;">
                <a href="${siteUrl}/archive/${featuredAdage.id}" class="button">Explore This Adage →</a>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${siteUrl}/featured-calendar" style="color: #8b7355; text-decoration: underline;">View Featured Calendar</a>
              </div>
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to our weekly featured adage emails.</p>
              <div class="unsubscribe">
                <p><a href="${siteUrl}/profile" style="color: #8b7355;">Manage your email preferences</a> | <a href="${siteUrl}/api/mailing-list/unsubscribe?email={{EMAIL}}" style="color: #8b7355;">Unsubscribe</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send emails to users
    let sentCount = 0
    let errorCount = 0

    for (const user of users || []) {
      try {
        const personalizedBody = htmlBody.replace('{{EMAIL}}', encodeURIComponent(user.email))
        await sendEmailNotification(user.email, subject, personalizedBody, true)
        sentCount++
      } catch (err) {
        console.error(`Failed to send weekly adage to ${user.email}:`, err)
        errorCount++
      }
    }

    // Send emails to non-user mailing list subscribers
    for (const subscriber of mailingList || []) {
      try {
        const personalizedBody = htmlBody.replace('{{EMAIL}}', encodeURIComponent(subscriber.email))
        await sendEmailNotification(subscriber.email, subject, personalizedBody, true)
        sentCount++
      } catch (err) {
        console.error(`Failed to send email to ${subscriber.email}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly email sent to ${sentCount} recipients${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
      data: {
        sent: sentCount,
        errors: errorCount,
        adage_id: featuredAdage.id,
        adage: featuredAdage.adage,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send weekly email',
    }, { status: 500 })
  }
}

