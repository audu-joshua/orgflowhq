import { googleCalendarService } from "@/lib/google/calendar"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
        return redirect(`/dashboard/interviews?error=google_auth_failed&details=${error}`)
    }

    if (!code) {
        return redirect("/dashboard/interviews?error=no_code")
    }

    try {
        const tokens = await googleCalendarService.getTokens(code)

        // Save to Database
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return redirect("/login")
        }

        // Upsert tokens
        const { error: dbError } = await supabase
            .from("user_integrations")
            .upsert({
                user_id: user.id,
                provider: "google",
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token, // Might be undefined if re-auth without prompt
                expires_at: tokens.expiry_date
            }, {
                onConflict: 'user_id, provider'
            })

        if (dbError) {
            console.error("DB Save Error:", dbError)
            return redirect("/dashboard/interviews?error=token_save_failed")
        }

        return redirect("/dashboard/interviews?success=google_connected")
    } catch (err) {
        console.error("Callback Error:", err)
        return redirect("/dashboard/interviews?error=callback_failed")
    }
}
