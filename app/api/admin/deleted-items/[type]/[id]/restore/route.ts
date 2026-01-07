import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// POST /api/admin/deleted-items/[type]/[id]/restore - Restore a deleted item
export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    await requireAdmin()

    const { type, id } = params

    let tableName: string
    switch (type) {
      case 'comment':
        tableName = 'comments'
        break
      case 'adage':
        tableName = 'adages'
        break
      case 'blog':
        tableName = 'blog_posts'
        break
      case 'forum_thread':
        tableName = 'forum_threads'
        break
      case 'forum_reply':
        tableName = 'forum_replies'
        break
      case 'challenge':
        tableName = 'reader_challenges'
        break
      default:
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid item type',
        }, { status: 400 })
    }

    // Restore the item by setting deleted_at to null
    const { data, error } = await supabase
      .from(tableName)
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Item not found',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Item restored successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to restore item',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

