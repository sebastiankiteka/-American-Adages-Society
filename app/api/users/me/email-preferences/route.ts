// API route to manage user email preferences
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/users/me/email-preferences - Get user's email preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Try to fetch email preferences
    let preferences = {
      email_weekly_adage: true,
      email_events: true,
      email_site_updates: true,
      email_archive_additions: true,
      email_comment_notifications: true,
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('email_weekly_adage, email_events, email_site_updates, email_archive_additions, email_comment_notifications')
        .eq('id', user.id)
        .single()

      if (userData && !fetchError) {
        if (userData.email_weekly_adage !== null && userData.email_weekly_adage !== undefined) {
          preferences.email_weekly_adage = userData.email_weekly_adage !== false
        }
        if (userData.email_events !== null && userData.email_events !== undefined) {
          preferences.email_events = userData.email_events !== false
        }
        if (userData.email_site_updates !== null && userData.email_site_updates !== undefined) {
          preferences.email_site_updates = userData.email_site_updates !== false
        }
        if (userData.email_archive_additions !== null && userData.email_archive_additions !== undefined) {
          preferences.email_archive_additions = userData.email_archive_additions !== false
        }
        if (userData.email_comment_notifications !== null && userData.email_comment_notifications !== undefined) {
          preferences.email_comment_notifications = userData.email_comment_notifications !== false
        }
      }
    } catch (e: any) {
      console.error('Error fetching email preferences:', e)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: preferences,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch email preferences',
    }, { status: 500 })
  }
}

// PUT /api/users/me/email-preferences - Update user's email preferences
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const {
      email_weekly_adage,
      email_events,
      email_site_updates,
      email_archive_additions,
      email_comment_notifications,
    } = body

    const updateData: any = {}
    
    if (typeof email_weekly_adage === 'boolean') {
      updateData.email_weekly_adage = email_weekly_adage
    }
    if (typeof email_events === 'boolean') {
      updateData.email_events = email_events
    }
    if (typeof email_site_updates === 'boolean') {
      updateData.email_site_updates = email_site_updates
    }
    if (typeof email_archive_additions === 'boolean') {
      updateData.email_archive_additions = email_archive_additions
    }
    if (typeof email_comment_notifications === 'boolean') {
      updateData.email_comment_notifications = email_comment_notifications
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'At least one preference must be provided',
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message || 'Failed to update email preferences',
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Email preferences updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update email preferences',
    }, { status: 500 })
  }
}

