
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { mailService } from "@/lib/mail/mailService"

export async function GET(req: NextRequest) {
    // Basic security: Check for a secret key if valid CRON
    // const authHeader = req.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

    try {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const threeDaysAgo = new Date(now)
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        // 1. Fetch Active Subscriptions
        const { data: subs, error } = await supabaseAdmin
            .from("subscriptions")
            .select(`
                *,
                plan:plans(*),
                organization:organizations(
                    id, 
                    name, 
                    users_organizations(
                        user_id, 
                        role,
                        users(email, full_name)
                    )
                )
            `)
            .eq("status", "active")

        if (error) throw error

        const results = {
            remindersSent: 0,
            cancelled: 0,
            errors: [] as string[]
        }

        for (const sub of subs) {
            try {
                // Find Owner
                const owner = sub.organization?.users_organizations?.find((uo: any) => uo.role === 'owner')?.users
                if (!owner || !owner.email) continue

                const expiryDate = new Date(sub.current_period_end)
                const renewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`

                // Calculate difference in days
                const diffTime = expiryDate.getTime() - now.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                // Case 1: Expires Tomorrow (Day before)
                if (diffDays === 1) {
                    await mailService.sendSubscriptionReminder(owner.email, owner.full_name, 1, renewUrl)
                    results.remindersSent++
                }
                // Case 2: Expired recently (Grace period, daily reminder)
                else if (diffDays <= 0 && diffDays > -3) {
                    await mailService.sendSubscriptionReminder(owner.email, owner.full_name, diffDays, renewUrl)
                    results.remindersSent++
                }
                // Case 3: Expired > 3 days (Cancel)
                else if (diffDays <= -3) {
                    // Update status to cancelled (or 'past_due' if you prefer)
                    await supabaseAdmin
                        .from("subscriptions")
                        .update({ status: 'cancelled' })
                        .eq("id", sub.id)

                    // Downgrade logic could go here (e.g. switch plan_id to free)

                    await mailService.sendSubscriptionCancellation(owner.email, owner.full_name, sub.plan?.name || "Premium")
                    results.cancelled++
                }

            } catch (err: any) {
                console.error(`Error processing sub ${sub.id}:`, err)
                results.errors.push(sub.id)
            }
        }

        return NextResponse.json({ success: true, results })

    } catch (error: any) {
        console.error("Cron Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
