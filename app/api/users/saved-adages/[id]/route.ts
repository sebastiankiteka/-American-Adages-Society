// API route for individual saved adage operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// DELETE /api/users/saved-adages/[id] - Remove saved adage
export async function DELETE(
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
    const { data: saved } = await supabaseAdmin
      .from('saved_adages')
      .select('user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!saved || saved.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Not found or unauthorized',
      }, { status: 404 })
    }

    // Soft delete - use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('saved_adages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Saved adage removed successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to remove saved adage',
    }, { status: 500 })
  }
}



