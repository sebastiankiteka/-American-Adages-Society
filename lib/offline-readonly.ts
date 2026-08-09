import { NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/api-helpers'

export function offlineReadOnlyResponse() {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error:
        'Offline data mode is read-only. Set USE_OFFLINE_DATA=false and NEXT_PUBLIC_USE_OFFLINE_DATA=false to use Supabase.',
    },
    { status: 503 }
  )
}
