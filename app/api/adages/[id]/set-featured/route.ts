// API route to set an adage as featured (and unfeature others)
import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// POST /api/adages/[id]/set-featured - Set adage as featured and unfeature others
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
    const body = await request.json()
    const { featured_until, reason } = body

    // First, unfeature all other adages (only if setting a new one as featured)
    const { error: unfeatureError } = await supabaseAdmin
      .from('adages')
      .update({ featured: false })
      .neq('id', id)
      .eq('featured', true)

    if (unfeatureError) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: unfeatureError.message,
      }, { status: 400 })
    }

    // Then, feature this adage
    // Automatically set featured_until to 7 days from now if not provided
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const updateData: any = {
      featured: true,
      featured_until: featured_until || sevenDaysLater.toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('adages')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage not found',
      }, { status: 404 })
    }

    // Record in featured history
    const { error: historyError } = await supabaseAdmin
      .from('featured_adages_history')
      .insert({
        adage_id: id,
        featured_from: now.toISOString(),
        featured_until: updateData.featured_until,
        reason: reason || null,
        created_by: user.id,
      })

    if (historyError) {
      console.error('Failed to record featured history:', historyError)
      // Don't fail the request if history recording fails
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Adage set as featured successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to set featured adage',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}


