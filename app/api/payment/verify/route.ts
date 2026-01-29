import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Payment, Subscription, Plan } from "@/models/Business";
import { Organization, User } from "@/models/User";
import { paystackService } from "@/lib/paystack/paystackService";
import { mailService } from "@/lib/mail/mailService";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { reference, organizationId } = await req.json();

        if (!reference) {
            return NextResponse.json({ error: "Missing reference" }, { status: 400 });
        }

        const verification = await paystackService.verifyTransaction(reference);
        console.log(`[Payment Verify] Reference: ${reference}, Status: ${verification.data.status}`);

        if (verification.data.status === 'success') {
            // 1. Log Payment if not exists
            const existingPayment = await Payment.findOne({ reference });

            if (existingPayment) {
                console.log(`[Payment Verify] Payment already processed: ${reference}`);
                return NextResponse.json(verification);
            }

            await Payment.create({
                organizationId: new mongoose.Types.ObjectId(organizationId),
                amount: verification.data.amount / 100,
                currency: verification.data.currency,
                status: verification.data.status,
                reference: reference,
                paystackTransactionId: String(verification.data.id),
                metadata: verification.data.metadata
            });

            // 2. Update Subscription
            let metadata = verification.data.metadata;
            if (typeof metadata === 'string') {
                try { metadata = JSON.parse(metadata); } catch (e) { }
            }

            const orgId = organizationId || metadata?.organization_id;
            const planSlug = metadata?.plan_slug;

            if (orgId) {
                let planId = null;
                let planName = "Subscription";

                if (planSlug) {
                    const plan = await Plan.findOne({ slug: planSlug });
                    if (plan) {
                        planId = plan._id;
                        planName = plan.name;
                    }
                }

                if (!planId && verification.data.plan) {
                    const plan = await Plan.findOne({ paystackPlanCode: verification.data.plan });
                    if (plan) {
                        planId = plan._id;
                        planName = plan.name;
                    }
                }

                if (planId) {
                    await Subscription.findOneAndUpdate(
                        { organizationId: new mongoose.Types.ObjectId(orgId) },
                        {
                            planId,
                            status: 'active',
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        },
                        { upsert: true }
                    );

                    // Send Email
                    const owner = await User.findOne({
                        "memberships": {
                            $elemMatch: { organizationId: new mongoose.Types.ObjectId(orgId), role: "owner" }
                        }
                    });

                    if (owner) {
                        const amountFormatted = verification.data.currency + " " + (verification.data.amount / 100).toLocaleString();
                        await mailService.sendPaymentConfirmation(
                            owner.email,
                            owner.fullName || owner.name || "Valued Customer",
                            planName,
                            amountFormatted,
                            new Date().toLocaleDateString()
                        );
                    }
                }
            }
        }

        return NextResponse.json(verification);

    } catch (error: any) {
        console.error('[Payment Verify] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
