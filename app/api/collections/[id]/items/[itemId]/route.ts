// API route for individual collection item operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// DELETE /api/collections/[id]/items/[itemId] - Remove item from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const { id, itemId } = params

    // Verify collection ownership - use supabaseAdmin to bypass RLS
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('user_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!collection || collection.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    // Delete the item - use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('collection_items')
      .delete()
      .eq('id', itemId)
      .eq('collection_id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Item removed successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to remove item',
    }, { status: 500 })
  }
}



