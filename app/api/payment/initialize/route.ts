import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Plan } from "@/models/Business";
import { Organization, User } from "@/models/User";
import { paystackService } from "@/lib/paystack/paystackService";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { organizationId, planSlug, email, callbackUrl } = body;

        if (!organizationId || !planSlug || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get Plan Details
        const plan = await Plan.findOne({ slug: planSlug });

        if (!plan) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        // 2. Handle Free Tier
        if (plan.price === 0) {
            return NextResponse.json({ error: "Free plan does not require payment initialization" }, { status: 400 });
        }

        // 3. Calculate Quantity for Per-User Plans (Premium)
        let quantity = 1;
        if (plan.slug.includes('premium')) {
            // Count unique users in organization
            const org = await Organization.findById(organizationId);
            const userCount = await User.countDocuments({
                "memberships.organizationId": new mongoose.Types.ObjectId(organizationId)
            });

            console.log(`[PaymentInit] Plan: ${plan.slug}, UserCount: ${userCount}`);
            quantity = Math.max(userCount, 1);
        }

        // 4. Initialize Paystack Transaction
        console.log(`[PaymentInit] Initializing transaction with Quantity: ${quantity}`);
        const response = await paystackService.initializeTransaction(
            email,
            plan.price,
            callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
            plan.paystackPlanCode,
            {
                organization_id: organizationId,
                plan_slug: plan.slug,
                quantity: quantity
            },
            quantity
        );

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("Payment initialization error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
