import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"
import { mailService } from "@/lib/mail/mailService"

export async function POST(req: Request) {
    try {
        const { organizationId } = await req.json()

        if (!organizationId) {
            return NextResponse.json({ error: "Missing organizationId" }, { status: 400 })
        }

        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Authenticate the user calling the API
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()

        // 1. Fetch employee details BEFORE deletion for the notification
        const { data: employee, error: empFetchError } = await supabaseAdmin
            .from("employees")
            .select("full_name, email, organizations(name)")
            .eq("user_id", user.id)
            .eq("organization_id", organizationId)
            .single()

        if (empFetchError || !employee) {
            return NextResponse.json({ error: "Employee record not found" }, { status: 404 })
        }

        const orgName = (employee.organizations as any).name
        const employeeName = employee.full_name || user.email

        // 2. Identify the OWNER of the organization to notify them
        const { data: ownerRelation, error: ownerError } = await supabaseAdmin
            .from("users_organizations")
            .select("user_id, users(email)")
            .eq("organization_id", organizationId)
            .eq("role", "owner")
            .single()

        // 3. Perform Deletion
        const { error: deleteError } = await supabaseAdmin
            .from("employees")
            .delete()
            .eq("user_id", user.id)
            .eq("organization_id", organizationId)

        if (deleteError) throw deleteError

        // 4. Notify Owner (async/fire-and-forget style to not block response)
        if (ownerRelation && (ownerRelation.users as any)?.email) {
            const ownerEmail = (ownerRelation.users as any).email
            mailService.sendTerminationNoticeToOwner(ownerEmail, employeeName, orgName)
                .catch(err => console.error("[Self-Terminate] Owner notification failed:", err))
        }

        return NextResponse.json({ success: true, message: "Account terminated successfully." })

    } catch (error: any) {
        console.error("[Self-Terminate] Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
