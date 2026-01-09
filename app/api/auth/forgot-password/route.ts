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

        // Dynamic site URL detection for robustness
        let siteUrl = process.env.NEXT_PUBLIC_SITE_URL

        // If env var is missing or localhost (in prod), try to use the request origin/host
        if (!siteUrl || (process.env.NODE_ENV === "production" && siteUrl.includes("localhost"))) {
            const host = req.headers.get("host")
            const protocol = host?.includes("localhost") ? "http" : "https"
            if (host) {
                siteUrl = `${protocol}://${host}`
            }
        }

        // Fallback
        siteUrl = (siteUrl || "http://localhost:3000").replace(/\/$/, "")

        const redirectUrl = `${siteUrl}/auth/callback?type=recovery`

        console.log(`[ForgotPassword] Generating link with redirect: ${redirectUrl}`)

        // Generate a recovery link using admin.generateLink
        // This gives us full control over the email content
        // The redirect goes to /auth/callback which will exchange the code and redirect to /reset-password
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: redirectUrl
            }
        })

        if (error) {
            console.error("[ForgotPassword] Supabase error:", error)
            // Don't leak user existence - always return success
            return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." })
        }

        const resetLink = data.properties?.action_link

        if (!resetLink) {
            throw new Error("Failed to generate reset link")
        }

        // Send our custom branded email
        await mailService.sendPasswordResetEmail(email, resetLink)

        console.log(`[ForgotPassword] Password reset email sent to ${email}`)
        return NextResponse.json({ success: true, message: "Reset link sent" })

    } catch (error: any) {
        console.error("[ForgotPassword] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

