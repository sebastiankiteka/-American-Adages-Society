// API route to generate a draft of the weekly featured adage email
// Admin can preview this before sending
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'
import { format } from 'date-fns'

// GET /api/admin/mailing-list/draft-weekly - Get draft of weekly email
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    // Get currently featured adage (featured = true and featured_until is in future or null)
    const now = new Date().toISOString()
    let { data: featuredAdage, error: adageError } = await supabase
      .from('adages')
      .select('id, adage, definition, origin, featured_reason, featured_from, featured_until')
      .eq('featured', true)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .or(`featured_until.is.null,featured_until.gt.${now}`)
      .order('featured_from', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If no currently featured adage, try to get the most recently featured adage from history
    if (adageError || !featuredAdage) {
      const { data: recentFeatured } = await supabase
        .from('featured_adages_history')
        .select('adage_id, reason, featured_from, featured_until, adages!inner(id, adage, definition, origin)')
        .order('featured_from', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (recentFeatured && recentFeatured.adages) {
        featuredAdage = {
          id: recentFeatured.adages.id,
          adage: recentFeatured.adages.adage,
          definition: recentFeatured.adages.definition,
          origin: recentFeatured.adages.origin,
          featured_reason: recentFeatured.reason,
          featured_from: recentFeatured.featured_from,
          featured_until: recentFeatured.featured_until,
        }
      } else {
        // If still no featured adage, get the most recent adage
        const { data: recentAdage } = await supabase
          .from('adages')
          .select('id, adage, definition, origin')
          .is('deleted_at', null)
          .is('hidden_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (recentAdage) {
          featuredAdage = {
            id: recentAdage.id,
            adage: recentAdage.adage,
            definition: recentAdage.definition,
            origin: recentAdage.origin,
            featured_reason: null,
            featured_from: null,
            featured_until: null,
          }
        }
      }
    }

    if (!featuredAdage) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No adage found to generate draft',
      }, { status: 404 })
    }

    // Get subscriber count
    const { count: subscriberCount } = await supabase
      .from('mailing_list')
      .select('*', { count: 'exact', head: true })
      .is('unsubscribed_at', null)
      .is('deleted_at', null)
      .eq('confirmed', true)

    // Get user subscribers who want weekly adage emails
    const { count: userSubscriberCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email_weekly_adage', true)
      .is('deleted_at', null)
      .is('email_verified', true)

    const totalRecipients = (subscriberCount || 0) + (userSubscriberCount || 0)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const featuredFrom = featuredAdage.featured_from ? format(new Date(featuredAdage.featured_from), 'MMMM d, yyyy') : ''
    const featuredUntil = featuredAdage.featured_until ? format(new Date(featuredAdage.featured_until), 'MMMM d, yyyy') : ''
    const featuredDateRange = featuredFrom && featuredUntil ? `${featuredFrom} - ${featuredUntil}` : featuredFrom || ''

    // Generate draft HTML
    const draftHTML = `
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
                <p><a href="${siteUrl}/profile/edit" style="color: #8b7355;">Manage your email preferences</a> | <a href="${siteUrl}/api/mailing-list/unsubscribe?email={{EMAIL}}" style="color: #8b7355;">Unsubscribe</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        adage: {
          id: featuredAdage.id,
          adage: featuredAdage.adage,
          definition: featuredAdage.definition,
          origin: featuredAdage.origin,
          featured_reason: featuredAdage.featured_reason,
          featured_from: featuredAdage.featured_from,
          featured_until: featuredAdage.featured_until,
        },
        draft_html: draftHTML,
        subject: `Weekly Featured Adage: "${featuredAdage.adage}"`,
        recipient_count: totalRecipients,
        featured_date_range: featuredDateRange,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to generate draft',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

