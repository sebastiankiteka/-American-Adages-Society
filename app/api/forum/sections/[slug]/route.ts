// API route for individual forum section
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/forum/sections/[slug] - Get section by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const { data, error } = await supabase
      .from('forum_sections')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Section not found',
      }, { status: 404 })
    }

    // Get subsections if this is a parent section
    const { data: subsections } = await supabase
      .from('forum_sections')
      .select('*')
      .eq('subsection_of', data.id)
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('order_index', { ascending: true })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        ...data,
        subsections: subsections || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch section',
    }, { status: 500 })
  }
}

// PUT /api/forum/sections/[slug] - Update section (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin()

    const { slug } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from('forum_sections')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
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
      message: 'Section updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update section',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

// DELETE /api/forum/sections/[slug] - Delete section (admin only, soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin()

    const { slug } = params

    const { error } = await supabase
      .from('forum_sections')
      .update({ deleted_at: new Date().toISOString() })
      .eq('slug', slug)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Section deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete section',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}



