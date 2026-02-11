// API route for forum sections
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/forum/sections - Get all forum sections
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('forum_sections')
      .select('*')
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Organize sections hierarchically (sections and subsections)
    const sections = (data || []).filter(s => !s.subsection_of)
    const subsections = (data || []).filter(s => s.subsection_of)

    const organized = sections.map(section => ({
      ...section,
      subsections: subsections.filter(sub => sub.subsection_of === section.id),
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: organized,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch forum sections',
    }, { status: 500 })
  }
}

// POST /api/forum/sections - Create new forum section (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { title, slug, description, rules, subsection_of, order_index } = body

    if (!title || !slug) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Title and slug are required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('forum_sections')
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        rules: rules?.trim() || null,
        subsection_of: subsection_of || null,
        order_index: order_index || 0,
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
      message: 'Forum section created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create forum section',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}















