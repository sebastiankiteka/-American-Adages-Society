// API route to mark a message as read
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/users/inbox/[id]/read - Mark message as read
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

    // Verify ownership
    const { data: message } = await supabase
      .from('contact_messages')
      .select('user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!message || message.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Not found or unauthorized',
      }, { status: 404 })
    }

    // Mark as read
    const { error } = await supabase
      .from('contact_messages')
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
      message: 'Message marked as read',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to mark as read',
    }, { status: 500 })
  }
}



