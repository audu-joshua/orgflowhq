import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Organization, User } from "@/models/User";
import { mailService } from "@/lib/mail/mailService";
import { randomInt } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { organizationId } = body;

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
        }

        await connectToDatabase();

        // Verify user is owner of the organization
        const user = await User.findById((session.user as any).id);
        const membership = user?.memberships.find(
            (m: any) => m.organizationId.toString() === organizationId && m.role === 'owner'
        );

        if (!membership) {
            return NextResponse.json({ error: "Only owners can close an organization" }, { status: 403 });
        }

        // Generate 6-digit PIN
        const pin = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Store PIN in DB
        await Organization.findByIdAndUpdate(organizationId, {
            deleteConfirmationCode: pin,
            deleteConfirmationExpiresAt: expiresAt
        });

        // Send Email
        await mailService.sendOrgDeletionPin(session.user.email!, pin);

        return NextResponse.json({ success: true, message: "Confirmation PIN sent to your email" });

    } catch (error: any) {
        console.error("Delete initiation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
