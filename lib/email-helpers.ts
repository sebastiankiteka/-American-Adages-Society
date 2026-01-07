// Helper functions for sending various types of emails
import { supabase } from './supabase'
import { sendEmailNotification, createNotification } from './notifications'
import { format } from 'date-fns'

// Send comment notification email
export async function sendCommentNotificationEmail(
  commentAuthorId: string,
  contentOwnerId: string,
  commentId: string,
  targetType: string,
  targetId: string,
  commentContent: string
) {
  try {
    // Get content owner's email preferences
    const { data: owner } = await supabase
      .from('users')
      .select('id, email, display_name, username, email_comment_notifications')
      .eq('id', contentOwnerId)
      .single()

    if (!owner) {
      return false
    }

    // Check if user wants inbox-only notifications
    const { data: ownerPrefs } = await supabase
      .from('users')
      .select('email_inbox_only, email_comment_notifications')
      .eq('id', contentOwnerId)
      .single()

    const inboxOnly = ownerPrefs?.email_inbox_only === true
    const wantsEmail = ownerPrefs?.email_comment_notifications !== false

    // If inbox-only mode, create notification but don't send email
    if (inboxOnly) {
      await createNotification({
        user_id: contentOwnerId,
        type: 'general',
        title: `New Comment from ${commenterName}`,
        message: `${commenterName} commented on ${targetTitle}: "${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
        related_id: commentId,
        related_type: 'comment',
      })
      return true
    }

    // If user doesn't want email notifications, don't send
    if (!wantsEmail) {
      return false
    }

    // Get comment author info
    const { data: commenter } = await supabase
      .from('users')
      .select('id, display_name, username, profile_image_url')
      .eq('id', commentAuthorId)
      .single()

    // Get target content info
    let targetTitle = ''
    let targetLink = ''
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (targetType === 'adage') {
      const { data: adage } = await supabase
        .from('adages')
        .select('id, adage')
        .eq('id', targetId)
        .single()
      if (adage) {
        targetTitle = `"${adage.adage}"`
        targetLink = `${siteUrl}/archive/${adage.id}`
      }
    } else if (targetType === 'blog') {
      const { data: blog } = await supabase
        .from('blog_posts')
        .select('id, title, slug')
        .eq('id', targetId)
        .single()
      if (blog) {
        targetTitle = blog.title
        targetLink = `${siteUrl}/blog/${blog.slug || blog.id}`
      }
    } else if (targetType === 'user') {
      const { data: profileUser } = await supabase
        .from('users')
        .select('id, display_name, username')
        .eq('id', targetId)
        .single()
      if (profileUser) {
        targetTitle = `${profileUser.display_name || profileUser.username || 'User'}'s profile`
        targetLink = `${siteUrl}/profile/${targetId}`
      }
    }

    const commenterName = commenter?.display_name || commenter?.username || 'Someone'
    const subject = `${commenterName} commented on ${targetTitle}`
    const htmlBody = `
      <h2>New Comment</h2>
      <p><strong>${commenterName}</strong> commented on <strong>${targetTitle}</strong>:</p>
      <div style="background: #f5f5f5; padding: 15px; border-left: 3px solid #8b7355; margin: 15px 0;">
        ${commentContent}
      </div>
      <p><a href="${targetLink}" style="display: inline-block; padding: 10px 20px; background: #8b7355; color: #f5f1e8; text-decoration: none; border-radius: 5px;">View Comment →</a></p>
    `

    await sendEmailNotification(owner.email, subject, htmlBody)
    return true
  } catch (error) {
    console.error('Failed to send comment notification email:', error)
    return false
  }
}

// Send archive addition notification
export async function sendArchiveAdditionEmail(adageId: string, adageText: string) {
  try {
    // Get users who want archive addition emails
    const { data: users } = await supabase
      .from('users')
      .select('id, email, display_name, username, email_inbox_only')
      .eq('email_archive_additions', true)
      .is('deleted_at', null)
      .is('email_verified', true)

    // Also get non-user mailing list subscribers
    const { data: mailingList } = await supabase
      .from('mailing_list')
      .select('email')
      .is('unsubscribed_at', null)
      .is('deleted_at', null)
      .is('user_id', null)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const subject = `New Adage Added: "${adageText}"`
    const htmlBody = `
      <h2>New Adage Added to Archive</h2>
      <p>We've added a new adage to our archive:</p>
      <div style="background: #f5f5f5; padding: 20px; border-left: 3px solid #8b7355; margin: 20px 0;">
        <h3 style="color: #8b7355; margin: 0 0 10px 0;">"${adageText}"</h3>
      </div>
      <p><a href="${siteUrl}/archive/${adageId}" style="display: inline-block; padding: 10px 20px; background: #8b7355; color: #f5f1e8; text-decoration: none; border-radius: 5px;">Explore This Adage →</a></p>
    `

    let sentCount = 0
    for (const user of users || []) {
      try {
        if (user.email_inbox_only === true) {
          // Create inbox notification instead
          await createNotification({
            user_id: user.id,
            type: 'general',
            title: `New Adage Added: "${adageText}"`,
            message: `A new adage has been added to the archive.`,
            related_id: adageId,
            related_type: 'adage',
          })
        } else {
          await sendEmailNotification(user.email, subject, htmlBody)
        }
        sentCount++
      } catch (err) {
        console.error(`Failed to send archive addition notification to ${user.id}:`, err)
      }
    }

    for (const subscriber of mailingList || []) {
      try {
        await sendEmailNotification(subscriber.email, subject, htmlBody)
        sentCount++
      } catch (err) {
        console.error(`Failed to send archive addition email to ${subscriber.email}:`, err)
      }
    }

    return sentCount
  } catch (error) {
    console.error('Failed to send archive addition emails:', error)
    return 0
  }
}

// Send event notification
export async function sendEventNotificationEmail(eventTitle: string, eventDescription: string, eventDate?: string, eventLink?: string) {
  try {
    // Get users who want event emails
    const { data: users } = await supabase
      .from('users')
      .select('id, email, display_name, username, email_inbox_only')
      .eq('email_events', true)
      .is('deleted_at', null)
      .is('email_verified', true)

    // Also get non-user mailing list subscribers
    const { data: mailingList } = await supabase
      .from('mailing_list')
      .select('email')
      .is('unsubscribed_at', null)
      .is('deleted_at', null)
      .is('user_id', null)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const subject = `Upcoming Event: ${eventTitle}`
    const htmlBody = `
      <h2>${eventTitle}</h2>
      ${eventDate ? `<p><strong>Date:</strong> ${format(new Date(eventDate), 'MMMM d, yyyy')}</p>` : ''}
      <p>${eventDescription}</p>
      ${eventLink ? `<p><a href="${eventLink}" style="display: inline-block; padding: 10px 20px; background: #8b7355; color: #f5f1e8; text-decoration: none; border-radius: 5px;">Learn More →</a></p>` : ''}
    `

    let sentCount = 0
    for (const user of users || []) {
      try {
        if (user.email_inbox_only === true) {
          // Create inbox notification instead
          await createNotification({
            user_id: user.id,
            type: 'general',
            title: `Upcoming Event: ${eventTitle}`,
            message: eventDescription.substring(0, 200) + (eventDescription.length > 200 ? '...' : ''),
            related_id: eventLink || null,
            related_type: 'event',
          })
        } else {
          await sendEmailNotification(user.email, subject, htmlBody)
        }
        sentCount++
      } catch (err) {
        console.error(`Failed to send event notification to ${user.id}:`, err)
      }
    }

    for (const subscriber of mailingList || []) {
      try {
        await sendEmailNotification(subscriber.email, subject, htmlBody)
        sentCount++
      } catch (err) {
        console.error(`Failed to send event email to ${subscriber.email}:`, err)
      }
    }

    return sentCount
  } catch (error) {
    console.error('Failed to send event notification emails:', error)
    return 0
  }
}

// Send site update notification
export async function sendSiteUpdateEmail(updateTitle: string, updateDescription: string, updateLink?: string) {
  try {
    // Get users who want site update emails
    const { data: users } = await supabase
      .from('users')
      .select('id, email, display_name, username, email_inbox_only')
      .eq('email_site_updates', true)
      .is('deleted_at', null)
      .is('email_verified', true)

    // Also get non-user mailing list subscribers
    const { data: mailingList } = await supabase
      .from('mailing_list')
      .select('email')
      .is('unsubscribed_at', null)
      .is('deleted_at', null)
      .is('user_id', null)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const subject = `Site Update: ${updateTitle}`
    const htmlBody = `
      <h2>${updateTitle}</h2>
      <p>${updateDescription}</p>
      ${updateLink ? `<p><a href="${updateLink}" style="display: inline-block; padding: 10px 20px; background: #8b7355; color: #f5f1e8; text-decoration: none; border-radius: 5px;">Learn More →</a></p>` : ''}
    `

    let sentCount = 0
    for (const user of users || []) {
      try {
        if (user.email_inbox_only === true) {
          // Create inbox notification instead
          await createNotification({
            user_id: user.id,
            type: 'system',
            title: `Site Update: ${updateTitle}`,
            message: updateDescription.substring(0, 200) + (updateDescription.length > 200 ? '...' : ''),
            related_id: updateLink || null,
            related_type: 'site_update',
          })
        } else {
          await sendEmailNotification(user.email, subject, htmlBody)
        }
        sentCount++
      } catch (err) {
        console.error(`Failed to send site update notification to ${user.id}:`, err)
      }
    }

    for (const subscriber of mailingList || []) {
      try {
        await sendEmailNotification(subscriber.email, subject, htmlBody)
        sentCount++
      } catch (err) {
        console.error(`Failed to send site update email to ${subscriber.email}:`, err)
      }
    }

    return sentCount
  } catch (error) {
    console.error('Failed to send site update emails:', error)
    return 0
  }
}

