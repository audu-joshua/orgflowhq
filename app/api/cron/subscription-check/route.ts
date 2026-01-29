import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Subscription, Plan } from "@/models/Business";
import { Organization, User } from "@/models/User";
import { mailService } from "@/lib/mail/mailService";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();
        const now = new Date();

        // 1. Fetch Active Subscriptions
        const subs = await Subscription.find({ status: "active" })
            .populate("planId")
            .populate("organizationId");

        const results = {
            remindersSent: 0,
            cancelled: 0,
            errors: [] as string[]
        };

        for (const sub of subs) {
            try {
                const org = await Organization.findById(sub.organizationId);
                if (!org) continue;

                // Find Owner using memberships
                const owner = await User.findOne({
                    "memberships": {
                        $elemMatch: { organizationId: org._id, role: "owner" }
                    }
                });

                if (!owner || !owner.email) continue;

                const expiryDate = new Date(sub.currentPeriodEnd);
                const renewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

                // Calculate difference in days
                const diffTime = expiryDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Case 1: Expires Tomorrow
                if (diffDays === 1) {
                    await mailService.sendSubscriptionReminder(owner.email, owner.fullName || owner.name, 1, renewUrl);
                    results.remindersSent++;
                }
                // Case 2: Expired recently
                else if (diffDays <= 0 && diffDays > -3) {
                    await mailService.sendSubscriptionReminder(owner.email, owner.fullName || owner.name, diffDays, renewUrl);
                    results.remindersSent++;
                }
                // Case 3: Expired > 3 days
                else if (diffDays <= -3) {
                    sub.status = 'cancelled';
                    await sub.save();

                    await mailService.sendSubscriptionCancellation(
                        owner.email,
                        owner.fullName || owner.name,
                        (sub.planId as any).name || "Premium"
                    );
                    results.cancelled++;
                }

            } catch (err: any) {
                console.error(`Error processing sub ${sub._id}:`, err);
                results.errors.push(sub._id.toString());
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
