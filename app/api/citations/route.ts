import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/api-helpers'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// GET /api/citations - List citations (public, filtered by verification status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adageId = searchParams.get('adage_id')
    const verified = searchParams.get('verified')

    let query = supabase
      .from('citations')
      .select(`
        *,
        adage:adages!adage_id(id, adage),
        submitted_by_user:users!submitted_by(id, username, display_name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (adageId) {
      query = query.eq('adage_id', adageId)
    }

    if (verified !== null) {
      query = query.eq('verified', verified === 'true')
    }

    const { data, error } = await query

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
      error: error.message || 'Failed to fetch citations',
    }, { status: 500 })
  }
}

// POST /api/citations - Submit a new citation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    if (!(user as any).email_verified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Please verify your email before submitting citations',
      }, { status: 403 })
    }

    const body = await request.json()
    const { adage_id, source_text, source_url, source_type } = body

    if (!adage_id || !source_text || !source_text.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage ID and source text are required',
      }, { status: 400 })
    }

    // Verify adage exists
    const { data: adage } = await supabase
      .from('adages')
      .select('id')
      .eq('id', adage_id)
      .is('deleted_at', null)
      .single()

    if (!adage) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage not found',
      }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('citations')
      .insert({
        adage_id,
        source_text: source_text.trim(),
        source_url: source_url?.trim() || null,
        source_type: source_type || 'other',
        submitted_by: user.id,
        verified: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Citation submitted - stats will update on next refresh
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Citation submitted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to submit citation',
    }, { status: 500 })
  }
}

