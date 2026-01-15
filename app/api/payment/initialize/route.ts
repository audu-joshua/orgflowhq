import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { paystackService } from "@/lib/paystack/paystackService"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { organizationId, planSlug, email, callbackUrl } = body

        if (!organizationId || !planSlug || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await createSupabaseServerClient()

        // 1. Get Plan Details
        const { data: plan, error: planError } = await supabase
            .from("plans")
            .select("*")
            .eq("slug", planSlug)
            .single()

        if (planError || !plan) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
        }

        // 2. Handle Free Tier
        if (plan.price === 0) {
            // Logic to downgrade provided via separate endpoint or handled here
            return NextResponse.json({ error: "Free plan does not require payment initialization" }, { status: 400 })
        }

        // 3. Initialize Paystack Transaction
        const response = await paystackService.initializeTransaction(
            email,
            plan.price,
            callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
            plan.paystack_plan_code,
            { organization_id: organizationId }
        )

        return NextResponse.json(response)

    } catch (error: any) {
        console.error("Payment initialization error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
