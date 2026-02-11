import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/api-helpers'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required',
      }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, display_name')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    // Always return success to prevent email enumeration
    if (userError || !user) {
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Delete any existing unused tokens for this user
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('used_at', null)

    // Create new reset token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('Error creating reset token:', tokenError)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to create reset token',
      }, { status: 500 })
    }

    // Send reset email
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
        const resetUrl = `${siteUrl}/reset-password?token=${resetToken}`
        const logoUrl = `${siteUrl}/${encodeURIComponent('Favicon Logo AAS.jpeg')}`

        await transporter.sendMail({
          from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: user.email,
          subject: '[American Adages Society] Password Reset Request',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="${logoUrl}" alt="American Adages Society" style="max-width: 100px; height: auto;" />
                <h1 style="color: #8B4513; margin-top: 10px;">American Adages Society</h1>
              </div>
              <div style="background-color: #f5f1e8; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                <h2 style="color: #8B4513;">Password Reset Request</h2>
                <p>Hello${user.display_name ? ` ${user.display_name}` : ''},</p>
                <p>We received a request to reset your password for your American Adages Society account.</p>
                <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #8B4513; color: #f5f1e8; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Reset Password
                  </a>
                </div>
                <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
                <p style="font-size: 12px; color: #666; margin-top: 20px;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
                <p>This is an automated email. Please do not reply to this email.</p>
              </div>
            </div>
          `,
        })
      }
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to process password reset request',
    }, { status: 500 })
  }
}














