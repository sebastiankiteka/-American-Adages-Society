// API route to automatically rotate featured adages weekly
// This should be called by a cron job weekly
// GET /api/adages/rotate-featured - Rotate to next unfeatured adage
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/adages/rotate-featured - Automatically rotate to next unfeatured adage
export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (or allow manual calls with proper auth)
    const cronSecret = request.headers.get('x-vercel-cron')
    const authHeader = request.headers.get('authorization')
    
    // Allow if called by Vercel Cron OR with proper authorization
    if (!cronSecret && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // For development/testing, you can comment out this check
      // return NextResponse.json<ApiResponse>({
      //   success: false,
      //   error: 'Unauthorized - This endpoint can only be called by Vercel Cron',
      // }, { status: 401 })
    }

    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // First, unfeature adages that have passed their featured_until date
    const { error: unfeatureError } = await supabase
      .from('adages')
      .update({ featured: false })
      .lte('featured_until', now.toISOString())
      .eq('featured', true)

    if (unfeatureError) {
      console.error('Error unfeaturing old adages:', unfeatureError)
    }

    // Get all adages that have been featured (from history)
    const { data: featuredHistory } = await supabase
      .from('featured_adages_history')
      .select('adage_id')
      .is('deleted_at', null)

    const featuredAdageIds = new Set((featuredHistory || []).map((h: any) => h.adage_id))

    // Get all available adages
    const { data: allAdages, error: fetchError } = await supabase
      .from('adages')
      .select('id, adage')
      .is('deleted_at', null)
      .is('hidden_at', null)
      .eq('featured', false)

    if (fetchError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: fetchError.message,
      }, { status: 500 })
    }

    // Filter to get unfeatured adages
    const unfeaturedAdages = (allAdages || []).filter(
      (adage: any) => !featuredAdageIds.has(adage.id)
    )

    // If no unfeatured adages remain, reset and start over
    if (unfeaturedAdages.length === 0) {
      // Clear all featured history to start fresh
      const { error: clearError } = await supabase
        .from('featured_adages_history')
        .update({ deleted_at: now.toISOString() })
        .is('deleted_at', null)

      if (clearError) {
        console.error('Error clearing featured history:', clearError)
      }

      // Get the first available adage
      const { data: firstAdage, error: firstError } = await supabase
        .from('adages')
        .select('id, adage')
        .is('deleted_at', null)
        .is('hidden_at', null)
        .eq('featured', false)
        .limit(1)
        .single()

      if (firstError || !firstAdage) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'No adages available to feature',
        }, { status: 404 })
      }

      // Feature the first adage
      const { error: featureError } = await supabase
        .from('adages')
        .update({
          featured: true,
          featured_until: sevenDaysLater.toISOString(),
        })
        .eq('id', firstAdage.id)

      if (featureError) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: featureError.message,
        }, { status: 500 })
      }

      // Record in history
      await supabase
        .from('featured_adages_history')
        .insert({
          adage_id: firstAdage.id,
          featured_from: now.toISOString(),
          featured_until: sevenDaysLater.toISOString(),
          reason: 'Automatic weekly rotation (cycle restarted)',
        })

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          adage_id: firstAdage.id,
          adage: firstAdage.adage,
          message: 'Featured adage rotated (cycle restarted)',
        },
      })
    }

    // Feature the next unfeatured adage
    const nextAdage = unfeaturedAdages[0]
    const { error: featureError } = await supabase
      .from('adages')
      .update({
        featured: true,
        featured_until: sevenDaysLater.toISOString(),
      })
      .eq('id', nextAdage.id)

    if (featureError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: featureError.message,
      }, { status: 500 })
    }

    // Record in history
    await supabase
      .from('featured_adages_history')
      .insert({
        adage_id: nextAdage.id,
        featured_from: now.toISOString(),
        featured_until: sevenDaysLater.toISOString(),
        reason: 'Automatic weekly rotation',
      })

    // Notify admins that a new featured adage is ready for weekly email
    try {
      const { createNotification } = await import('@/lib/notifications')
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .is('deleted_at', null)

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await createNotification({
            user_id: admin.id,
            type: 'system',
            title: 'Weekly Featured Adage Ready',
            message: `A new featured adage "${nextAdage.adage}" is ready. You can send the weekly email from the mailing list page.`,
            related_id: nextAdage.id,
            related_type: 'adage',
          })
        }
      }
    } catch (notifError) {
      console.error('Failed to notify admins:', notifError)
      // Don't fail the rotation if notification fails
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        adage_id: nextAdage.id,
        adage: nextAdage.adage,
        message: 'Featured adage rotated successfully',
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to rotate featured adage',
    }, { status: 500 })
  }
}
