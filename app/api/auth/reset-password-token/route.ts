import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'

// POST /api/auth/reset-password-token - Reset password using token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword } = body

    if (!token || !newPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token and new password are required',
      }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 8 characters long',
      }, { status: 400 })
    }

    // Find valid reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*, user:users!user_id(id, email)')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !resetToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired reset token',
      }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', resetToken.user_id)

    if (updateError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to update password',
      }, { status: 500 })
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to reset password',
    }, { status: 500 })
  }
}

// GET /api/auth/reset-password-token - Verify token validity
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token is required',
      }, { status: 400 })
    }

    // Check if token is valid
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('id, expires_at')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !resetToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired reset token',
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Token is valid',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to verify token',
    }, { status: 500 })
  }
}











