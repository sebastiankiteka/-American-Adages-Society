// API route for voting system
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

// POST /api/votes - Create or update vote
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Authentication required',
      }, { status: 401 })
    }

    // Check if user is restricted or banned
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'banned' || userData?.role === 'restricted') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'You do not have permission to vote',
      }, { status: 403 })
    }

    const body = await request.json()
    const { target_type, target_id, value } = body

    if (!target_type || !target_id || !value) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'target_type, target_id, and value are required',
      }, { status: 400 })
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'value must be 1 or -1',
      }, { status: 400 })
    }

    // Check if vote already exists
    const { data: existing } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .single()

    if (existing) {
      // Update existing vote
      if (existing.value === value) {
        // Same vote - remove it (toggle off)
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existing.id)

        if (error) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: error.message,
          }, { status: 400 })
        }

        return NextResponse.json<ApiResponse>({
          success: true,
          message: 'Vote removed',
          data: { removed: true },
        })
      } else {
        // Different vote - update it
        const { data, error } = await supabase
          .from('votes')
          .update({ value })
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
          message: 'Vote updated',
        })
      }
    } else {
      // Create new vote
      const { data, error } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          target_type,
          target_id,
          value,
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
        message: 'Vote created',
      }, { status: 201 })
    }
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to process vote',
    }, { status: 500 })
  }
}


