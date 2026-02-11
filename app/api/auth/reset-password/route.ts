import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'
import { hashPassword } from '@/lib/auth'

// POST /api/auth/reset-password - Reset user's password
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Current password and new password are required',
      }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'New password must be at least 8 characters long',
      }, { status: 400 })
    }

    // Get current user with password hash
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single()

    if (fetchError || !userData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    // Verify current password
    const bcrypt = require('bcryptjs')
    if (!userData.password_hash) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password reset not available for this account',
      }, { status: 400 })
    }

    const isValid = await bcrypt.compare(currentPassword, userData.password_hash)
    if (!isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Current password is incorrect',
      }, { status: 401 })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: updateError.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to reset password',
    }, { status: 500 })
  }
}















