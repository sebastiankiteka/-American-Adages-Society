// API route for managing adage usage examples
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/adages/[id]/usage-examples - Get usage examples for an adage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('adage_usage_examples')
      .select('*,created_by_user:users!created_by(id,username,display_name)')
      .eq('adage_id', id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data || [],
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch usage examples',
    }, { status: 500 })
  }
}

// POST /api/adages/[id]/usage-examples - Create a usage example
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
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
      .insert({
        adage_id: id,
        example_text,
        context: context || null,
        source_type: source_type || 'official',
        created_by: null, // Admin-created examples are official
      })
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
      message: 'Usage example created successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create usage example',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















