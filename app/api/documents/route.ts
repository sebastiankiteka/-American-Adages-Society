import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/documents - List all published documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeHidden = searchParams.get('include_hidden') === 'true'

    let query = supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (!includeHidden) {
      query = query.eq('published', true).is('hidden_at', null)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch documents',
    }, { status: 500 })
  }
}

// POST /api/documents - Create a new document (admin only)
export async function POST(request: NextRequest) {
  try {
    const { getCurrentUser, requireAdmin } = await import('@/lib/api-helpers')
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    await requireAdmin()

    const body = await request.json()
    const { title, description, file_url, file_name, category, published, order_index } = body

    if (!title || !file_url || !file_name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Title, file_url, and file_name are required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        description: description || null,
        file_url,
        file_name,
        category: category || 'general',
        published: published !== undefined ? published : true,
        order_index: order_index || 0,
        created_by: user.id,
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
      message: 'Document created successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create document',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


