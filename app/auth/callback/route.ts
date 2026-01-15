import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const type = requestUrl.searchParams.get("type")

    console.log(`[AuthCallback] Received request:`, {
        url: request.url,
        code: code ? "*****" : "missing",
        type
    })

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value, ...options })
                        } catch (error) {
                            // Handle cookie setting errors in middleware
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: "", ...options })
                        } catch (error) {
                            // Handle cookie removal errors in middleware
                        }
                    },
                },
            }
        )

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("[AuthCallback] Error exchanging code:", error)
            return NextResponse.redirect(new URL("/login?error=invalid_code", requestUrl.origin))
        }

        console.log("[AuthCallback] Session exchanged successfully")
        console.log("[AuthCallback] User Metadata:", data.session?.user?.user_metadata)
        console.log("[AuthCallback] Session User ID:", data.session?.user?.id)

        // If this is a recovery flow, redirect to reset-password
        if (type === "recovery") {
            console.log("[AuthCallback] Redirecting to reset-password (recovery)")
            return NextResponse.redirect(new URL("/reset-password", requestUrl.origin))
        }

        // For other auth flows (signup, invite, etc.), redirect to dashboard
        console.log("[AuthCallback] Redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
    }

    // If no code, redirect to login
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
}
