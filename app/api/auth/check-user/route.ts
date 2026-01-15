import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const supabaseAdmin = getSupabaseAdmin()

        // We check the public.users table or employees table depending on sync strategy.
        // Usually, checking public schema is safer than exposing auth.users directly.
        // Assuming public.users is synced with auth.users
        const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle()

        if (error) {
            console.error("[CheckUser] Database error:", error)
            // Fail safe: return exists=true to let the flow continue blindly if DB is down, 
            // or throw error. Here we return exists=false to hint issue if critical, 
            // but normally we might want to mask it. 
            // Given the requirement is explicit "Not Found" message:
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        // Also check employees table just in case they are an employee without a user entry yet?
        // No, password reset is for Auth Users.

        if (!user) {
            // Check if they are in auth.users but not public.users (rare but possible)
            // Admin listUsers is expensive and rate limited.
            // Better to rely on public table sync.
            // If they are not in public.users, they probably effectively don't exist for the app.
            return NextResponse.json({ exists: false })
        }

        return NextResponse.json({ exists: true })

    } catch (error: any) {
        console.error("[CheckUser] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
