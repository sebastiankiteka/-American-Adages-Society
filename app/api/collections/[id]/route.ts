// API route for individual collection operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/collections/[id] - Get collection by ID
export async function GET(
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

    // Use supabaseAdmin to bypass RLS - we validate access below
    const { data, error } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Collection not found',
      }, { status: 404 })
    }

    // Check ownership or public access
    if (data.user_id !== user.id && !data.is_public) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 403 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch collection',
    }, { status: 500 })
  }
}

// PUT /api/collections/[id] - Update collection
export async function PUT(
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
    const body = await request.json()
    const { name, description, is_public } = body

    // Verify ownership - use supabaseAdmin to bypass RLS
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

    // Update collection - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('collections')
      .update({
        name: name?.trim(),
        description: description?.trim() || null,
        is_public: is_public || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
      message: 'Collection updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update collection',
    }, { status: 500 })
  }
}

// DELETE /api/collections/[id] - Delete collection (soft delete)
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

    // Soft delete - use supabaseAdmin to bypass RLS
    const { error } = await supabaseAdmin
      .from('collections')
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
      message: 'Collection deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete collection',
    }, { status: 500 })
  }
}
