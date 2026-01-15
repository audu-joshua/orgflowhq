import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const { organizationId, pin } = await req.json()

        if (!organizationId || !pin) {
            return NextResponse.json({ error: "Organization ID and PIN are required" }, { status: 400 })
        }

        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth error:", authError)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()

        // 1. Validate PIN and Ownership
        const { data: org, error: fetchError } = await supabaseAdmin
            .from("organizations")
            .select("delete_confirmation_code, delete_confirmation_expires_at")
            .eq("id", organizationId)
            .single()

        if (fetchError || !org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        if (org.delete_confirmation_code !== pin) {
            return NextResponse.json({ error: "Invalid PIN" }, { status: 400 })
        }

        if (new Date(org.delete_confirmation_expires_at) < new Date()) {
            return NextResponse.json({ error: "PIN has expired" }, { status: 400 })
        }

        // Verify ownership (redundant check but good for safety)
        const { data: userOrg } = await supabaseAdmin
            .from("users_organizations")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", organizationId)
            .single()

        if (userOrg?.role !== 'owner') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // 2. Fetch employees to delete their Auth accounts
        const { data: employees } = await supabaseAdmin
            .from("employees")
            .select("user_id")
            .eq("organization_id", organizationId)

        // 3. Delete Organization (Cascade will handle DB records: employees, timesheets, etc.)
        const { error: deleteError } = await supabaseAdmin
            .from("organizations")
            .delete()
            .eq("id", organizationId)

        if (deleteError) {
            console.error("Org deletion failed:", deleteError)
            return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 })
        }

        // 4. Delete Auth Users (Cleanup)
        if (employees && employees.length > 0) {
            const deletePromises = employees
                .filter(emp => emp.user_id) // Only those with linked auth accounts
                .map(emp => supabaseAdmin.auth.admin.deleteUser(emp.user_id))

            await Promise.allSettled(deletePromises)
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Delete confirmation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
