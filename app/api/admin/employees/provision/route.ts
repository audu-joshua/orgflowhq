import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    console.log("[Provision] Incoming request started")
    try {
        const body = await req.json()
        const { email: rawEmail, employeeId: rawEmployeeId, fullName, organizationId } = body

        if (!rawEmail || !rawEmployeeId || !organizationId) {
            console.error("[Provision] Missing fields:", { rawEmail, rawEmployeeId, organizationId })
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const email = rawEmail.trim().toLowerCase()
        const employeeId = rawEmployeeId.trim()

        console.log(`[Provision] Processing: ${email} with ID: ${employeeId}`)

        // 1. Verify Requester Permissions
        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            console.error("[Provision] No Authorization header")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user: requester }, error: authError } = await supabase.auth.getUser()

        if (authError || !requester) {
            console.error("[Provision] Invalid session:", authError?.message)
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        const { data: membership, error: roleError } = await supabase
            .from("users_organizations")
            .select("role")
            .eq("user_id", requester.id)
            .eq("organization_id", organizationId)
            .single()

        if (roleError || !membership || !["owner", "admin", "hr"].includes(membership.role)) {
            console.error("[Provision] Access denied for user:", requester.id, roleError?.message)
            return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
        }

        // 2. Provision Logic
        const supabaseAdmin = getSupabaseAdmin()

        // Fetch Org Name & Slug for the static link
        const { data: org } = await supabaseAdmin
            .from("organizations")
            .select("name, slug")
            .eq("id", organizationId)
            .single()

        const orgName = org?.name || "your organization"
        const orgSlug = org?.slug
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const clockLink = orgSlug ? `${siteUrl}/org/${orgSlug}/clock` : `${siteUrl}/login`

        // Check if user already exists in auth (Robust check)
        // We use listUsers with a large limit or try to search
        const { data: userListData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000 // Increase limit to avoid missing users in initial pages
        })

        if (listError) {
            console.error("[Provision] Failed to list users:", listError.message)
            return NextResponse.json({ error: "Failed to verify user status" }, { status: 500 })
        }

        const userInAuth = userListData.users.find(u => u.email?.toLowerCase() === email)

        let userId: string

        if (userInAuth) {
            console.log(`[Provision] User exists (${userInAuth.id}), UPDATING password to Employee ID: ${employeeId}`)

            // To ensure the "Default" password works as the user expects,
            // we update the existing user's password during provisioning.
            const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                userInAuth.id,
                {
                    password: employeeId,
                    user_metadata: {
                        ...userInAuth.user_metadata,
                        organization_id: organizationId,
                        employee_id: employeeId
                    }
                }
            )

            if (updateError) {
                console.error("[Provision] Update Password Error:", updateError.message)
                return NextResponse.json({ error: `Could not set default password: ${updateError.message}` }, { status: 400 })
            }

            console.log("[Provision] User updated successfully")
            userId = userInAuth.id

            try {
                const { mailService } = await import("@/lib/mail/mailService")
                await mailService.sendEmployeeInviteEmail(
                    email,
                    orgName,
                    fullName,
                    clockLink,
                    false, // isNewUser = false
                    employeeId
                )
            } catch (mailErr) {
                console.error("[Provision] mailService error (existing):", mailErr)
            }
        } else {
            console.log(`[Provision] Creating new user with password: ${employeeId}`)

            const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: employeeId,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    role: "employee",
                    organization_id: organizationId,
                    employee_id: employeeId
                }
            })

            if (createError) {
                console.error("[Provision] Create User Error:", createError.message)
                return NextResponse.json({ error: `Auth creation failed: ${createError.message}` }, { status: 500 })
            }

            console.log("[Provision] New user created successfully:", userData.user.id)
            userId = userData.user.id

            try {
                const { mailService } = await import("@/lib/mail/mailService")
                await mailService.sendEmployeeInviteEmail(
                    email,
                    orgName,
                    fullName,
                    clockLink,
                    true, // isNewUser = true
                    employeeId
                )
            } catch (mailErr) {
                console.error("[Provision] mailService error (new):", mailErr)
            }
        }

        console.log("[Provision] Request completed successfully for userId:", userId)
        return NextResponse.json({ userId })

    } catch (error: any) {
        console.error("[Provision] Unexpected error:", error)
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 })
    }
}
