// API route for admin to restore deleted user account
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// POST /api/admin/users/[id]/restore - Restore deleted user account (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params

    // Check if user exists and is deleted
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, deleted_at')
      .eq('id', id)
      .single()

    if (fetchError || !user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found',
      }, { status: 404 })
    }

    if (!user.deleted_at) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User account is not deleted',
      }, { status: 400 })
    }

    // Check if deleted more than 30 days ago (permanent deletion)
    const deletedDate = new Date(user.deleted_at)
    const daysSinceDeletion = (Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceDeletion > 30) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Account has been permanently deleted and cannot be restored',
      }, { status: 400 })
    }

    // Restore account - clear deleted_at
    const { error: updateError } = await supabase
      .from('users')
      .update({ deleted_at: null })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: updateError.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Account restored successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to restore account',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}



