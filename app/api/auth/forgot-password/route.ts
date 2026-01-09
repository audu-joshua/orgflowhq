import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { mailService } from "@/lib/mail/mailService"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

        // Use resetPasswordForEmail instead of admin.generateLink
        // This sends a recovery link that does NOT automatically create a session
        // The link redirects to /auth/callback which exchanges the code for a session
        // and then redirects to /reset-password
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/auth/callback?type=recovery`
        })

        if (error) {
            console.error("[ForgotPassword] Supabase error:", error)
            // Don't leak user existence - always return success
            return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." })
        }

        // Supabase sends the email automatically with resetPasswordForEmail
        // No need to send a custom email
        console.log(`[ForgotPassword] Password reset email sent to ${email}`)

        return NextResponse.json({ success: true, message: "Reset link sent" })

    } catch (error: any) {
        console.error("[ForgotPassword] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
