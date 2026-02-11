// API route for managing adage translations
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// GET /api/adages/[id]/translations - Get translations for an adage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('adage_translations')
      .select('*')
      .eq('adage_id', id)
      .is('deleted_at', null)
      .order('language_code', { ascending: true })

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
      error: error.message || 'Failed to fetch translations',
    }, { status: 500 })
  }
}

// POST /api/adages/[id]/translations - Create a translation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin()
    const { id } = params
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
      .insert({
        adage_id: id,
        language_code,
        translated_text,
        translator_notes: translator_notes || null,
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
      message: 'Translation created successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create translation',
    }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}















