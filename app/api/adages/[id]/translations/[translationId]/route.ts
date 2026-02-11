// API route for individual translation operations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// PUT /api/adages/[id]/translations/[translationId] - Update translation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; translationId: string } }
) {
  try {
    const user = await requireAdmin()
    const { translationId } = params
    const body = await request.json()
    const { language_code, translated_text, translator_notes } = body

    if (!language_code || !translated_text) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Language code and translated text are required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('adage_translations')
      .update({
        language_code,
        translated_text,
        translator_notes: translator_notes || null,
      })
      .eq('id', translationId)
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
      message: 'Translation updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update translation',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

// DELETE /api/adages/[id]/translations/[translationId] - Delete translation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; translationId: string } }
) {
  try {
    const user = await requireAdmin()
    const { translationId } = params

    const { error } = await supabase
      .from('adage_translations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', translationId)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Translation deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete translation',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















