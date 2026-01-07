import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'

/**
 * GET /api/adages/[id]/export-pdf - Export adage as printable HTML (PDF-ready)
 * 
 * Current Implementation:
 * - Returns HTML that can be printed to PDF using browser print dialog
 * - Optimized for printing with @media print styles
 * 
 * Future Enhancement (Optional):
 * - To generate actual PDF files, consider:
 *   1. Puppeteer (server-side PDF generation) - requires Node.js runtime
 *   2. jsPDF (client-side PDF generation) - lighter weight, client-only
 *   3. Vercel Edge Functions with @vercel/og for image-based PDFs
 * 
 * Note: This endpoint is intentionally lightweight to avoid heavy dependencies.
 * Users can print the HTML page directly to PDF using their browser.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get adage
    const { data: adage, error } = await supabase
      .from('adages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !adage) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Adage not found',
      }, { status: 404 })
    }

    // For now, return HTML that can be printed to PDF
    // In production, use puppeteer or similar to generate actual PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${adage.adage} - American Adages Society</title>
          <style>
            body {
              font-family: 'Merriweather', Georgia, serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
              color: #2C2C2C;
            }
            h1 { font-size: 2.5em; margin-bottom: 0.5em; }
            h2 { font-size: 1.5em; margin-top: 1.5em; margin-bottom: 0.5em; }
            .definition { font-size: 1.2em; margin: 1em 0; }
            .section { margin: 1.5em 0; }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>"${adage.adage}"</h1>
          <div class="definition">${adage.definition}</div>
          ${adage.origin ? `<div class="section"><h2>Origin</h2><p>${adage.origin}</p></div>` : ''}
          ${adage.etymology ? `<div class="section"><h2>Etymology</h2><p>${adage.etymology}</p></div>` : ''}
          ${adage.historical_context ? `<div class="section"><h2>Historical Context</h2><p>${adage.historical_context}</p></div>` : ''}
          ${adage.interpretation ? `<div class="section"><h2>Interpretation</h2><p>${adage.interpretation}</p></div>` : ''}
          ${adage.modern_practicality ? `<div class="section"><h2>Modern Practicality</h2><p>${adage.modern_practicality}</p></div>` : ''}
          <div style="margin-top: 3em; font-size: 0.9em; color: #666;">
            <p>Source: American Adages Society</p>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${adage.adage.replace(/[^a-z0-9]/gi, '_')}.html"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to export adage',
    }, { status: 500 })
  }
}

