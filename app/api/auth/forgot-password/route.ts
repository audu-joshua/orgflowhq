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

        // Generate a recovery link
        // Note: We point the redirectTo to the reset-password page which handles the token exchange
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo: `${siteUrl}/reset-password`
            }
        })

        if (error) {
            console.error("[ForgotPassword] Supabase error:", error)
            // Be careful not to leak user existence if possible, but for now we follow standard flow
            // Actually, suppressing error is better for security, but for debugging we log it.
            // If user not found, Supabase might return error or success depending on config.
            // But usually we return success to the client.
            return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." })
        }

        const resetLink = data.properties?.action_link

        if (!resetLink) {
            throw new Error("Failed to generate reset link")
        }

        // Send the custom email
        await mailService.sendPasswordResetEmail(email, resetLink)

        return NextResponse.json({ success: true, message: "Reset link sent" })

    } catch (error: any) {
        console.error("[ForgotPassword] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
