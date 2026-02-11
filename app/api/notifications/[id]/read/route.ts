import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/notifications/[id]/read - Mark notification as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { id } = params

    // Verify ownership - use supabaseAdmin to bypass RLS
    const { data: notification } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .maybeSingle()

    if (!notification || notification.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Not found or unauthorized',
      }, { status: 404 })
    }

    // Mark as read - use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to mark notification as read',
    }, { status: 500 })
  }
}












