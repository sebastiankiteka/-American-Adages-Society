// API route for user collections
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// GET /api/collections - Get current user's collections
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Use supabaseAdmin to bypass RLS - we've validated the user above
    const { data: collections, error } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    // Get adage counts for each collection
    const formatted = await Promise.all(
      (collections || []).map(async (col: any) => {
        const { count } = await supabaseAdmin
          .from('collection_items')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', col.id)

        return {
          ...col,
          adage_count: count || 0,
        }
      })
    )

    return NextResponse.json<ApiResponse>({
      success: true,
      data: formatted,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch collections',
    }, { status: 500 })
  }
}

// POST /api/collections - Create new collection
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Check if email is verified
    if (!('email_verified' in user) || !user.email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please verify your email before creating collections',
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, is_public } = body

    if (!name || !name.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Collection name is required',
      }, { status: 400 })
    }

    // Use supabaseAdmin to bypass RLS - we've validated the user above
    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        is_public: is_public || false,
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
      data: { ...data, adage_count: 0 },
      message: 'Collection created successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create collection',
    }, { status: 500 })
  }
}

