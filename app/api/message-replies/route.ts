// API route for message replies (threaded conversations)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/message-replies?message_id=xxx - Get replies for a message
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const messageId = searchParams.get('message_id')

    if (!messageId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'message_id is required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('message_replies')
      .select(`
        id,
        message_id,
        sender_type,
        sender_id,
        content,
        created_at,
        sender:users!sender_id (
          username,
          display_name,
          profile_image_url
        )
      `)
      .eq('message_id', messageId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

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
      error: error.message || 'Failed to fetch replies',
    }, { status: 500 })
  }
}

// POST /api/message-replies - Create a reply (user or admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message_id, content, sender_type } = body

    if (!message_id || !content || !sender_type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'message_id, content, and sender_type are required',
      }, { status: 400 })
    }

    let senderId = null

    if (sender_type === 'admin') {
      await requireAdmin()
      const admin = await getCurrentUser()
      if (!admin) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Unauthorized',
        }, { status: 401 })
      }
      senderId = admin.id
    } else if (sender_type === 'user') {
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Unauthorized',
        }, { status: 401 })
      }
      senderId = user.id
    }

    // Verify message exists and user has access
    const { data: message } = await supabase
      .from('contact_messages')
      .select('user_id')
      .eq('id', message_id)
      .is('deleted_at', null)
      .single()

    if (!message) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Message not found',
      }, { status: 404 })
    }

    // User can only reply to their own messages, admin can reply to any
    if (sender_type === 'user' && message.user_id !== senderId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('message_replies')
      .insert({
        message_id,
        sender_type,
        sender_id: senderId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Reply posted successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to post reply',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

