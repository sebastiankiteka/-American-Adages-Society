// Helper functions for creating and sending notifications
import { supabase } from './supabase'
import nodemailer from 'nodemailer'

export interface NotificationData {
  user_id: string
  type: 'report_accepted' | 'report_rejected' | 'report_warning' | 'comment_deleted' | 'appeal_response' | 'general' | 'friend_request' | 'system'
  title: string
  message: string
  related_id?: string
  related_type?: string
}

// Create an in-app notification
export async function createNotification(data: NotificationData) {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        related_id: data.related_id,
        related_type: data.related_type,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create notification:', error)
      return null
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// Send email notification
export async function sendEmailNotification(userEmail: string, subject: string, htmlBody: string, isFullHTML = false) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email not configured, skipping email notification')
      return false
    }

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
    const logoUrl = `${siteUrl}/Favicon%20Logo%20AAS.jpeg`

    // If htmlBody is already a full HTML document, use it as-is
    // Otherwise, wrap it in our standard template
    const finalHTML = isFullHTML || htmlBody.includes('<!DOCTYPE html>') || htmlBody.includes('<html>')
      ? htmlBody
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoUrl}" alt="American Adages Society" style="max-width: 100px; height: auto;" />
            <h1 style="color: #8B4513; margin-top: 10px;">American Adages Society</h1>
          </div>
          <div style="background-color: #f5f1e8; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
            ${htmlBody}
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
            <p>You can view this notification in your account inbox at <a href="${siteUrl}/profile/inbox">${siteUrl}/profile/inbox</a></p>
            <p style="margin-top: 10px; font-style: italic;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      `

    await transporter.sendMail({
      from: `"American Adages Society" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: userEmail,
      subject: isFullHTML ? subject : `[American Adages Society] ${subject}`,
      html: finalHTML,
    })

    return true
  } catch (error) {
    console.error('Failed to send email notification:', error)
    return false
  }
}

// Create notification and send email
export async function sendNotification(data: NotificationData, sendEmail = true) {
  // Create in-app notification
  const notification = await createNotification(data)

  // Send email if requested and user email is available
  if (sendEmail && notification) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', data.user_id)
        .single()

      if (user?.email) {
        await sendEmailNotification(
          user.email,
          data.title,
          `<h2>${data.title}</h2><p>${data.message.replace(/\n/g, '<br>')}</p>`
        )
      }
    } catch (error) {
      console.error('Failed to send email for notification:', error)
    }
  }

  return notification
}

