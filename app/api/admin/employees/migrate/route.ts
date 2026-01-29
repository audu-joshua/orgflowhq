import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Employee } from "@/models/Business";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user || (session.user as any).role !== "super_admin") {
            // Check if requester is owner/admin of the organization
            // For now, simpler check: only super_admin or session must be valid
            if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { organizationId } = body;

        if (!organizationId) {
            return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Get all employees in this org without a userId
        const disconnectedEmployees = await Employee.find({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            userId: { $exists: false }
        });

        const results = [];

        for (const emp of disconnectedEmployees) {
            try {
                console.log(`[Migrate] Provisioning ${emp.email}...`);

                // Check if user already exists
                let user = await User.findOne({ email: emp.email.toLowerCase() });

                if (!user) {
                    // Create new user
                    const hashedPassword = await bcrypt.hash(emp.employeeId || "Password123!", 12);
                    user = await User.create({
                        email: emp.email.toLowerCase(),
                        password: hashedPassword,
                        fullName: emp.fullName,
                        name: emp.fullName,
                        role: "user",
                        memberships: [{
                            organizationId: new mongoose.Types.ObjectId(organizationId),
                            role: "member"
                        }]
                    });
                    results.push({ email: emp.email, status: "provisioned" });
                } else {
                    // Link existing user if not already member
                    const isMember = user.memberships.some(
                        (m: any) => m.organizationId.toString() === organizationId
                    );
                    if (!isMember) {
                        user.memberships.push({
                            organizationId: new mongoose.Types.ObjectId(organizationId),
                            role: "member"
                        });
                        await user.save();
                    }
                    results.push({ email: emp.email, status: "linked_existing" });
                }

                // Update employee record
                emp.userId = user._id;
                await emp.save();

            } catch (err: any) {
                results.push({ email: emp.email, status: "error", error: err.message });
            }
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error("[Migrate] Unexpected error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
