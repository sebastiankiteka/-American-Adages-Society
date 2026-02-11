import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/notifications - Get current user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    // Use supabaseAdmin to bypass RLS for server-side queries
    // User authentication is already verified above
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch notifications',
    }, { status: 500 })
  }
}












