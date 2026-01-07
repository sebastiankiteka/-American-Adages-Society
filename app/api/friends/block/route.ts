// API route to block a user (creates blocked friendship if none exists)
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/friends/block - Block a user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    if (user_id === user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You cannot block yourself',
      }, { status: 400 })
    }

    // Check if friendship already exists - use supabaseAdmin to bypass RLS
    const { data: existing } = await supabaseAdmin
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${user_id}),and(user_id.eq.${user_id},friend_id.eq.${user.id})`)
      .maybeSingle()

    if (existing) {
      if (existing.status === 'blocked') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'User is already blocked',
        }, { status: 400 })
      }
      // Update existing friendship to blocked
      const { data, error } = await supabaseAdmin
        .from('friendships')
        .update({ status: 'blocked', updated_at: new Date().toISOString() })
        .eq('id', existing.id)
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
        message: 'User blocked',
      })
    }

    // Create new blocked friendship - use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: user_id,
        status: 'blocked',
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
      message: 'User blocked',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to block user',
    }, { status: 500 })
  }
}



