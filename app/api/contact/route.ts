// API route for contact form submissions
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'
import nodemailer from 'nodemailer'

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, category = 'general' } = body

    if (!name || !email || !message) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, email, and message are required',
      }, { status: 400 })
    }

    // Save to database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        category,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // Add to mailing list if not already there
    await supabase
      .from('mailing_list')
      .upsert({
        email,
        source: 'contact',
        confirmed: false,
      }, {
        onConflict: 'email',
        ignoreDuplicates: true,
      })

    // Send email notification (non-blocking)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `New Contact Form Submission: ${category}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      })
    } catch (emailError) {
      // Log but don't fail the request
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Message submitted successfully',
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to submit message',
    }, { status: 500 })
  }
}

// GET /api/contact - Get contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const { requireAdmin } = await import('@/lib/api-helpers')
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const unread = searchParams.get('unread')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('contact_messages')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unread === 'true') {
      query = query.is('read_at', null)
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
      data,
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to fetch messages',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


