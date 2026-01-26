import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Employee } from "@/models/Business";
import { Organization, User } from "@/models/User";
import { mailService } from "@/lib/mail/mailService";
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
            return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
        }

        await connectToDatabase();
        const userId = (session.user as any).id;

        // 1. Fetch employee details BEFORE deletion
        const employee = await Employee.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            organizationId: new mongoose.Types.ObjectId(organizationId)
        }).populate("organizationId");

        if (!employee) {
            return NextResponse.json({ error: "Employee record not found" }, { status: 404 });
        }

        const org = employee.organizationId as any;
        const orgName = org?.name || "the organization";
        const employeeName = employee.fullName || session.user?.email;

        // 2. Identify the OWNER to notify
        const owner = await User.findOne({
            "memberships": {
                $elemMatch: { organizationId: new mongoose.Types.ObjectId(organizationId), role: "owner" }
            }
        });

        // 3. Perform Deletion
        await Employee.deleteOne({ _id: employee._id });

        // 4. Notify Owner
        if (owner && owner.email) {
            mailService.sendTerminationNoticeToOwner(owner.email, employeeName || "An employee", orgName)
                .catch(err => console.error("[Self-Terminate] Owner notification failed:", err));
        }

        return NextResponse.json({ success: true, message: "Account terminated successfully." });

    } catch (error: any) {
        console.error("[Self-Terminate] Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
