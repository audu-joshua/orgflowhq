import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, companySize, message, scheduleDemo } = await req.json();

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.zoho.com',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER || 'support@orgflowhq.com',
                pass: process.env.SMTP_PASSWORD, // User needs to set this in .env.local
            },
        });

        const mailOptions = {
            from: process.env.SMTP_USER || 'support@orgflowhq.com',
            to: 'support@orgflowhq.com',
            subject: `New Contact Form Submission from ${firstName} ${lastName}`,
            text: `
        First Name: ${firstName}
        Last Name: ${lastName}
        Email: ${email}
        Company Size: ${companySize}
        Schedule Demo: ${scheduleDemo ? 'Yes' : 'No'}
        Message: ${message}
      `,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company Size:</strong> ${companySize}</p>
        <p><strong>Schedule Demo:</strong> ${scheduleDemo ? 'Yes' : 'No'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
