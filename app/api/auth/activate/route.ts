import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        // 1. Verify Requester
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

        // 2. Activate Employee Record
        const supabaseAdmin = getSupabaseAdmin()

        // Check current status
        const { data: employee, error: fetchError } = await supabaseAdmin
            .from("employees")
            .select("id, status")
            .eq("user_id", user.id)
            .single()

        if (fetchError || !employee) {
            return NextResponse.json({ error: "Employee record not found" }, { status: 404 })
        }

        if (employee.status === "invited") {
            const { data: orgData } = await supabaseAdmin
                .from("organizations")
                .select("name, slug")
                .eq("id", user.user_metadata.organization_id)
                .single()

            const { error: updateError } = await supabaseAdmin
                .from("employees")
                .update({
                    status: "active",
                    activated_at: new Date().toISOString()
                })
                .eq("id", employee.id)

            if (updateError) {
                console.error("[Activate] Update error:", updateError)
                return NextResponse.json({ error: "Failed to activate account" }, { status: 500 })
            }

            console.log(`[Activate] Account ${user.email} activated successfully.`)

            // Trigger welcome email
            try {
                const { mailService } = await import("@/lib/mail/mailService")
                await mailService.sendEmployeeWelcomeEmail(
                    user.email!,
                    orgData?.name || "Your Company",
                    user.user_metadata.full_name || "Employee",
                    orgData?.slug || ""
                )
            } catch (mailErr) {
                console.error("[Activate] Mail failed:", mailErr)
            }

            return NextResponse.json({ success: true, message: "Account activated" })
        }

        return NextResponse.json({ success: true, message: "Account already active" })

    } catch (error: any) {
        console.error("[Activate] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
