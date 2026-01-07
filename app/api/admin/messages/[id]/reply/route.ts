// API route for admin to reply to contact messages
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, getCurrentUser, ApiResponse } from '@/lib/api-helpers'
import nodemailer from 'nodemailer'

// POST /api/admin/messages/[id]/reply - Send reply to contact message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const admin = await getCurrentUser()

    const { id } = params
    const body = await request.json()
    const { reply_text } = body

    if (!reply_text || !reply_text.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Reply text is required',
      }, { status: 400 })
    }

    // Get the original message
    const { data: message, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !message) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Message not found',
      }, { status: 404 })
    }

    // Note: Replies are now stored in message_replies table
    // This endpoint is kept for email notification purposes only
    // The actual reply should already be created via /api/message-replies

    // Send email notification to user
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
        // Use absolute URL for email - ensure it's accessible
        const logoUrl = `${siteUrl}/Favicon%20Logo%20AAS.jpeg`

        await transporter.sendMail({
          from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: message.email,
          subject: `Re: Your message to American Adages Society`,
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
                          <h2 style="margin: 0 0 20px 0; color: #2C2C2C; font-size: 24px; font-weight: bold;">Response to Your Message</h2>
                          <p style="margin: 0 0 15px 0; color: #555; line-height: 1.7; font-size: 16px;">
                            Hi ${message.name},
                          </p>
                          <p style="margin: 0 0 25px 0; color: #555; line-height: 1.7; font-size: 16px;">
                            Thank you for contacting us. We've received your message and wanted to respond:
                          </p>
                          <div style="background-color: #F5F1E8; padding: 24px; margin: 25px 0; border-left: 5px solid #8B7355; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <p style="margin: 0; color: #444; line-height: 1.8; font-size: 16px; white-space: pre-wrap; font-family: 'Georgia', serif;">${reply_text.replace(/\n/g, '<br>')}</p>
                          </div>
                          <p style="margin: 25px 0 0 0; color: #555; line-height: 1.7; font-size: 16px;">
                            You can also view this reply in your account inbox if you have an account with us.
                          </p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #F5F1E8; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E1D8;">
                          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">American Adages Society at the University of Texas - Austin</p>
                          <p style="margin: 0; color: #888; font-size: 12px; font-style: italic;">This is an automated notification. Please do not reply to this email.</p>
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
      console.error('Failed to send reply email:', emailError)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Reply sent successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to send reply',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}

