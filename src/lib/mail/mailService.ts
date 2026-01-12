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
      const info = await transporter.sendMail({
        from: {
          name: senderName,
          address: senderAddress
        },
        to,
        subject,
        html,
        replyTo: replyTo || senderAddress,
      })
      console.log(`[MailService] Email sent to ${to}: ${info.messageId}`)
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
        
        <p>I wanted to personally write to you to say how excited we are to welcome <strong>${orgName}</strong> to <strong>OrgFlow</strong>.</p>
        
        <p>OrgFlow was built with growing teams like yours in mind; to take the weight of HR structure and process off your shoulders, so you can focus more on leading, building, and doing the work that truly matters.</p>
        
        <p>As you get started, know that you're not just using a tool, you're joining a platform designed to grow with you. If you ever have questions, need clarity, or want to share feedback, my team and I are always happy to listen.</p>
        
        <p>We're grateful to be part of your journey, and we're looking forward to supporting Mercy International every step of the way.</p>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${dashboardUrl}" style="background-color: #0fadaa; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Get Started</a>
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
      html: this.wrapEmailHtml(html),
      fromName: "OrgFlow Team"
    })
  },

  async sendEmployeeWelcomeEmail(to: string, orgName: string, employeeName: string, slug: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const clockUrl = `${siteUrl}/org/${slug}/clock`
    const body = `
        <h2 style="color: #0d1e4c; margin-top: 0;">Welcome to the Team, ${employeeName}!</h2>
        <p>Your account for <strong>${orgName}</strong> on OrgFlow is now active.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${clockUrl}" style="background-color: #0fadaa; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Clock Portal</a>
        </div>
        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
          Best regards,<br>
          <strong>OrgFlow Team</strong>
        </p>
    `
    return this.sendEmail({
      to,
      subject: `Your account at ${orgName} is active!`,
      html: this.wrapEmailHtml(body),
      fromName: "OrgFlow Team"
    })
  },

  async sendEmployeeInviteEmail(to: string, orgName: string, employeeName: string, clockLink: string, isNewUser: boolean = true, employeeId?: string) {
    const body = `
        <h2 style="color: #0d1e4c; margin-top: 0;">Hi ${employeeName},</h2>
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
    `
    return this.sendEmail({
      to,
      subject: `Invitation to join ${orgName} on OrgFlow`,
      html: this.wrapEmailHtml(body),
      fromName: "OrgFlow Team"
    })
  },

  async sendTerminationNoticeToOwner(ownerEmail: string, employeeName: string, orgName: string) {
    const body = `
        <h2 style="color: #0d1e4c; margin-top: 0;">Employee Termination Notice</h2>
        <p>This is to inform you that <strong>${employeeName}</strong> has terminated their role in <strong>${orgName}</strong> through the OrgFlow employee portal.</p>
        <p>The employee's record has been removed from your organization. If this was unexpected, please reach out to them directly.</p>
        <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
          Best regards,<br>
          <strong>OrgFlow Team</strong>
        </p>
    `
    return this.sendEmail({
      to: ownerEmail,
      subject: `Notice: Employee self-termination (${employeeName})`,
      html: this.wrapEmailHtml(body),
      fromName: "OrgFlow Team"
    })
  },

  async sendOrgDeletionPin(to: string, pin: string) {
    const body = `
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
    `
    return this.sendEmail({
      to,
      subject: `Action Required: Organization Deletion PIN`,
      html: this.wrapEmailHtml(body),
      fromName: "OrgFlow Team"
    })
  },

  wrapEmailHtml(content: string) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const logoUrl = `${siteUrl}/logo-white.png` // Ensure this route is public

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #0fadaa; padding: 20px 0; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .footer { text-align: center; padding: 20px; color: #71717a; font-size: 12px; }
          .button { display: inline-block; background-color: #0fadaa; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div style="background-color: #f4f4f5; padding: 40px 0;">
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="OrgFlow" style="height: 50px; width: auto; display: block; margin: 0 auto; background-color: #0fadaa;">
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} OrgFlow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const body = `
        <h2 style="color:#111827; margin-top:0; font-size:24px; font-weight:600;">
          Reset Your Password
        </h2>
        
        <p style="color:#374151; line-height:1.6; font-size:16px;">
          We received a request to reset the password for your OrgFlow account.
        </p>
        
        <div style="margin:30px 0; text-align:center;">
          <a
            href="${resetLink}"
            style="background:#0fadaa; color:#ffffff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px; display:inline-block;"
          >
            Reset Password
          </a>
        </div>
        
        <p style="color:#6b7280; font-size:14px; line-height:1.6;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        
        <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0;">
          <p style="color:#666666; font-size:14px; line-height:1.6; margin:0;">
            Best regards,<br>
            <strong style="color:#111827;">OrgFlow Team</strong><br>
            support@orgflowhq.com
          </p>
        </div>
    `
    return this.sendEmail({
      to,
      subject: `Reset your OrgFlow password`,
      html: this.wrapEmailHtml(body),
      fromName: "OrgFlow Team"
    })
  },

  async sendInterviewInvitation(
    to: string,
    candidateName: string,
    roleTitle: string,
    date: string,
    time: string,
    type: string,
    locationOrLink: string,
    orgName: string,
    orgEmail: string
  ) {
    const isVirtual = type === 'virtual'
    const locationLabel = isVirtual ? "Meeting Link" : "Location"
    const linkDisplay = isVirtual && locationOrLink.startsWith('http')
      ? `<a href="${locationOrLink}" style="color: #0fadaa; text-decoration: underline;">Join Meeting</a>`
      : locationOrLink

    const body = `
      <h2 style="color: #0d1e4c; margin-top: 0;">Interview Invitation</h2>
      <p>Dear ${candidateName},</p>
      
      <p>We are pleased to invite you to an interview for the <strong>${roleTitle}</strong> position at <strong>${orgName}</strong>.</p>
      
      <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <h3 style="margin-top: 0; font-size: 16px; color: #000;">Interview Details</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><strong>Date:</strong> ${date}</li>
          <li style="margin-bottom: 10px;"><strong>Time:</strong> ${time}</li>
          <li style="margin-bottom: 10px;"><strong>Type:</strong> ${isVirtual ? 'Virtual Interview' : 'In-Person Interview'}</li>
          <li style="margin-bottom: 0;"><strong>${locationLabel}:</strong> ${linkDisplay}</li>
        </ul>
      </div>

      <p>Please let us know if this time works for you.</p>

      <p style="font-size: 14px; color: #4b5563;">
        Feel free to reach us here: <a href="mailto:${orgEmail}" style="color: #0fadaa; text-decoration: underline;">${orgEmail}</a>
      </p>

      <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>${orgName} Team</strong>
      </p>
    `

    return this.sendEmail({
      to,
      subject: `Interview Invitation: ${roleTitle} at ${orgName}`,
      html: this.wrapEmailHtml(body),
      fromName: `${orgName} Team`
    })
  },

  async sendCongratulatoryEmail(to: string, candidateName: string, roleTitle: string, orgName: string, welcomeDocUrl?: string) {
    const body = `
      <h2 style="color: #0d1e4c; margin-top: 0;">Congratulations, ${candidateName}! 🎉</h2>
      <p>We are absolutely thrilled to offer you the position of <strong>${roleTitle}</strong> at <strong>${orgName}</strong>!</p>
      
      <p>Our team was incredibly impressed with your skills and experience during the interview process, and we believe you'll be a fantastic addition to our team.</p>
      
      ${welcomeDocUrl ? `
      <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #166534; font-weight: 500;">We've attached our Company Welcome Document for you to read through before you start.</p>
        <a href="${welcomeDocUrl}" style="background-color: #0fadaa; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Welcome Document</a>
      </div>
      ` : `
      <p>We will be reaching out shortly with further details regarding your onboarding and next steps.</p>
      `}
      
      <p>Once again, congratulations! We can't wait to have you on board.</p>
      
      <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>${orgName} Team</strong>
      </p>
    `
    return this.sendEmail({
      to,
      subject: `Congratulations! Your offer from ${orgName}`,
      html: this.wrapEmailHtml(body),
      fromName: `${orgName} Team`
    })
  },

  async sendRejectionEmail(to: string, candidateName: string, roleTitle: string, orgName: string) {
    const body = `
      <h2 style="color: #4a5568; margin-top: 0;">Update on your Application</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for giving us the opportunity to review your application for the <strong>${roleTitle}</strong> position at <strong>${orgName}</strong>.</p>
      
      <p>After careful consideration, we have decided to move forward with other candidates at this time. This was a difficult decision as we received many strong applications from qualified individuals such as yourself.</p>
      
      <p>We wish you the very best in your job search and future professional endeavors.</p>
      
      <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>${orgName} Team</strong>
      </p>
      
      <div style="margin-top: 20px; text-align: center; color: #718096; font-size: 12px;">
        <p><em>* Please do not reply to this email, as this inbox is not monitored.</em></p>
      </div>
    `
    return this.sendEmail({
      to,
      subject: `Application Update: ${roleTitle} at ${orgName}`,
      html: this.wrapEmailHtml(body),
      fromName: `${orgName} Team`
    })
  },

  async sendFeedbackRequestEmail(to: string, interviewerName: string, candidateName: string, roleTitle: string, orgName: string) {
    const body = `
      <h2 style="color: #0fadaa; margin-top: 0;">Feedback Required: ${candidateName}</h2>
      <p>Hi ${interviewerName},</p>
      <p>The interview with <strong>${candidateName}</strong> for the <strong>${roleTitle}</strong> position has concluded.</p>
      
      <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #134e4a; font-weight: 500;">Please submit your feedback and recommendation to help with the hiring decision.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/applications" style="background-color: #0fadaa; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Submit Feedback</a>
      </div>
      
      <p style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #666;">
        Best regards,<br>
        <strong>OrgFlow Team</strong>
      </p>
    `
    return this.sendEmail({
      to,
      subject: `Feedback Request: Interview with ${candidateName}`,
      html: this.wrapEmailHtml(body),
      fromName: "OrgFlow Team"
    })
  }
}