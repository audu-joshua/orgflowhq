"use server"

import { applicationService } from "./services/applicationService"
import { mailService } from "@/lib/mail/mailService"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { onboardingService } from "@/features/departments/services/onboardingService"

export async function updateApplicationStatusAction(
    applicationId: string,
    newStage: string,
    organizationId: string
) {
    try {
        const supabase = await createSupabaseServerClient()
        // 1. Update DB Status
        const application = await applicationService.updateApplicationStage(applicationId, newStage, supabase)

        // 2. Fetch Organization and Role details for Email
        const supabaseAdmin = getSupabaseAdmin()
        const { data: orgData } = await supabaseAdmin
            .from('organizations')
            .select('name, welcome_doc_url')
            .eq('id', organizationId)
            .single()

        const { data: appData } = await supabaseAdmin
            .from('applications')
            .select('applicant_name, applicant_email, roles(title, department)')
            .eq('id', applicationId)
            .single()

        if (!appData) throw new Error("Application not found")

        const orgName = orgData?.name || "OrgFlow"
        const roleTitle = (appData as any).roles?.title || "Position"

        // 3. Trigger Email Notifications & Automation if necessary
        if (newStage === "Hired") {
            // A. Automate Employee Record Creation & Invitation
            try {
                await onboardingService.onboardHiredCandidate({
                    applicantName: appData.applicant_name,
                    applicantEmail: appData.applicant_email,
                    roleTitle: roleTitle,
                    organizationId: organizationId,
                    departmentName: (appData as any).roles?.department
                })
            } catch (e) {
                console.error("Failed to automate onboarding:", e)
                // We continue even if this fails, so the hire process isn't blocked
            }

            // B. Send Enriched Congratulatory Email
            await mailService.sendCongratulatoryEmail(
                appData.applicant_email,
                appData.applicant_name,
                roleTitle,
                orgName,
                orgData?.welcome_doc_url
            )
        } else if (newStage === "Rejected") {
            await mailService.sendRejectionEmail(
                appData.applicant_email,
                appData.applicant_name,
                roleTitle,
                orgName
            )
        }

        return { success: true, application }
    } catch (error: any) {
        console.error("Failed to update status:", error)
        return { success: false, error: error.message }
    }
}

export async function bulkRejectRemainingAction(roleId: string, organizationId: string) {
    try {
        const supabase = await createSupabaseServerClient()
        const supabaseAdmin = getSupabaseAdmin()

        // 1. Fetch all pending applications for this role
        const { data: pendingApps } = await supabase
            .from('applications')
            .select('id, applicant_name, applicant_email')
            .eq('role_id', roleId)
            .not('current_stage', 'in', '("Hired","Rejected")')

        if (!pendingApps || pendingApps.length === 0) {
            return { success: true, count: 0 }
        }

        // 2. Fetch Org and Role name once
        const { data: orgData } = await supabaseAdmin
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single()

        const { data: roleData } = await supabaseAdmin
            .from('roles')
            .select('title')
            .eq('id', roleId)
            .single()

        const orgName = orgData?.name || "OrgFlow"
        const roleTitle = roleData?.title || "Position"

        // 3. Bulk Update in DB
        const { error } = await supabase
            .from('applications')
            .update({
                current_stage: "Rejected",
                status: "rejected",
                updated_at: new Date().toISOString()
            })
            .eq('role_id', roleId)
            .not('current_stage', 'in', '("Hired","Rejected")')

        if (error) throw error

        // 4. Send Emails (Non-blocking for UI response)
        pendingApps.forEach((app: { applicant_email: string; applicant_name: string }) => {
            mailService.sendRejectionEmail(
                app.applicant_email,
                app.applicant_name,
                roleTitle,
                orgName
            )
        })

        return { success: true, count: pendingApps.length }
    } catch (error: any) {
        console.error("Bulk rejection failed:", error)
        return { success: false, error: error.message }
    }
}

export async function deleteApplicationAction(applicationId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin
            .from('applications')
            .delete()
            .eq('id', applicationId)

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        console.error("Delete application failed:", error)
        return { success: false, error: error.message }
    }
}
