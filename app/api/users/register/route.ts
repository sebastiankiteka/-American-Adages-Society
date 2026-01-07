// API route for user registration
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { ApiResponse } from '@/lib/api-helpers'
import nodemailer from 'nodemailer'

// POST /api/users/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, display_name } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required',
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 8 characters long',
      }, { status: 400 })
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'An account with this email already exists',
      }, { status: 400 })
    }

    // Check if username is taken (if provided)
    if (username) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .is('deleted_at', null)
        .single()

      if (existingUsername) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'This username is already taken',
        }, { status: 400 })
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate email verification token
    const verificationToken = crypto.randomUUID()
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // 24 hours

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        username: username || email.split('@')[0],
        display_name: display_name || username || email.split('@')[0],
        role: 'user',
        email_verified: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message || 'Failed to create account',
      }, { status: 400 })
    }

    // Store verification token (you might want to create a separate table for this)
    // For now, we'll use a simple approach with email verification
    // In production, you'd want a proper email_verification_tokens table

    // Send verification email (if email is configured)
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

        const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

        // Use absolute URL for logo in email (encode spaces in filename)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const logoUrl = `${siteUrl}/${encodeURIComponent('Favicon Logo AAS.jpeg')}`

        await transporter.sendMail({
          from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: email,
          subject: 'Verify Your American Adages Society Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #8B7355; color: #F5F1E8; padding: 30px 20px; text-align: center;">
                <img src="${logoUrl}" alt="American Adages Society Logo" style="height: 80px; width: 80px; object-fit: contain; margin-bottom: 15px; border-radius: 8px; background-color: rgba(245,241,232,0.1); padding: 8px;" />
                <h1 style="margin: 0; font-size: 28px;">American Adages Society</h1>
                <p style="margin: 5px 0 0 0; font-style: italic; font-size: 16px;">Big Wisdom, small sentences.</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">at the University of Texas - Austin</p>
              </div>
              <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #2C2C2C;">Welcome to the American Adages Society!</h2>
                <p style="color: #666; line-height: 1.6;">
                  Thank you for creating an account. To complete your registration, please verify your email address by clicking the button below:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="display: inline-block; background-color: #8B7355; color: #F5F1E8; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Verify Email Address
                  </a>
                </div>
                <p style="color: #666; line-height: 1.6; font-size: 14px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="color: #8B7355; word-break: break-all;">${verificationUrl}</a>
                </p>
                <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
                  This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
              <div style="background-color: #F5F1E8; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p style="margin: 0;">American Adages Society at the University of Texas - Austin</p>
                <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
              </div>
            </div>
          `,
        })
      }
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', emailError)
      // In production, you might want to queue this for retry
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        id: user.id,
        email: user.email,
        // Don't send password hash or sensitive data
      },
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to create account',
    }, { status: 500 })
  }
}

