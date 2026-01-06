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
    const senderName = fromName || "OrgFlow Team"
    const senderAddress = process.env.SMTP_USER || "support@orgflowhq.com"

    try {
      // Use object syntax for better compatibility
      const fromData = {
        name: senderName,
        address: senderAddress
      }

      const info = await transporter.sendMail({
        from: fromData,
        to,
        subject,
        html,
        replyTo: replyTo || senderAddress,
      })
      console.log(`[MailService] Email sent from ${senderName} <${senderAddress}>: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("[MailService] Error sending email:", error)
      return { success: false, error }
    }
  },

  async sendOrgWelcomeEmail(to: string, orgName: string, ownerName: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const dashboardUrl = `${siteUrl}/login`
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; line-height: 1.6; color: #1a202c;">
        <h2 style="color: #000; margin-top: 0;">Hi ${ownerName},</h2>
        <p>Welcome to <strong>OrgFlow</strong> 🎉</p>
        <p>I wanted to personally reach out to say we’re excited to have <strong>${orgName}</strong> onboard.</p>
        <p>At OrgFlow, we’re all about simplifying your entire HR workflow. Handle the structure and process, so you can focus on the real work that matters.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${dashboardUrl}" style="background-color: #0fadaa; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log In</a>
        </div>
        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          Warm regards,<br>
          <strong>Audu Joshua Adinoyi</strong><br>
          Founder, OrgFlow
        </p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Welcome to OrgFlow 🎉`,
      html,
      fromName: "OrgFlow Team"
    })
  },

  async sendEmployeeWelcomeEmail(to: string, orgName: string, employeeName: string, slug: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const clockUrl = `${siteUrl}/org/${slug}/clock`
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; line-height: 1.6; color: #1a202c;">
        <h2 style="color: #000; margin-top: 0;">Welcome to the Team, ${employeeName}!</h2>
        <p>Your account for <strong>${orgName}</strong> on OrgFlow is now active.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clockUrl}" style="background-color: #0fadaa; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Clock Portal</a>
        </div>
        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
          Best regards,<br>
          <strong>OrgFlow Team</strong>
        </p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Your account at ${orgName} is active!`,
      html,
      fromName: "OrgFlow Team"
    })
  },

  async sendEmployeeInviteEmail(to: string, orgName: string, employeeName: string, clockLink: string, isNewUser: boolean = true, employeeId?: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; line-height: 1.6; color: #1a202c;">
        <h2 style="color: #000; margin-top: 0;">Hi ${employeeName},</h2>
        <p>You have been added to <strong>${orgName}</strong> on OrgFlow.</p>
        
        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; margin: 24px 0;">
          <h3 style="margin-top: 0; font-size: 16px; color: #000; text-align: center;">Login Credentials</h3>
          <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <p style="margin: 8px 0; font-family: sans-serif;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 8px 0; font-family: sans-serif;"><strong>Password:</strong> ${employeeId}</p>
          </div>
        </div>

        <div style="margin: 16px 0; text-align: center;">
          <a href="${clockLink}" style="background-color: #0fadaa; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Go to Clock Portal</a>
        </div>

        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; text-align: center; color: #666;">
          Best regards,<br>
          <strong>OrgFlow Team</strong>
        </p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Invitation to join ${orgName} on OrgFlow`,
      html,
      fromName: "OrgFlow Team"
    })
  },

  async sendTerminationNoticeToOwner(ownerEmail: string, employeeName: string, orgName: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; line-height: 1.6; color: #1a202c;">
        <h2 style="color: #000; margin-top: 0;">Employee Termination Notice</h2>
        <p>This is to inform you that <strong>${employeeName}</strong> has terminated their role in <strong>${orgName}</strong> through the OrgFlow employee portal.</p>
        <p>The employee's record has been removed from your organization. If this was unexpected, please reach out to them directly.</p>
        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
          Best regards,<br>
          <strong>OrgFlow Team</strong>
        </p>
      </div>
    `
    return this.sendEmail({
      to: ownerEmail,
      subject: `Notice: Employee self-termination (${employeeName})`,
      html,
      fromName: "OrgFlow Team"
    })
  },

  async sendOrgDeletionPin(to: string, pin: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; line-height: 1.6; color: #1a202c;">
        <h2 style="color: #dc2626; margin-top: 0;">Organization Deletion Request</h2>
        <p>We received a request to significantly <strong>delete</strong> your organization and all associated data from OrgFlow.</p>
        <p>This action is <strong>irreversible</strong>. All employees, timesheets, and records will be permanently lost.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px;">Use the following PIN to confirm deletion:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #dc2626;">${pin}</div>
          <p style="margin: 10px 0 0 0; color: #991b1b; font-size: 12px;">This PIN expires in 15 minutes.</p>
        </div>

        <p>If you did not request this, please change your password immediately and contact support.</p>

        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
          Best rights,<br>
          <strong>OrgFlow Security Team</strong>
        </p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Action Required: Organization Deletion PIN`,
      html,
      fromName: "OrgFlow Security"
    })
  }
}
