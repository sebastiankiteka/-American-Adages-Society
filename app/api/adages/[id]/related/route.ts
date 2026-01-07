// API route for managing related adages
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/adages/[id]/related - Get related adages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('related_adages')
      .select('*,related_adage:adages!related_adage_id(id,adage,definition)')
      .eq('adage_id', id)
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
      error: error.message || 'Failed to fetch related adages',
    }, { status: 500 })
  }
}

// POST /api/adages/[id]/related - Create a related adage relationship
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
    const body = await request.json()
    const { related_adage_id, relationship_type, notes } = body

    if (!related_adage_id || !relationship_type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Related adage ID and relationship type are required',
      }, { status: 400 })
    }

    if (id === related_adage_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'An adage cannot be related to itself',
      }, { status: 400 })
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('related_adages')
      .select('id')
      .eq('adage_id', id)
      .eq('related_adage_id', related_adage_id)
      .eq('relationship_type', relationship_type)
      .single()

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This relationship already exists',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('related_adages')
      .insert({
        adage_id: id,
        related_adage_id,
        relationship_type,
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
      message: 'Related adage added successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to add related adage',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}



