// API route for email verification
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// POST /api/users/verify-email - Verify user email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token and email are required',
      }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, email_verified')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (userError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Email is already verified',
      })
    }

    // For now, we'll verify directly (in production, you'd verify the token)
    // TODO: Create email_verification_tokens table and verify token properly
    // For MVP, we'll just verify the email if the request comes with the email
    
    // Update user to verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to verify email',
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to verify email',
    }, { status: 500 })
  }
}



