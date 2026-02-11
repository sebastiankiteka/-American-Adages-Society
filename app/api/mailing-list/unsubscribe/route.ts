// API route for unsubscribing from mailing list
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// POST /api/mailing-list/unsubscribe - Unsubscribe from mailing list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required',
      }, { status: 400 })
    }

    // Find and update mailing list entry
    const { data: existing } = await supabase
      .from('mailing_list')
      .select('id, unsubscribed_at')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email not found in mailing list',
      }, { status: 404 })
    }

    if (existing.unsubscribed_at) {
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'You are already unsubscribed',
      })
    }

    // Mark as unsubscribed
    const { error } = await supabase
      .from('mailing_list')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Successfully unsubscribed from mailing list',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to unsubscribe',
    }, { status: 500 })
  }
}















