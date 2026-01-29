import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifySmtp() {
    console.log("----------------------------------------");
    console.log("Testing SMTP Configuration");
    console.log("----------------------------------------");

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`User: ${user}`);
    console.log(`Pass: ${pass ? '******' + pass.slice(-3) : 'UNDEFINED'} (Length: ${pass?.length})`);

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // True for 465, false for 587
            auth: { user, pass },
            debug: true, // Enable debug output
            logger: true // Enable logger
        });

        console.log("\nVerifying connection...");
        await transporter.verify();
        console.log("✅ SMTP Connection Verified Successfully!");

        const testEmail = user; // Send to self
        console.log(`\nAttempting to send test email to ${testEmail}...`);

        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: testEmail,
            subject: "OrgFlow SMTP Test",
            text: "If you receive this, your SMTP configuration is correct.",
            html: "<b>SMTP Test Passed</b><br>If you receive this, your SMTP configuration is correct."
        });

        console.log(`✅ Email Sent! Message ID: ${info.messageId}`);

    } catch (error: any) {
        console.error("\n❌ SMTP Test Failed:\n");
        console.error(error);

        if (error.code === 'EAUTH') {
            console.log("\nPossible Causes:");
            console.log("- Incorrect Password");
            console.log("- Incorrect Username");
            console.log("- Multi-Factor Authentication (MFA) enabled on account (Need App Password)");
        }
    }
}

verifySmtp();
