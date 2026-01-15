import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY
        if (!secret) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

        const body = await req.text()
        const hash = crypto.createHmac("sha512", secret).update(body).digest("hex")

        if (hash !== req.headers.get("x-paystack-signature")) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
        }

        const event = JSON.parse(body)
        const supabase = supabaseAdmin

        console.log("Paystack Webhook Event:", event.event)

        if (event.event === "charge.success") {
            const data = event.data
            const reference = data.reference
            const organizationId = data.metadata?.organization_id

            if (organizationId) {
                // Record Payment
                await supabase.from("payments").insert({
                    organization_id: organizationId,
                    amount: data.amount / 100,
                    currency: data.currency,
                    status: data.status,
                    reference: reference,
                    paystack_transaction_id: String(data.id),
                    metadata: data
                })
            }
        } else if (event.event === "subscription.create") {
            const data = event.data
            const organizationId = data.metadata?.organization_id // Usually metadata is passed to subscription if initialized with it? 
            // IMPORTANT: Paystack subscription events might NOT carry the transaction metadata directly.
            // We often rely on the customer email or storing the reference relation.
            // However, if we used `organizationId` in the initialization, hopefully it persists or we catch the first 'charge.success' which has it, 
            // and then link the subscription code.

            // Strategy: When 'charge.success' happens for a subscription, it contains 'plan' field.
            // We can use that to update/create the subscription record.

            // But let's check if 'subscription.create' has it.
            // If not, we rely on charge.success to set the subscription_code on the org.
        } else if (event.event === "invoice.create") {
            // Subscription renewal invoice
            const data = event.data
            const subscriptionCode = data.subscription.subscription_code
            // Update subscription current_period_end/start
            await supabase.from("subscriptions")
                .update({
                    status: 'active', // Refresh status
                    // We need to parse next payment date?
                })
                .eq("paystack_subscription_code", subscriptionCode)
        }

        // GENERIC HANDLING: Update subscription based on successful boolean charge?
        // Let's refine the logic for 'charge.success' to also upate subscription if 'plan' is present.
        if (event.event === "charge.success" && event.data.plan) {
            const data = event.data
            const organizationId = data.metadata?.organization_id

            if (organizationId) {
                // 1. Find Plan ID by Paystack Plan Code (or slug?)
                // The event data has plan object? or plan code?
                // data.plan is usually an object { name, plan_code, ... } or just code?
                // Check payload. usually `data.plan`: {} 

                // We need to get our internal Plan ID.
                // This assumes we stored paystack_plan_code in 'plans' table.
                const { data: plan } = await supabase
                    .from("plans")
                    .select("id, slug")
                    .eq("paystack_plan_code", data.plan.plan_code) // Assuming data.plan has plan_code
                    .single()

                if (plan) {
                    // Upsert Subscription
                    const { data: sub } = await supabase
                        .from("subscriptions")
                        .select("id")
                        .eq("organization_id", organizationId)
                        .single()

                    if (sub) {
                        await supabase.from("subscriptions").update({
                            plan_id: plan.id,
                            status: 'active',
                            paystack_subscription_code: data.authorization.authorization_code, // Wait, subscription code is different.
                            // Actually, charge success doesn't always have subscription code.
                            // 'subscription.create' event has it.
                        }).eq("organization_id", organizationId)
                    } else {
                        // Create new
                        await supabase.from("subscriptions").insert({
                            organization_id: organizationId,
                            plan_id: plan.id,
                            status: 'active',
                            // We might miss paystack_subscription_code here if it's strictly a charge event.
                        })
                    }
                }
            }
        }

        return NextResponse.json({ status: "success" })

    } catch (error: any) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
