// API route for admin user management
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const subscribed = searchParams.get('subscribed') === 'true'
    const deleted = searchParams.get('deleted') === 'true'

    if (subscribed) {
      // Return count of users subscribed to weekly adage emails
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('email_weekly_adage', true)
        .is('deleted_at', null)
        .is('email_verified', true)

      if (error) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: error.message,
        }, { status: 500 })
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: { count: count || 0 },
      })
    }

    // Regular user listing
    let query = supabase
      .from('users')
      .select('id, email, username, display_name, role, email_verified, created_at, deleted_at, last_login_at')
      .order('created_at', { ascending: false })

    if (deleted) {
      query = query.not('deleted_at', 'is', null)
    } else {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get reports for each user
    const usersWithReports = await Promise.all(
      (data || []).map(async (user) => {
        const [receivedReports, acceptedReports] = await Promise.all([
          supabase
            .from('reports')
            .select('id', { count: 'exact', head: true })
            .eq('target_user_id', user.id)
            .is('deleted_at', null),
          supabase
            .from('reports')
            .select('id', { count: 'exact', head: true })
            .eq('target_user_id', user.id)
            .eq('status', 'accepted')
            .is('deleted_at', null),
        ])

        return {
          ...user,
          reports: {
            received: receivedReports.count || 0,
            accepted: acceptedReports.count || 0,
          },
        }
      })
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      data: usersWithReports,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch users',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}
