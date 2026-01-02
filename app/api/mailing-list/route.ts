// API route for mailing list
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// POST /api/mailing-list - Subscribe to mailing list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'signup' } = body

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required',
      }, { status: 400 })
    }

    // Check if already exists and not unsubscribed
    const { data: existing } = await supabase
      .from('mailing_list')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (existing) {
      if (existing.unsubscribed_at) {
        // Re-subscribe
        const { data, error } = await supabase
          .from('mailing_list')
          .update({
            unsubscribed_at: null,
            source,
            date_added: new Date().toISOString(),
          })
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
          message: 'Successfully re-subscribed',
        })
      } else {
        return NextResponse.json<ApiResponse>({
          success: true,
          message: 'Already subscribed',
        })
      }
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('mailing_list')
      .insert({
        email,
        source,
        confirmed: false,
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
      message: 'Successfully subscribed',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to subscribe',
    }, { status: 500 })
  }
}

// GET /api/mailing-list - Get mailing list (admin only)
export async function GET(request: NextRequest) {
  try {
    const { requireAdmin } = await import('@/lib/api-helpers')
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '1000')

    const { data, error } = await supabase
      .from('mailing_list')
      .select('*')
      .is('deleted_at', null)
      .is('unsubscribed_at', null)
      .order('date_added', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch mailing list',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


