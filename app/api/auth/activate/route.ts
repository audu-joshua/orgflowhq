import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "No authorization header" }, { status: 401 })
        }

        // 1. Authenticate the user with their own token to ensure RLS session
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        console.log(`[Activation] Attempting activation for ${user.email}...`)

        // 2. Use Admin client for the Atomic Update
        // We do this to ensure we can link the user_id and change status
        // AND trigger any collateral logic if needed.
        const supabaseAdmin = getSupabaseAdmin()

        const { data: updated, error: updateError } = await supabaseAdmin
            .from("employees")
            .update({
                status: "active",
                user_id: user.id,
                activated_at: new Date().toISOString()
            })
            .eq("email", user.email)
            .eq("status", "invited")
            .select()
            .single()

        if (updateError) {
            console.error("[Activation] Database update failed:", updateError)
            return NextResponse.json({ error: updateError.message }, { status: 400 })
        }

        console.log(`[Activation] Success for ${user.email}`)
        return NextResponse.json({ success: true, employee: updated })

    } catch (error: any) {
        console.error("[Activation] Internal Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
