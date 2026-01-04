import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const { organizationId } = await req.json()

        if (!organizationId) {
            return NextResponse.json({ error: "Missing organizationId" }, { status: 400 })
        }

        // 1. Verify Session
        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        // 2. Terminate Employee Record
        const supabaseAdmin = getSupabaseAdmin()

        // Verify they belong to this org
        const { data: employee, error: fetchError } = await supabaseAdmin
            .from("employees")
            .select("id")
            .eq("user_id", user.id)
            .eq("organization_id", organizationId)
            .single()

        if (fetchError || !employee) {
            return NextResponse.json({ error: "Employee record not found or access denied" }, { status: 404 })
        }

        // Set status to terminated
        const { error: updateError } = await supabaseAdmin
            .from("employees")
            .update({ status: "terminated" })
            .eq("id", employee.id)

        if (updateError) {
            console.error("[Self-Terminate] Update error:", updateError)
            return NextResponse.json({ error: "Failed to terminate account" }, { status: 500 })
        }

        console.log(`[Self-Terminate] User ${user.email} terminated their own access in org ${organizationId}.`)

        // Sign them out from Supabase Auth globally
        await supabaseAdmin.auth.admin.signOut(user.id)

        return NextResponse.json({ success: true, message: "Account terminated successfully" })

    } catch (error: any) {
        console.error("[Self-Terminate] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
