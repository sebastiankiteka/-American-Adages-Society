import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'
import { sendNotification } from '@/lib/notifications'

// PATCH /api/citations/[id] - Update citation (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const { verified, source_text, source_url, source_type } = body

    // Get the citation first to check if verified status is changing
    const { data: existingCitation } = await supabase
      .from('citations')
      .select('id, verified, submitted_by, adage_id, adage:adages!adage_id(adage)')
      .eq('id', id)
      .single()

    const updateData: any = {}
    if (verified !== undefined) updateData.verified = verified
    if (source_text !== undefined) updateData.source_text = source_text.trim()
    if (source_url !== undefined) updateData.source_url = source_url?.trim() || null
    if (source_type !== undefined) updateData.source_type = source_type

    const { data, error } = await supabase
      .from('citations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // If citation was just verified and has a submitter, send thank you notification
    if (verified === true && existingCitation && !existingCitation.verified && existingCitation.submitted_by) {
      const adageText = (existingCitation.adage as any)?.adage || 'an adage'
      await sendNotification({
        user_id: existingCitation.submitted_by,
        type: 'general',
        title: 'Thank You - Citation Verified',
        message: `Thank you for your citation submission! Your citation for "${adageText}" has been reviewed and verified by our team.\n\nWe appreciate your contribution to the American Adages Society. Your help in providing accurate sources makes our archive more reliable and scholarly.`,
        related_id: id,
        related_type: 'citation',
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Citation updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update citation',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

// DELETE /api/citations/[id] - Soft delete citation (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params

    const { error } = await supabase
      .from('citations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Citation deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete citation',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 403 : 500 })
  }
}

