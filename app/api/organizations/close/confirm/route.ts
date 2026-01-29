import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Organization, User } from "@/models/User";
import { Employee, JobRole } from "@/models/Business";
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
        const { organizationId, pin } = body;

        if (!organizationId || !pin) {
            return NextResponse.json({ error: "Organization ID and PIN are required" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Validate PIN and Ownership
        const org = await Organization.findById(organizationId);
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (org.deleteConfirmationCode !== pin) {
            return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
        }

        if (org.deleteConfirmationExpiresAt && new Date(org.deleteConfirmationExpiresAt) < new Date()) {
            return NextResponse.json({ error: "PIN has expired" }, { status: 400 });
        }

        // Verify ownership
        const user = await User.findById((session.user as any).id);
        const isAdmin = user?.role === 'super_admin';
        const isOwner = user?.memberships.some(
            (m: any) => m.organizationId.toString() === organizationId && m.role === 'owner'
        );

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 2. Perform Deletion
        // Note: In a real production app, we might want to soft-delete or use a transaction.
        // For this migration, we'll perform hard deletion of the organization and cleanup.

        // A. Remove organization memberships from ALL users
        await User.updateMany(
            { "memberships.organizationId": new mongoose.Types.ObjectId(organizationId) },
            { $pull: { memberships: { organizationId: new mongoose.Types.ObjectId(organizationId) } } }
        );

        // B. Delete organization document
        await Organization.findByIdAndDelete(organizationId);

        // C. Clean up associated resources (Best effort)
        // Note: We'd typically have many collections. Here are the core ones we've refactored:
        // Employees, JobRoles, Applications, Interviews, Payments, ActivityLogs
        // Some might be imported from different models.

        const deleteFilter = { organizationId: new mongoose.Types.ObjectId(organizationId) };

        await Promise.allSettled([
            Employee.deleteMany(deleteFilter),
            // Need to import JobRole correctly from whichever model it's in.
            // Using a dynamic approach for models that might not be imported or exist yet
            mongoose.model("JobRole").deleteMany(deleteFilter).catch(() => { }),
            mongoose.model("Application").deleteMany(deleteFilter).catch(() => { }),
            mongoose.model("Interview").deleteMany(deleteFilter).catch(() => { }),
            mongoose.model("Payment").deleteMany(deleteFilter).catch(() => { }),
            mongoose.model("ActivityLog").deleteMany(deleteFilter).catch(() => { }),
            mongoose.model("Subscription").deleteMany(deleteFilter).catch(() => { }),
        ]);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete confirmation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
