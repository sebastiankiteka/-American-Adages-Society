// API route for individual related adage operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// PUT /api/adages/[id]/related/[relatedId] - Update related adage relationship
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; relatedId: string } }
) {
  try {
    const user = await requireAdmin()
    const { relatedId } = params
    const body = await request.json()
    const { relationship_type, notes } = body

    if (!relationship_type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Relationship type is required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('related_adages')
      .update({
        relationship_type,
        notes: notes || null,
      })
      .eq('id', relatedId)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Related adage updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update related adage',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/adages/[id]/related/[relatedId] - Delete related adage relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; relatedId: string } }
) {
  try {
    const user = await requireAdmin()
    const { relatedId } = params

    const { error } = await supabase
      .from('related_adages')
      .delete()
      .eq('id', relatedId)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Related adage removed successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to remove related adage',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















