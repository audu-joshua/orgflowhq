import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

// We use the standard client to verify the requester's session
// and the Admin client to perform the privileged operation.

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, employeeId, fullName, organizationId } = body

        if (!email || !employeeId || !organizationId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Verify Requester Permissions
        // We get the auth header from the inbound request
        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user: requester }, error: authError } = await supabase.auth.getUser()

        if (authError || !requester) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        // Check if requester has admin/owner/hr role in that org
        const { data: membership, error: roleError } = await supabase
            .from("users_organizations")
            .select("role")
            .eq("user_id", requester.id)
            .eq("organization_id", organizationId)
            .single()

        if (roleError || !membership || !["owner", "admin", "hr"].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
        }

        // 2. Provision the Auth User
        const supabaseAdmin = getSupabaseAdmin()

        // Check if user already exists in auth
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
        const userInAuth = existingUser.users.find(u => u.email === email)

        let userId: string

        if (userInAuth) {
            console.log(`[Provision] User already exists in auth: ${email}`)
            userId = userInAuth.id

            // Update their password to the employeeId just in case
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: employeeId
            })

            if (updateError) {
                console.error("[Provision] Failed to update existing user password:", updateError)
            }
        } else {
            console.log(`[Provision] Creating new auth user: ${email}`)
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: employeeId,
                email_confirm: true, // Auto-confirm so they can log in immediately
                user_metadata: {
                    full_name: fullName,
                    role: "employee",
                    organization_id: organizationId
                }
            })

            if (createError) {
                console.error("[Provision] Supabase Admin Error:", createError.message)
                return NextResponse.json({ error: createError.message }, { status: 500 })
            }

            userId = newUser.user.id
        }

        return NextResponse.json({ userId })

    } catch (error: any) {
        console.error("[Provision] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
