// API route for mailing list
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'

// POST /api/mailing-list - Subscribe to mailing list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'signup' } = body

    // Validate source
    const validSources = ['contact', 'signup', 'forum', 'profile']
    const validSource = validSources.includes(source) ? source : 'signup'

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required',
      }, { status: 400 })
    }

    // Check if already exists and not unsubscribed
    // Use supabaseAdmin to bypass RLS for server-side queries
    const { data: existing } = await supabaseAdmin
      .from('mailing_list')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .maybeSingle()

    if (existing) {
      if (existing.unsubscribed_at) {
        // Re-subscribe
        // Use supabaseAdmin to bypass RLS for server-side updates
        const { data, error } = await supabaseAdmin
          .from('mailing_list')
          .update({
            unsubscribed_at: null,
            source: validSource,
            confirmed: true, // Auto-confirm on re-subscribe
            date_added: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          // Check if it's a constraint violation
          if (error.message?.includes('mailing_list_source_check') || error.code === '23514') {
            return NextResponse.json<ApiResponse>({
              success: false,
              error: 'Database constraint error. The migration needs to be run. Please run: database/migrations/update-mailing-list-source-constraint.sql in your Supabase SQL editor.',
            }, { status: 400 })
          }
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

    // Try to find user by email to link subscription
    let userId = null
    try {
      const { getCurrentUser } = await import('@/lib/api-helpers')
      const user = await getCurrentUser().catch(() => null)
      if (user) {
        userId = user.id
      } else {
        // Try to find user by email (even if not logged in)
        // Use supabaseAdmin to bypass RLS for server-side queries
        const { data: userByEmail } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .is('deleted_at', null)
          .maybeSingle()
        if (userByEmail) {
          userId = userByEmail.id
        }
      }
    } catch {
      // Not logged in and no user found, continue without user_id
    }

    // Create new subscription (auto-confirmed for simplicity)
    // Build insert data - only include user_id if column exists and we have a userId
    const insertData: any = {
      email,
      source: validSource,
      confirmed: true, // Auto-confirm subscriptions
    }
    
    // Only add user_id if we have one (column might not exist in schema yet)
    if (userId) {
      insertData.user_id = userId
    }

    // Use supabaseAdmin to bypass RLS for server-side inserts
    const { data, error } = await supabaseAdmin
      .from('mailing_list')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Check if it's a constraint violation
      if (error.message?.includes('mailing_list_source_check') || error.code === '23514') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Database constraint error. The migration needs to be run. Please run: database/migrations/update-mailing-list-source-constraint.sql in your Supabase SQL editor.',
        }, { status: 400 })
      }
      // Check if it's a user_id column error - try without user_id
      if (error.message?.includes('user_id') || error.message?.includes('schema cache')) {
        // Retry without user_id
        const retryData: any = {
          email,
          source: validSource,
          confirmed: true,
        }
        // Use supabaseAdmin to bypass RLS for server-side inserts
        const { data: retryResult, error: retryError } = await supabaseAdmin
          .from('mailing_list')
          .insert(retryData)
          .select()
          .single()
        
        if (retryError) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: retryError.message,
          }, { status: 400 })
        }
        
        return NextResponse.json<ApiResponse>({
          success: true,
          data: retryResult,
          message: 'Successfully subscribed (user_id column not found, subscription created without user link)',
        })
      }
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

    // Use supabaseAdmin to bypass RLS for admin queries
    const { data, error } = await supabaseAdmin
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


