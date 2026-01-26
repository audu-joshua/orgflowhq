import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { mailService } from "@/lib/mail/mailService";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't leak user existence
            return NextResponse.json({
                success: true,
                message: "If an account exists, a reset link has been sent."
            });
        }

        // 1. Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // 2. Set token and expiry (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();

        // 3. Generate Link
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const resetLink = `${siteUrl}/reset-password?token=${resetToken}&email=${email}`;

        // 4. Send Email
        const mailResult = await mailService.sendPasswordResetEmail(email, resetLink);

        if (!mailResult.success) {
            console.error(`[ForgotPassword] Email send failed for ${email}:`, mailResult.error);
            return NextResponse.json({ error: "Failed to send reset email. Please contact support." }, { status: 500 });
        }

        console.log(`[ForgotPassword] Password reset email sent to ${email}`);
        return NextResponse.json({ success: true, message: "Reset link sent" });

    } catch (error: any) {
        console.error("[ForgotPassword] Unexpected error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
