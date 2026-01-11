import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { applicationService } from "@/features/applications/services/applicationService"
import { activityLogger } from "@/lib/activityLogger"

export async function GET(request: Request) {
    // Simple auth check for CRON
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For MVP, if no env var is set, maybe just allow it or fail.
        // Let's check if it's there.
        if (process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
        // If no secret configured, proceed (WARNING: insecure for prod, but okay for local/MVP demo)
    }

    const supabase = getSupabaseClient()
    const now = new Date().toISOString()

    try {
        // 1. Find scheduled interviews that have passed their start time (plus duration?)
        // Actually, "interview.scheduled_at < now" is the prompt requirements.
        // "Every 15–30 minutes: System checks: if interview.scheduled_at < now AND status === 'scheduled'"
        const { data: interviews, error } = await supabase
            .from("interviews")
            .select("*")
            .eq("status", "scheduled")
            .lt("scheduled_at", now)

        if (error) throw error

        const results = []

        for (const interview of interviews || []) {
            // Update Interview Status
            await supabase
                .from("interviews")
                .update({ status: "completed", updated_at: now })
                .eq("id", interview.id)

            // Update Applicant Stage
            // "Move applicant → Interviewed"
            await applicationService.updateApplicationStage(interview.applicant_id, "Interviewed")

            // Log Activity
            await activityLogger.logActivity(
                interview.organization_id,
                "interview",
                interview.id,
                "completed_auto",
                "Interview marked as completed by system",
                "system"
            )

            await activityLogger.logActivity(
                interview.organization_id,
                "application",
                interview.applicant_id,
                "interview_completed",
                "Interview completed confirmation",
                "system"
            )

            results.push(interview.id)
        }

        return NextResponse.json({ success: true, processed: results.length, ids: results })

    } catch (error) {
        console.error("Cron Error:", error)
        return NextResponse.json({ success: false, error: error }, { status: 500 })
    }
}
