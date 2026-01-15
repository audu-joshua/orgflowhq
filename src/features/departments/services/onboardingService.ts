import "server-only"
import { Employee } from "../types"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const onboardingService = {
    async onboardHiredCandidate(data: {
        applicantName: string,
        applicantEmail: string,
        roleTitle: string,
        organizationId: string,
        departmentName?: string,
        applicantPassport?: string | null
    }) {
        const { applicantName, applicantEmail, roleTitle, organizationId, departmentName, applicantPassport } = data
        const supabaseAdmin = getSupabaseAdmin()

        // 0. Check if already an employee in this organization
        const { data: existingEmp } = await supabaseAdmin
            .from("employees")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("email", applicantEmail)
            .maybeSingle()

        if (existingEmp) {
            throw new Error("Employee already exists in this organization")
        }

        // 1. Resolve or Create Target department
        const targetDeptName = departmentName || "Management"
        let { data: dept } = await supabaseAdmin
            .from("departments")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("name", targetDeptName)
            .maybeSingle()

        if (!dept) {
            const { data: newDept, error: createDeptError } = await supabaseAdmin
                .from("departments")
                .insert([{
                    organization_id: organizationId,
                    name: targetDeptName,
                    description: targetDeptName === "Management"
                        ? "Default department for system users"
                        : `Department for ${targetDeptName} roles`
                }])
                .select()
                .single()

            if (createDeptError) throw createDeptError
            dept = newDept
        }

        // 2. Fetch Org Details for ID Generation & Links
        const { data: org } = await supabaseAdmin
            .from("organizations")
            .select("name, slug")
            .eq("id", organizationId)
            .single()

        const orgName = org?.name || "OrgFlow"
        const orgSlug = org?.slug

        // 3. Generate Employee ID
        // We import the generator from departmentService to keep logic centralized but careful about browser-safe utils
        // Wait, generateNextEmployeeId uses getSupabaseClient. On server, getSupabaseClient() works too.
        const { departmentService } = await import("./departmentService")
        const employeeId = await departmentService.generateNextEmployeeId(organizationId, orgName, supabaseAdmin)

        // 4. Provision Supabase Auth Account
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: applicantEmail,
            password: employeeId,
            email_confirm: true,
            user_metadata: {
                full_name: applicantName,
                role: "employee",
                organization_id: organizationId,
                employee_id: employeeId
            }
        })

        let userId = userData?.user?.id
        if (createError) {
            // Check specifically for email_exists error code or message
            const isEmailExists = (createError as any).code === 'email_exists' ||
                createError.status === 422 ||
                createError.message.toLowerCase().includes("already registered") ||
                createError.message.toLowerCase().includes("already exists")

            if (isEmailExists) {
                // Try to find the existing user to link them
                const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
                if (listError) throw listError

                const existingUser = users.users.find(u => u.email?.toLowerCase() === applicantEmail.toLowerCase())
                if (existingUser) {
                    userId = existingUser.id
                } else {
                    throw createError
                }
            } else {
                throw createError
            }
        }

        if (!userId) throw new Error("Could not resolve User ID")

        // 4.5 Ensure public user record exists (Satisfy FK for employees)
        // This bridges the race condition with the handle_new_user trigger
        const { error: profileError } = await supabaseAdmin
            .from("users")
            .upsert({
                id: userId,
                email: applicantEmail,
                organization_id: organizationId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

        if (profileError) {
            console.error("[onboardHiredCandidate] Profile upsert failed:", profileError)
        }

        // 4.6 Link user to organization (Grant Access)
        const { error: linkError } = await supabaseAdmin
            .from("users_organizations")
            .insert([{
                user_id: userId,
                organization_id: organizationId,
                role: "employee"
            }])

        if (linkError) {
            if (linkError.message.includes("already exists")) {
                console.log("[onboardHiredCandidate] User already linked to organization")
            } else {
                console.error("[onboardHiredCandidate] Organization linking failed:", linkError)
            }
        }

        // 5. Create Employee Record
        const { data: employee, error: empError } = await supabaseAdmin
            .from("employees")
            .insert([{
                organization_id: organizationId,
                user_id: userId,
                department_id: dept!.id,
                full_name: applicantName,
                email: applicantEmail,
                employee_id: employeeId,
                position: roleTitle,
                profile_image_url: applicantPassport || null,
                status: "invited",
                hire_date: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single()

        if (empError) throw empError

        // 6. Send Invitation Email (Clock Portal)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const clockLink = orgSlug ? `${siteUrl}/org/${orgSlug}/clock` : `${siteUrl}/login`

        try {
            const { mailService } = await import("@/lib/mail/mailService")
            await mailService.sendEmployeeInviteEmail(
                applicantEmail,
                orgName,
                applicantName,
                clockLink,
                true,
                employeeId
            )
        } catch (mailErr) {
            console.error("[onboardHiredCandidate] Invitation email failed:", mailErr)
        }

        return employee as Employee
    }
}
