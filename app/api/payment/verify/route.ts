import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { paystackService } from "@/lib/paystack/paystackService"
import { mailService } from "@/lib/mail/mailService"

export async function POST(req: NextRequest) {
    try {
        const { reference, organizationId } = await req.json()

        if (!reference) {
            return NextResponse.json({ error: "Missing reference" }, { status: 400 })
        }

        const verification = await paystackService.verifyTransaction(reference)
        console.log(`[Payment Verify] Reference: ${reference}, Status: ${verification.data.status}`)

        if (verification.data.status === 'success') {
            // Transaction verified. 
            // We should ensure the database is updated.
            const supabase = supabaseAdmin // Use service role to bypass RLS for writes

            // Logic similar to webhook: update subscription/payment
            // We can trust this verification to update the DB immediately to avoid webhook delay.

            // 1. Log Payment if not exists
            // 1. Log Payment if not exists
            const { data: existingPayment } = await supabase
                .from("payments")
                .select("id")
                .eq("reference", reference)
                .maybeSingle()

            if (existingPayment) {
                console.log(`[Payment Verify] Payment already processed: ${reference}`)
                return NextResponse.json(verification)
            }

            await supabase.from("payments").insert({
                organization_id: organizationId, // We might need org ID passed or derived
                amount: verification.data.amount / 100,
                currency: verification.data.currency,
                status: verification.data.status,
                reference: reference,
                paystack_transaction_id: String(verification.data.id),
                metadata: verification.data.metadata
            })

            // 2. Update Subscription
            // Parse metadata if it's a string (common issue with some providers/payloads)
            let metadata = verification.data.metadata
            if (typeof metadata === 'string') {
                try {
                    metadata = JSON.parse(metadata)
                } catch (e) {
                    console.error('[Payment Verify] Failed to parse metadata string:', e)
                }
            }

            const orgId = organizationId || metadata?.organization_id
            const planSlug = metadata?.plan_slug

            console.log(`[Payment Verify] OrgId: ${orgId}, PlanSlug: ${planSlug}`)

            if (orgId) {
                let planId = null;
                let planName = "Subscription"; // Default name

                // Priority 1: Use Plan Slug from Metadata (Most Reliable)
                if (planSlug) {
                    const { data: planBySlug } = await supabase
                        .from("plans")
                        .select("id, name")
                        .eq("slug", planSlug)
                        .single()
                    if (planBySlug) {
                        planId = planBySlug.id
                        planName = planBySlug.name
                    }
                }

                // Priority 2: Fallback to Paystack Plan Code
                if (!planId && verification.data.plan) {
                    const { data: planByCode } = await supabase
                        .from("plans")
                        .select("id, name")
                        .eq("paystack_plan_code", verification.data.plan)
                        .single()
                    if (planByCode) {
                        planId = planByCode.id
                        planName = planByCode.name
                    }
                }

                if (planId) {
                    // Check if subscription exists
                    const { data: existingSub } = await supabase
                        .from("subscriptions")
                        .select("id")
                        .eq("organization_id", orgId)
                        .maybeSingle()

                    const subData = {
                        organization_id: orgId,
                        plan_id: planId,
                        status: 'active',
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    }

                    if (existingSub) {
                        await supabase
                            .from("subscriptions")
                            .update(subData)
                            .eq("id", existingSub.id)
                    } else {
                        await supabase
                            .from("subscriptions")
                            .insert([subData])
                    }

                    // Send Email Notification
                    const { data: userOrg } = await supabase
                        .from("users_organizations")
                        .select("users(email, full_name)")
                        .eq("organization_id", orgId)
                        .eq("role", "owner")
                        .maybeSingle()

                    if (userOrg?.users) {
                        const { email, full_name } = userOrg.users as any
                        const amountFormatted = verification.data.currency + " " + (verification.data.amount / 100).toLocaleString()

                        await mailService.sendPaymentConfirmation(
                            email,
                            full_name || "Valued Customer",
                            planName,
                            amountFormatted,
                            new Date().toLocaleDateString()
                        )
                    }
                }
            }
        }

        return NextResponse.json(verification)

    } catch (error: any) {
        console.error('[Payment Verify] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
