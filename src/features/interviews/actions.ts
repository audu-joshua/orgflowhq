'use server'

import { interviewService } from "./services/interviewService"
import { revalidatePath } from "next/cache"
import { mailService } from "@/lib/mail/mailService"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function scheduleInterviewAction(formData: FormData) {
    const organizationId = formData.get("organizationId") as string
    const applicantId = formData.get("applicantId") as string
    const roleId = formData.get("roleId") as string
    const type = formData.get("type") as 'virtual' | 'in_person'
    const dateStr = formData.get("date") as string
    const timeStr = formData.get("time") as string
    const duration = Number(formData.get("duration"))
    const link = formData.get("link") as string
    const location = formData.get("location") as string

    // For email context
    const candidateName = formData.get("candidateName") as string
    const roleTitle = formData.get("roleTitle") as string
    const candidateEmail = formData.get("candidateEmail") as string
    const performedBy = formData.get("performedBy") as string

    // Combine date and time
    const scheduledAt = new Date(`${dateStr}T${timeStr}`)

    try {
        const supabase = await createSupabaseServerClient()

        // 1. Check for Google Calendar Integration
        // Fetch token for the user performing the action
        // We assume performedBy is the user ID. 
        // NOTE: performedBy from formData might be just a name/id. 
        // Let's trust authentication instead. The user calling this action IS the authenticated user.
        // We should get the user from Supabase Auth to be secure and correct.
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id

        let meetingLinkToSave = link
        let googleEventId = null

        if (userId) {
            const { data: integration } = await supabase
                .from("user_integrations")
                .select("*")
                .eq("user_id", userId)
                .eq("provider", "google")
                .single()

            if (integration && integration.access_token) {
                try {
                    const { googleCalendarService } = await import("@/lib/google/calendar") // Dyn import to avoid build issues if lib missing

                    // Formatted End Time
                    const endTime = new Date(scheduledAt.getTime() + duration * 60000)

                    console.log("Creating Google Calendar Event...")
                    const event = await googleCalendarService.createCalendarEvent(
                        {
                            access_token: integration.access_token,
                            refresh_token: integration.refresh_token
                        },
                        {
                            summary: `Interview: ${candidateName} for ${roleTitle}`,
                            description: `Interview with ${candidateName} (${candidateEmail}). Role: ${roleTitle}.`,
                            start: scheduledAt.toISOString(),
                            end: endTime.toISOString(),
                            attendees: [candidateEmail]
                        }
                    )

                    console.log("Google Event Created:", event)

                    if (event.hangoutLink) {
                        meetingLinkToSave = event.hangoutLink
                    } else if (event.htmlLink) {
                        // Fallback to calendar link if meet link is missing
                        console.warn("No hangoutLink found, falling back to htmlLink")
                        // meetingLinkToSave = event.htmlLink // Only if we want to show cal link
                    }

                    if (event.id) {
                        googleEventId = event.id
                    }

                } catch (googleError) {
                    console.error("Google Calendar Error:", googleError)
                    // Fallback to manual link, don't fail action
                }
            }
        }


        // 2. Create Interview Record
        const { data: interview, error } = await supabase
            .from("interviews")
            .insert([{
                organization_id: organizationId,
                applicant_id: applicantId,
                role_id: roleId,
                type,
                scheduled_at: scheduledAt.toISOString(),
                duration,
                meeting_link: meetingLinkToSave,
                location,
                status: 'scheduled',
                // google_event_id: googleEventId // Column missing in DB
            }])
            .select()
            .single()

        if (error) {
            console.error("Error creating interview record:", error)
            throw new Error(`Database Error: ${error.message}`)
        }

        // 2. Update Applicant Stage
        const { error: appError } = await supabase
            .from("applications")
            .update({
                status: "interviewed",
                current_stage: "Interview Scheduled"
            })
            .eq("id", applicantId)

        if (appError) {
            console.error("Error updating application stage:", appError)
        }

        // Log Activity
        await supabase.from("activity_logs").insert([
            {
                organization_id: organizationId,
                entity_type: 'interview',
                entity_id: interview.id,
                action: 'scheduled',
                details: `Interview scheduled for ${dateStr} at ${timeStr}`,
                performed_by: performedBy
            },
            {
                organization_id: organizationId,
                entity_type: 'application',
                entity_id: applicantId,
                action: 'interview_scheduled',
                details: `Interview scheduled for ${roleTitle}`,
                performed_by: performedBy
            }
        ])

        // Fetch Organization Details for Email (Use Admin to bypass RLS)
        const supabaseAdmin = getSupabaseAdmin()
        const { data: orgData, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('name, email')
            .eq('id', organizationId)
            .single()

        if (orgError) {
            console.error("Error fetching org details (Admin):", orgError)
        }

        const orgName = orgData?.name || "OrgFlow"
        const orgEmail = orgData?.email || "support@orgflowhq.com"

        console.log("Creating email invite with:", {
            orgName,
            meetingLink: meetingLinkToSave,
            isVirtual: type === 'virtual'
        })

        // Send Email Invitation
        const dateFormatted = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const timeFormatted = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

        try {
            await mailService.sendInterviewInvitation(
                candidateEmail,
                candidateName,
                roleTitle,
                dateFormatted,
                timeFormatted,
                type,
                (type === 'virtual' ? meetingLinkToSave : location) || 'TBD',
                orgName,
                orgEmail
            )
        } catch (emailError) {
            console.error("Failed to send email invite:", emailError)
        }

        revalidatePath('/dashboard/applications')
        revalidatePath(`/dashboard/roles/${roleId}`)
        revalidatePath('/dashboard/interviews') // Also revalidate calendar

        return { success: true }
    } catch (error) {
        console.error("Action Error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to schedule interview" }
    }
}

export async function deleteInterviewAction(interviewId: string) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("Unauthorized")

        // Use Admin Client for Deletion to bypass RLS policies that might be restricted
        const supabaseAdmin = getSupabaseAdmin()

        // 1. Get interview details to check for Google Event
        const { data: interview } = await supabaseAdmin
            .from('interviews')
            .select('*') // Removed google_event_id selection as it doesn't exist
            .eq('id', interviewId)
            .single()

        if (!interview) throw new Error("Interview not found")

        // 2. Delete from Google Calendar if connected and event ID exists
        // (Implementation dependent on storing tokens - for now, we focus on DB delete)
        /* 
        if (interview.google_event_id) {
             const { data: integration } = await supabaseAdmin
                .from("user_integrations")
                .select("*")
                .eq("user_id", user.id) // Still check against user for token
                .eq("provider", "google")
                .single()
            
            if (integration) {
                 try {
                    const { googleCalendarService } = await import("@/lib/google/calendar")
                    // Note: We need a delete function in googleCalendarService. 
                    // But for now, we just proceed to delete locally.
                 } catch (e) {
                     console.error("Failed to delete from Google", e)
                 }
            }
        }
        */

        // 3. Delete from DB (Admin)
        const { error } = await supabaseAdmin
            .from('interviews')
            .delete()
            .eq('id', interviewId)

        if (error) {
            console.error("DB Delete Error:", error)
            throw new Error(error.message)
        }

        // 4. Log Activity
        await supabase.from("activity_logs").insert([{
            organization_id: interview.organization_id,
            entity_type: 'interview',
            entity_id: interview.id,
            action: 'deleted',
            details: `Interview deleted`,
            performed_by: user.id
        }])

        revalidatePath('/dashboard/interviews')
        revalidatePath('/dashboard/applications')

        return { success: true }
    } catch (error) {
        console.error("Delete Error:", error)
        return { success: false, error: "Failed to delete interview" }
    }
}
