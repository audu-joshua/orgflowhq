import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Interview } from "../types"
import { applicationService } from "@/features/applications/services/applicationService"
import { activityLogger } from "@/lib/activityLogger"

interface ScheduleInterviewParams {
    organizationId: string
    applicantId: string
    roleId: string
    type: 'virtual' | 'in_person'
    scheduledAt: Date
    duration: number
    meetingLink?: string
    location?: string
    candidateName: string // For email
    roleTitle: string     // For email
    candidateEmail: string // For email
    performedBy: string   // User ID of HR
}

export const interviewService = {
    async scheduleInterview(params: ScheduleInterviewParams) {
        const supabase = getSupabaseClient()
        const {
            organizationId, applicantId, roleId, type, scheduledAt,
            duration, meetingLink, location, candidateName,
            roleTitle, candidateEmail, performedBy
        } = params

        // 1. Create Interview Record
        const { data: interview, error } = await supabase
            .from("interviews")
            .insert([{
                organization_id: organizationId,
                applicant_id: applicantId,
                role_id: roleId,
                type,
                scheduled_at: scheduledAt.toISOString(),
                duration,
                meeting_link: meetingLink,
                location,
                status: 'scheduled'
            }])
            .select()
            .single()

        if (error) {
            console.error("Error scheduling interview:", error)
            throw error
        }

        await applicationService.updateApplicationStage(applicantId, "Interview Scheduled")

        // 3. Email sent by Server Action

        const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        // 4. Log Activity
        await activityLogger.logActivity(
            organizationId,
            'interview',
            interview.id,
            'scheduled',
            `Interview scheduled for ${dateStr} at ${timeStr}`,
            performedBy
        )

        // Log for applicant as well
        await activityLogger.logActivity(
            organizationId,
            'application',
            applicantId,
            'interview_scheduled',
            `Interview scheduled for ${roleTitle}`,
            performedBy
        )

        return interview as Interview
    },

    async getInterviewsByRole(roleId: string) {
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from("interviews")
            .select(`
        *,
        applications:applicant_id (applicant_name, applicant_email)
      `)
            .eq("role_id", roleId)
            .order("scheduled_at", { ascending: true })

        if (error) throw error
        return data
    },

    async getInterviewsByOrganization(organizationId: string) {
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from("interviews")
            .select(`
                *,
                roles (title),
                applications (applicant_name, applicant_email)
            `)
            .eq("organization_id", organizationId)
            // Filter only scheduled or completed? Let's show all for now, or maybe just scheduled/completed.
            // .neq("status", "missed") 
            .order("scheduled_at", { ascending: true })

        if (error) throw error
        return data as (Interview & { roles: { title: string }, applications: { applicant_name: string, applicant_email: string } })[]
    }
}
