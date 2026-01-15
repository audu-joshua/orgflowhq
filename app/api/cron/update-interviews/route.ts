import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { googleCalendarService } from '@/lib/google/calendar'
import { mailService } from '@/lib/mail/mailService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const now = new Date()
    const bufferMinutes = 15
    const checkTime = new Date(now.getTime() - bufferMinutes * 60000)

    try {
        // 1. Fetch all "Interview Scheduled" interviews that should have ended
        const { data: interviews, error } = await supabaseAdmin
            .from('interviews')
            .select(`
                *,
                applications!inner(
                    id, 
                    applicant_name, 
                    applicant_email, 
                    roles(title),
                    organization_id
                )
            `)
            .eq('status', 'scheduled')
            .lte('end_time', checkTime.toISOString())

        if (error) throw error
        if (!interviews || interviews.length === 0) {
            return NextResponse.json({ message: 'No interviews to update' })
        }

        const results = []

        for (const interview of interviews) {
            try {
                // 2. Fetch Google Calendar Event to check status
                let isCancelled = false
                let isRescheduled = false
                let newStartTime = null
                let newEndTime = null

                if (interview.google_event_id && interview.organizer_id) {
                    // Fetch tokens
                    const { data: integration } = await supabaseAdmin
                        .from('user_integrations')
                        .select('*')
                        .eq('user_id', interview.organizer_id)
                        .eq('provider', 'google')
                        .single()

                    if (integration) {
                        try {
                            const event = await googleCalendarService.getEvent(
                                interview.google_event_id,
                                {
                                    access_token: integration.access_token,
                                    refresh_token: integration.refresh_token,
                                    expiry_date: integration.expires_at ? new Date(integration.expires_at).getTime() : 0
                                }
                            )

                            if (event.status === 'cancelled') {
                                isCancelled = true
                            } else {
                                // Check if the time has changed significantly (Rescheduled)
                                const eventStart = event.start?.dateTime || event.start?.date
                                if (eventStart && new Date(eventStart).getTime() !== new Date(interview.start_time).getTime()) {
                                    isRescheduled = true
                                    newStartTime = eventStart
                                    newEndTime = event.end?.dateTime || event.end?.date
                                }
                            }
                        } catch (e: any) {
                            console.error(`Failed to fetch Google event ${interview.google_event_id}:`, e)
                            // If event not found (404), assume cancelled
                            if (e.code === 404) isCancelled = true
                        }
                    }
                }

                // 3. Handle based on status
                if (isCancelled) {
                    await supabaseAdmin
                        .from('interviews')
                        .update({ status: 'cancelled', updated_at: now.toISOString() })
                        .eq('id', interview.id)

                    results.push({ id: interview.id, action: 'cancelled' })
                }
                else if (isRescheduled && newStartTime) {
                    await supabaseAdmin
                        .from('interviews')
                        .update({
                            start_time: newStartTime,
                            end_time: newEndTime,
                            updated_at: now.toISOString()
                        })
                        .eq('id', interview.id)

                    results.push({ id: interview.id, action: 'rescheduled' })
                }
                else {
                    // Normal Completion
                    // 4. Update Interview & Application status
                    const { error: updateError } = await supabaseAdmin
                        .from('interviews')
                        .update({ status: 'completed', updated_at: now.toISOString() })
                        .eq('id', interview.id)

                    if (!updateError) {
                        await supabaseAdmin
                            .from('applications')
                            .update({
                                current_stage: 'Interview Completed',
                                status: 'interviewed',
                                updated_at: now.toISOString()
                            })
                            .eq('id', interview.applications.id)

                        // 5. Notify Interviewer/Recruiter (Organizer)
                        const { data: organizer } = await supabaseAdmin
                            .from('users')
                            .select('email, full_name, organizations(name)')
                            .eq('id', interview.organizer_id)
                            .single()

                        if (organizer) {
                            await mailService.sendFeedbackRequestEmail(
                                organizer.email,
                                organizer.full_name || 'Interviewer',
                                interview.applications.applicant_name,
                                interview.applications.roles.title,
                                (organizer.organizations as any)?.name || 'OrgFlow'
                            )
                        }

                        results.push({ id: interview.id, action: 'completed' })
                    }
                }
            } catch (innerError: any) {
                console.error(`Error processing interview ${interview.id}:`, innerError)
                results.push({ id: interview.id, error: innerError.message })
            }
        }

        return NextResponse.json({ processed: results.length, details: results })
    } catch (error: any) {
        console.error('Cron job failed:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}
