// API route for user account deletion (soft delete)
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, ApiResponse } from '@/lib/api-helpers'
import nodemailer from 'nodemailer'

// DELETE /api/users/delete - Delete current user's account (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Soft delete the user account
    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${user.id}@deleted.local`, // Anonymize email
        username: `deleted_${user.id}`, // Anonymize username
        display_name: 'Deleted User',
        bio: null,
        profile_image_url: null,
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error.message || 'Failed to delete account',
      }, { status: 500 })
    }

    // Send deletion notification email
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
        const restoreUrl = `${siteUrl}/contact?subject=Account Restoration Request&message=Please restore my account. User ID: ${user.id}`

        await transporter.sendMail({
          from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Your American Adages Society Account Has Been Deleted',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #8B7355; color: #F5F1E8; padding: 30px 20px; text-align: center;">
                <img src="${logoUrl}" alt="American Adages Society Logo" style="height: 80px; width: 80px; object-fit: contain; margin-bottom: 15px; border-radius: 8px; background-color: rgba(245,241,232,0.1); padding: 8px;" />
                <h1 style="margin: 0; font-size: 28px;">American Adages Society</h1>
                <p style="margin: 5px 0 0 0; font-style: italic; font-size: 16px;">Big Wisdom, small sentences.</p>
              </div>
              <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #2C2C2C;">Account Deletion Confirmation</h2>
                <p style="color: #666; line-height: 1.6;">
                  Your account has been successfully deleted as requested.
                </p>
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                  <p style="color: #856404; margin: 0; font-weight: bold;">⚠️ Important: Account Restoration</p>
                  <p style="color: #856404; margin: 10px 0 0 0; line-height: 1.6;">
                    Your account can be restored within <strong>30 days</strong> of deletion. After this period, the deletion becomes permanent and cannot be reversed.
                  </p>
                  <p style="color: #856404; margin: 10px 0 0 0; line-height: 1.6;">
                    If you wish to restore your account, please contact us within 30 days using the link below.
                  </p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${restoreUrl}" 
                     style="display: inline-block; background-color: #8B7355; color: #F5F1E8; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Request Account Restoration
                  </a>
                </div>
                <p style="color: #666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
                  If you did not request this deletion, please contact us immediately at{' '}
                  <a href="mailto:${process.env.EMAIL_TO || 'sebastiankiteka@utexas.edu'}" style="color: #8B7355;">${process.env.EMAIL_TO || 'sebastiankiteka@utexas.edu'}</a>
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
      // Log error but don't fail deletion
      console.error('Failed to send deletion email:', emailError)
    }

    // Unsubscribe from mailing list
    try {
      await supabase
        .from('mailing_list')
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('email', user.email)
    } catch (mailingListError) {
      // Log but don't fail
      console.error('Failed to unsubscribe from mailing list:', mailingListError)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to delete account',
    }, { status: 500 })
  }
}

