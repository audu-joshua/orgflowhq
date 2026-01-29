import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { Payment, Subscription, Plan } from "@/models/Business";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

        const body = await req.text();
        const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

        if (hash !== req.headers.get("x-paystack-signature")) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(body);
        await connectToDatabase();

        console.log("Paystack Webhook Event:", event.event);

        if (event.event === "charge.success") {
            const data = event.data;
            const reference = data.reference;
            const organizationId = data.metadata?.organization_id;

            if (organizationId) {
                // 1. Record Payment
                await Payment.findOneAndUpdate(
                    { reference },
                    {
                        organizationId: new mongoose.Types.ObjectId(organizationId),
                        amount: data.amount / 100,
                        currency: data.currency,
                        status: data.status,
                        paystackTransactionId: String(data.id),
                        metadata: data
                    },
                    { upsert: true }
                );

                // 2. Update Subscription if plan present
                if (data.plan) {
                    const plan = await Plan.findOne({ paystackPlanCode: data.plan.plan_code || data.plan });
                    if (plan) {
                        await Subscription.findOneAndUpdate(
                            { organizationId: new mongoose.Types.ObjectId(organizationId) },
                            {
                                planId: plan._id,
                                status: 'active',
                                currentPeriodStart: new Date(),
                                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            },
                            { upsert: true }
                        );
                    }
                }
            }
        } else if (event.event === "invoice.create") {
            // Subscription renewal invoice
            const data = event.data;
            const subscriptionCode = data.subscription?.subscription_code;
            if (subscriptionCode) {
                await Subscription.findOneAndUpdate(
                    { paystackSubscriptionCode: subscriptionCode },
                    { status: 'active' }
                );
            }
        }

        return NextResponse.json({ status: "success" });

    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
