import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

/**
 * GET /api/adages/[id]/versions - Get version history for an adage
 * Admin only - requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin()
    
    const { id } = params

    // Fetch version history with user information
    const { data, error } = await supabase
      .from('adage_versions')
      .select(`
        *,
        changed_by_user:users!changed_by(
          id,
          username,
          display_name
        )
      `)
      .eq('adage_id', id)
      .order('version_number', { ascending: false })

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
      error: error.message || 'Failed to fetch version history',
    }, { status: 500 })
  }
}

