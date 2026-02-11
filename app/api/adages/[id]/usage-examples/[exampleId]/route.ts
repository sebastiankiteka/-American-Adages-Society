// API route for individual usage example operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// PUT /api/adages/[id]/usage-examples/[exampleId] - Update usage example
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; exampleId: string } }
) {
  try {
    const user = await requireAdmin()
    const { exampleId } = params
    const body = await request.json()
    const { example_text, context, source_type } = body

    if (!example_text) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Example text is required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('adage_usage_examples')
      .update({
        example_text,
        context: context || null,
        source_type: source_type || 'official',
      })
      .eq('id', exampleId)
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
      message: 'Usage example updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update usage example',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/adages/[id]/usage-examples/[exampleId] - Delete usage example
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; exampleId: string } }
) {
  try {
    const user = await requireAdmin()
    const { exampleId } = params

    const { error } = await supabase
      .from('adage_usage_examples')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', exampleId)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Usage example deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete usage example',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















