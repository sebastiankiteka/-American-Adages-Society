// API route for admin to change user role
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdmin, ApiResponse } from '@/lib/api-helpers'

// PUT /api/admin/users/[id]/role - Update user role (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const { id } = params
    const body = await request.json()
    const { role, ban_reason } = body

    const validRoles = ['admin', 'moderator', 'user', 'restricted', 'probation', 'banned']
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid role',
      }, { status: 400 })
    }

    // If banning, require a reason
    if (role === 'banned' && !ban_reason) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Ban reason is required when banning a user',
      }, { status: 400 })
    }

    // Get user email before updating
    const { data: userData } = await supabase
      .from('users')
      .select('email, username, display_name')
      .eq('id', id)
      .single()

    const updateData: any = { role }
    
    // If banning, set ban_reason and ban_date
    if (role === 'banned') {
      updateData.ban_reason = ban_reason
      updateData.ban_date = new Date().toISOString()
      updateData.appeal_email = process.env.APPEAL_EMAIL || process.env.EMAIL_TO || 'sebastiankiteka@utexas.edu'
    } else {
      // If unbanning, clear ban fields
      updateData.ban_reason = null
      updateData.ban_date = null
      updateData.appeal_email = null
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message,
      }, { status: 400 })
    }

    // If banning, send email notification
    if (role === 'banned' && userData?.email) {
      try {
        const nodemailer = require('nodemailer')
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
          const appealEmail = updateData.appeal_email
          const userName = userData.display_name || userData.username || userData.email

          await transporter.sendMail({
            from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
            to: userData.email,
            subject: 'Account Ban Notification - American Adages Society',
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
                        <tr>
                          <td style="background: linear-gradient(135deg, #8B7355 0%, #6B5B3D 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 36px; color: #F5F1E8; font-weight: bold;">American Adages Society</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #2C2C2C; font-size: 24px;">Account Ban Notification</h2>
                            <p style="margin: 0 0 15px 0; color: #555; line-height: 1.7; font-size: 16px;">
                              Dear ${userName},
                            </p>
                            <p style="margin: 0 0 15px 0; color: #555; line-height: 1.7; font-size: 16px;">
                              Your account has been banned from the American Adages Society website.
                            </p>
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                              <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">Reason for Ban:</p>
                              <p style="margin: 0; color: #856404;">${ban_reason.replace(/\n/g, '<br>')}</p>
                            </div>
                            <p style="margin: 20px 0 0 0; color: #555; line-height: 1.7; font-size: 16px;">
                              <strong>Appealing Your Ban</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #555; line-height: 1.7; font-size: 16px;">
                              If you believe this ban was issued in error, you may appeal by replying to this email. Please include:
                            </p>
                            <ul style="margin: 10px 0; padding-left: 20px; color: #555; line-height: 1.7; font-size: 16px;">
                              <li>Your username: <strong>${userData.username || 'N/A'}</strong> or email address: <strong>${userData.email}</strong></li>
                              <li>A detailed explanation of why you believe the ban should be lifted</li>
                              <li>Any relevant context or information</li>
                            </ul>
                            <p style="margin: 20px 0 0 0; color: #555; line-height: 1.7; font-size: 16px;">
                              Appeals will be reviewed by our moderation team. Please allow up to 7 business days for a response.
                            </p>
                            <p style="margin: 20px 0 0 0; color: #555; line-height: 1.7; font-size: 16px;">
                              <strong>Note:</strong> This email address (${appealEmail}) is monitored for ban appeals. Please reply directly to this email to submit your appeal.
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #F5F1E8; padding: 25px 30px; text-align: center; border-top: 1px solid #E5E1D8;">
                            <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">American Adages Society at the University of Texas - Austin</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
            replyTo: appealEmail,
          })
        }
      } catch (emailError) {
        console.error('Failed to send ban notification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Log moderation action
    try {
      const admin = await requireAdmin()
      await supabase
        .from('moderation_log')
        .insert({
          moderator_id: admin.id,
          action_type: role === 'banned' ? 'ban' : 'unban',
          target_type: 'user',
          target_id: id,
          reason: role === 'banned' ? ban_reason : null,
        })
    } catch (logError) {
      console.error('Failed to log moderation action:', logError)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: role === 'banned' ? 'User banned successfully' : 'User role updated successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to update user role',
    }, { status: error.message === 'Unauthorized' || error.message === 'Insufficient permissions' ? 401 : 500 })
  }
}


