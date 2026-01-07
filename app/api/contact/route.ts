// API route for contact form submissions
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import nodemailer from 'nodemailer'

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function sanitizeInput(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength)
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per 15 minutes per IP
    const clientId = getClientIdentifier(request)
    const rateLimit = checkRateLimit(`contact:${clientId}`, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }

    const body = await request.json()
    let { name, email, message, category = 'general' } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, email, and message are required',
      }, { status: 400 })
    }

    // Sanitize and validate inputs
    name = sanitizeInput(name, 255)
    email = sanitizeInput(email, 255).toLowerCase()
    message = sanitizeInput(message, 5000)

    if (name.length < 2) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name must be at least 2 characters',
      }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email address',
      }, { status: 400 })
    }

    if (message.length < 10) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Message must be at least 10 characters',
      }, { status: 400 })
    }

    // Validate category - fallback to 'other' if invalid
    const validCategories = ['general', 'correction', 'event', 'partnership', 'donation', 'get_involved', 'other']
    const validCategory = validCategories.includes(category) ? category : 'other'

    // Get user ID if logged in
    let userId = null
    try {
      const { getCurrentUser } = await import('@/lib/api-helpers')
      const user = await getCurrentUser()
      userId = user?.id || null
    } catch {
      // Not logged in, continue without user_id
    }

    // Save to database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        category: validCategory,
        user_id: userId,
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

    // Send email notification to admin (non-blocking)
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        })

        await transporter.sendMail({
          from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: process.env.EMAIL_TO || process.env.SMTP_USER,
          subject: `[American Adages Society] New Contact Form Submission: ${category}`,
          html: `
            <h2>New Contact Form Submission - American Adages Society</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This message was submitted through the American Adages Society website contact form.</p>
          `,
        })
      }
    } catch (emailError) {
      // Log but don't fail the request
      console.error('Failed to send admin email notification:', emailError)
    }

    // Send confirmation email to user (non-blocking)
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        })

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const logoUrl = `${siteUrl}/${encodeURIComponent('Favicon Logo AAS.jpeg')}`

        await transporter.sendMail({
          from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: email,
          subject: 'Thank You for Contacting American Adages Society',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f5f5f5;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #8B7355 0%, #6B5B3D 100%); padding: 40px 30px; text-align: center;">
                          <div style="text-align: center; margin-bottom: 20px;">
                            <div style="display: inline-block; height: 120px; width: 120px; background-color: rgba(245,241,232,0.2); border-radius: 8px; padding: 12px; border: 2px solid rgba(245,241,232,0.3);">
                              <div style="height: 100%; width: 100%; background-color: #F5F1E8; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #8B7355; font-family: 'Georgia', serif;">AAS</div>
                            </div>
                          </div>
                          <h1 style="margin: 0; font-size: 36px; color: #F5F1E8; font-weight: bold; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">American Adages Society</h1>
                          <p style="margin: 10px 0 0 0; font-style: italic; font-size: 20px; color: #F5F1E8; opacity: 0.98; letter-spacing: 0.5px;">Big Wisdom, small sentences.</p>
                        </td>
                      </tr>
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="margin: 0 0 20px 0; color: #2C2C2C; font-size: 24px; font-weight: bold;">Thank You for Contacting Us!</h2>
                          <p style="margin: 0 0 15px 0; color: #555; line-height: 1.7; font-size: 16px;">
                            Hi ${name},
                          </p>
                          <p style="margin: 0 0 25px 0; color: #555; line-height: 1.7; font-size: 16px;">
                            We've received your message and will get back to you as soon as possible. We typically respond within 2-3 business days.
                          </p>
                          <div style="background-color: #F5F1E8; padding: 24px; margin: 25px 0; border-left: 5px solid #8B7355; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <p style="margin: 0 0 12px 0; color: #2C2C2C; font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 0.8px; font-family: 'Georgia', serif;">Your Message:</p>
                            <p style="margin: 0; color: #444; line-height: 1.8; font-size: 16px; white-space: pre-wrap; font-family: 'Georgia', serif;">${message.replace(/\n/g, '<br>')}</p>
                          </div>
                          <p style="margin: 25px 0 0 0; color: #555; line-height: 1.7; font-size: 16px;">
                            If you have any urgent questions, feel free to reach out directly at <a href="mailto:${process.env.EMAIL_TO || 'sebastiankiteka@utexas.edu'}" style="color: #8B7355; text-decoration: underline;">${process.env.EMAIL_TO || 'sebastiankiteka@utexas.edu'}</a>
                          </p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #F5F1E8; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E1D8;">
                          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">American Adages Society at the University of Texas - Austin</p>
                          <p style="margin: 0; color: #888; font-size: 12px; font-style: italic;">This is an automated confirmation. Please do not reply.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        })
      }
    } catch (emailError) {
      // Log but don't fail the request
      console.error('Failed to send confirmation email:', emailError)
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
    const category = searchParams.get('category')
    const search = searchParams.get('search')
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

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%,category.ilike.%${search}%`)
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


