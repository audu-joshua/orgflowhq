import { Employee } from "../types"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const onboardingService = {
    async onboardHiredCandidate(data: {
        applicantName: string,
        applicantEmail: string,
        roleTitle: string,
        organizationId: string,
        departmentName?: string
    }) {
        const { applicantName, applicantEmail, roleTitle, organizationId, departmentName } = data
        const supabaseAdmin = getSupabaseAdmin()

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
            if (createError.message.includes("already exists")) {
                const { data: users } = await supabaseAdmin.auth.admin.listUsers()
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
