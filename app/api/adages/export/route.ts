import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, requireAdmin, ApiResponse } from '@/lib/api-helpers'

/**
 * GET /api/adages/export - Export adages as CSV
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'

    // Fetch all published adages
    const { data: adages, error } = await supabase
      .from('adages')
      .select('id, adage, definition, origin, tags, created_at, updated_at, views_count')
      .is('deleted_at', null)
      .is('hidden_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 500 })
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Adage', 'Definition', 'Origin', 'Tags', 'Created At', 'Updated At', 'Views']
      const rows = (adages || []).map(adage => [
        adage.id,
        `"${(adage.adage || '').replace(/"/g, '""')}"`,
        `"${(adage.definition || '').replace(/"/g, '""')}"`,
        `"${(adage.origin || '').replace(/"/g, '""')}"`,
        `"${(adage.tags || []).join(', ')}"`,
        adage.created_at || '',
        adage.updated_at || '',
        adage.views_count || 0,
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="adages-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // JSON format
    return NextResponse.json<ApiResponse>({
      success: true,
      data: adages,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to export adages',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}














