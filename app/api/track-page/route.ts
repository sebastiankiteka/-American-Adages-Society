// API route to track page views for ANY page visit
// This should be called from client-side on every page
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getClientIP, trackView } from '@/lib/api-helpers'

// POST /api/track-page - Track any page visit
export async function POST(request: NextRequest) {
  try {
    const { path, referrer } = await request.json()
    
    if (!path) {
      return NextResponse.json({ success: false, error: 'Path required' }, { status: 400 })
    }

    const user = await getCurrentUser()
    const ipAddress = getClientIP(request)
    
    // Track as a generic "page" view
    // We'll use a special target_type "page" and the path as target_id
    await trackView('page', path, user?.id, ipAddress)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Don't fail the request if tracking fails
    console.error('[track-page] Error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

