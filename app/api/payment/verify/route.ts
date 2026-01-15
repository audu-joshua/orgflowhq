import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { paystackService } from "@/lib/paystack/paystackService"

export async function POST(req: NextRequest) {
    try {
        const { reference, organizationId } = await req.json()

        if (!reference) {
            return NextResponse.json({ error: "Missing reference" }, { status: 400 })
        }

        const verification = await paystackService.verifyTransaction(reference)

        if (verification.data.status === 'success') {
            // Transaction verified. 
            // We should ensure the database is updated.
            const supabase = await createSupabaseServerClient()

            // Logic similar to webhook: update subscription/payment
            // We can trust this verification to update the DB immediately to avoid webhook delay.

            // 1. Log Payment if not exists
            await supabase.from("payments").upsert({
                organization_id: organizationId, // We might need org ID passed or derived
                amount: verification.data.amount / 100,
                currency: verification.data.currency,
                status: verification.data.status,
                reference: reference,
                paystack_transaction_id: String(verification.data.id),
                metadata: verification.data.metadata
            }, { onConflict: 'reference' })

            // 2. Update Subscription
            // If verification data contains plan info or we know the context
            // verification.data.metadata usually has organization_id if we passed it.
            const orgId = organizationId || verification.data.metadata?.organization_id

            if (orgId && verification.data.plan) {
                // Update subscription
                // Use plan code to find internal plan id... same logic as webhook
                const { data: plan } = await supabase
                    .from("plans")
                    .select("id")
                    .eq("paystack_plan_code", verification.data.plan) // verify returns plan code string? Check types.
                    // Types said: plan?: string
                    .single()

                if (plan) {
                    await supabase.from("subscriptions").upsert({
                        organization_id: orgId,
                        plan_id: plan.id,
                        status: 'active',
                    }, { onConflict: 'organization_id' }) // Assuming one sub per list? Table constraint might differ.
                    // Subscriptions table logic: usually one active. 
                    // Update where organization_id = ...
                    // If we use upsert on a specific ID it's safer.
                }
            }
        }

        return NextResponse.json(verification)

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
