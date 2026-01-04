import nodemailer from "nodemailer"

interface MailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
  fromName?: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "support@orgflowhq.com",
    pass: process.env.SMTP_PASSWORD,
  },
})

export const mailService = {
  async sendEmail({ to, subject, html, replyTo, fromName }: MailOptions) {
    // Reverting to the exact identity format that WORKED: "Name <email>"
    // The user specifically requested "Orgflow Team" (no .com)
    const senderName = fromName || "Orgflow Team"
    const senderAddress = process.env.SMTP_USER || "support@orgflowhq.com"

    try {
      // Using the raw string format which often bypasses SMTP rewrite issues in Zoho
      const fromHeader = `"${senderName}" <${senderAddress}>`

      const info = await transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        html,
        replyTo: replyTo || "support@orgflowhq.com",
      })
      console.log(`[MailService] Email sent from ${fromHeader}: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("[MailService] Error sending email:", error)
      return { success: false, error }
    }
  },

  async sendOrgWelcomeEmail(to: string, orgName: string, ownerName: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const dashboardUrl = `${siteUrl}/dashboard`
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; line-height: 1.6;">
        <h2 style="color: #1a202c;">Hi ${ownerName},</h2>
        <p>Welcome to <strong>OrgFlow</strong>! Your organization, <strong>${orgName}</strong>, is now ready for action.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${dashboardUrl}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
        </div>
        <p>Best regards,<br><strong>Audu Joshua Adinoyi</strong><br>Founder @ OrgFlow</p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Welcome to OrgFlow, ${ownerName}!`,
      html,
      fromName: "Orgflow Team"
    })
  },

  async sendEmployeeWelcomeEmail(to: string, orgName: string, employeeName: string, slug: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const clockUrl = `${siteUrl}/org/${slug}/clock`
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; line-height: 1.6;">
        <h2 style="color: #1a202c;">Welcome to the Team, ${employeeName}!</h2>
        <p>Your account for <strong>${orgName}</strong> on OrgFlow is now active.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clockUrl}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Clock Portal</a>
        </div>
        <p>Welcome aboard!</p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Your account at ${orgName} is active!`,
      html,
      fromName: "Orgflow Team"
    })
  },

  async sendEmployeeInviteEmail(to: string, orgName: string, employeeName: string, clockLink: string, isNewUser: boolean = true, employeeId?: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 12px; line-height: 1.6;">
        <h2 style="color: #000; margin-top: 0;">Hi ${employeeName},</h2>
        <p>You have been added to <strong>${orgName}</strong> on OrgFlow.</p>
        
        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; font-size: 16px; color: #000; text-align: center;">Login Credentials</h3>
          <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <p style="margin: 8px 0; font-family: sans-serif;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 8px 0; font-family: sans-serif;"><strong>Password:</strong> ${employeeId}</p>
          </div>
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #444; font-style: italic; text-align: center;">
            Your Employee ID is your temporary password. You can change it after logging in.
          </p>
        </div>

        <p style="text-align: center; margin-top: 32px;">Access your organization's clock portal:</p>

        <div style="margin: 16px 0; text-align: center;">
          <a href="${clockLink}" style="background-color: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Go to Clock Portal</a>
        </div>

        <p style="margin-top: 40px; font-size: 14px; text-align: center; color: #666;">Best regards,<br><strong>Orgflow Team</strong></p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Invitation to join ${orgName} on OrgFlow`,
      html,
      fromName: "Orgflow Team"
    })
  }
}
