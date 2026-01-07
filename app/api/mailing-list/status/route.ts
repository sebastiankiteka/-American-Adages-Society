// API route to check mailing list subscription status
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/mailing-list/status - Check if email is subscribed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const user = await getCurrentUser()

    // Use provided email or current user's email
    const checkEmail = email || (user?.email as string)

    if (!checkEmail) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required',
      }, { status: 400 })
    }

    // Check if user can access this (must be their own email or admin)
    if (!user && !email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    if (user && email && email !== user.email && (user as any).role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('mailing_list')
      .select('id, confirmed, unsubscribed_at')
      .eq('email', checkEmail)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    const subscribed = data && !data.unsubscribed_at

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        subscribed,
        confirmed: data?.confirmed || false,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to check mailing list status',
    }, { status: 500 })
  }
}



