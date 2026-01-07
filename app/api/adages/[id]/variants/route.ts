// API route for managing adage variants
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/adages/[id]/variants - Get variants for an adage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('adage_variants')
      .select('*')
      .eq('adage_id', id)
      .is('deleted_at', null)
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
      error: error.message || 'Failed to fetch variants',
    }, { status: 500 })
  }
}

// POST /api/adages/[id]/variants - Create a variant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
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
      .insert({
        adage_id: id,
        variant_text,
        notes: notes || null,
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
      message: 'Variant created successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create variant',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}



