// API route to search users (public)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// GET /api/users/search - Search users by username or display name
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: [],
      })
    }

    const searchTerm = `%${query.trim()}%`

    // Search by username or display_name
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, email, profile_image_url')
      .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .is('deleted_at', null)
      .limit(limit)

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
      error: error.message || 'Failed to search users',
    }, { status: 500 })
  }
}















