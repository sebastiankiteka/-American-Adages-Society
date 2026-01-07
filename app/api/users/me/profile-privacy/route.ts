// API route to update profile privacy settings
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// PUT /api/users/me/profile-privacy - Update profile privacy
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const { profile_private } = body

    if (typeof profile_private !== 'boolean') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'profile_private (boolean) is required',
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .update({ profile_private })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile privacy updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update profile privacy',
    }, { status: 500 })
  }
}


