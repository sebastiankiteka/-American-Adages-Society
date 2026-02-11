// API route for individual variant operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// PUT /api/adages/[id]/variants/[variantId] - Update variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const user = await requireAdmin()
    const { variantId } = params
    const body = await request.json()
    const { variant_text, notes } = body

    if (!variant_text) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Variant text is required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('adage_variants')
      .update({
        variant_text,
        notes: notes || null,
      })
      .eq('id', variantId)
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
      message: 'Variant updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update variant',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/adages/[id]/variants/[variantId] - Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const user = await requireAdmin()
    const { variantId } = params

    const { error } = await supabase
      .from('adage_variants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', variantId)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Variant deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete variant',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















