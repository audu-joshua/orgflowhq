import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { organizationId } = body

        if (!organizationId) {
            return NextResponse.json({ error: "Missing organizationId" }, { status: 400 })
        }

        // 1. Verify Requester (Same security as provision route)
        const authHeader = req.headers.get("Authorization")
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false }
        })

        const { data: { user: requester }, error: authError } = await supabase.auth.getUser()

        if (authError || !requester) {
            console.error("[Migrate] Auth Error:", authError)
            console.error("[Migrate] Header:", authHeader.substring(0, 20) + "...")
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        const { data: membership } = await supabase
            .from("users_organizations")
            .select("role")
            .eq("user_id", requester.id)
            .eq("organization_id", organizationId)
            .single()

        if (!membership || !["owner", "admin"].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // 2. Migration Logic
        const supabaseAdmin = getSupabaseAdmin()

        // Get all employees in this org without a user_id
        const { data: disconnectedEmployees, error: fetchError } = await supabaseAdmin
            .from("employees")
            .select("id, email, employee_id, full_name")
            .eq("organization_id", organizationId)
            .is("user_id", null)

        if (fetchError) throw fetchError

        const results = []

        for (const emp of (disconnectedEmployees || [])) {
            try {
                console.log(`[Migrate] Provisioning ${emp.email}...`)

                // Use the Admin API to create user
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: emp.email,
                    password: emp.employee_id,
                    email_confirm: true,
                    user_metadata: {
                        full_name: emp.full_name,
                        role: "employee",
                        organization_id: organizationId
                    }
                })

                if (createError) {
                    // If user already exists in auth but not linked here, we'll try to find them
                    if (createError.message.includes("already registered")) {
                        const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
                        const found = existing.users.find(u => u.email === emp.email)
                        if (found) {
                            await supabaseAdmin.from("employees").update({ user_id: found.id }).eq("id", emp.id)
                            results.push({ email: emp.email, status: "linked_existing" })
                            continue
                        }
                    }
                    results.push({ email: emp.email, status: "failed", error: createError.message })
                    continue
                }

                // Link the employee record
                await supabaseAdmin
                    .from("employees")
                    .update({ user_id: newUser.user.id })
                    .eq("id", emp.id)

                results.push({ email: emp.email, status: "provisioned" })
            } catch (err: any) {
                results.push({ email: emp.email, status: "error", error: err.message })
            }
        }

        return NextResponse.json({ results })

    } catch (error: any) {
        console.error("[Migrate] Unexpected error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
