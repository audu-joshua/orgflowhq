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

        // 3. Calculate Quantity for Per-User Plans (Premium)
        let quantity = 1;
        if (plan.slug.includes('premium')) {
            // Fetch owner_id
            const { data: orgData, error: orgError } = await supabase
                .from("organizations")
                .select("owner_id")
                .eq("id", organizationId)
                .single();

            if (orgError) console.error("Error fetching org owner:", orgError);

            // Fetch staff IDs
            const { data: staffData, error: staffError } = await supabase
                .from("users_organizations")
                .select("user_id")
                .eq("organization_id", organizationId);

            if (staffError) console.error("Error fetching staff:", staffError);

            // Calculate unique users (Owner + Staff)
            const uniqueUsers = new Set<string>();
            if (orgData?.owner_id) uniqueUsers.add(orgData.owner_id);
            if (staffData) {
                staffData.forEach((s: any) => uniqueUsers.add(s.user_id));
            }

            const finalCount = uniqueUsers.size;
            console.log(`[PaymentInit] Plan: ${plan.slug}, Owner: ${orgData?.owner_id}, StaffCount: ${staffData?.length}, FinalQuantity: ${finalCount}`);

            // Ensure at least 1
            quantity = Math.max(finalCount, 1);
        }

        // 4. Initialize Paystack Transaction
        console.log(`[PaymentInit] Initializing transaction with Quantity: ${quantity}`);
        const response = await paystackService.initializeTransaction(
            email,
            plan.price,
            callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
            plan.paystack_plan_code,
            {
                organization_id: organizationId,
                plan_slug: plan.slug,
                quantity: quantity
            },
            quantity
        )

        return NextResponse.json(response)

    } catch (error: any) {
        console.error("Payment initialization error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
