import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import { User, Organization } from "@/models/User";
import { Employee } from "@/models/Business";
import bcrypt from "bcryptjs";
import { mailService } from "@/lib/mail/mailService";

export async function POST(req: Request) {
    console.log("[Provision] MongoDB route started");
    try {
        await connectToDatabase();
        const body = await req.json();
        const { email: rawEmail, employeeId: rawEmployeeId, fullName, organizationId } = body;

        if (!rawEmail || !rawEmployeeId || !organizationId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const email = rawEmail.trim().toLowerCase();
        const employeeId = rawEmployeeId.trim();

        // 1. Verify Requester Permissions
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requester = await User.findById(session.user.id);
        if (!requester) {
            return NextResponse.json({ error: "Requester not found" }, { status: 401 });
        }

        const membership = requester.memberships.find(
            (m: any) => m.organizationId?.toString() === organizationId
        );

        if (!membership || !["owner", "admin", "hr"].includes(membership.role)) {
            return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
        }

        // 2. Global Integrity Check: Does this email already exist as an employee anywhere?
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return NextResponse.json({
                error: "An employee with this email already exists in the system."
            }, { status: 400 });
        }

        // 3. Provision Logic
        const org = await Organization.findById(organizationId);
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const orgName = org.name;
        const orgSlug = org.slug;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const clockLink = `${siteUrl}/org/${orgSlug}/clock`;

        // Check if user already exists in auth (MongoDB Users collection)
        let user = await User.findOne({ email });
        let userId: string;
        let isNewUser = false;

        const hashedPassword = await bcrypt.hash(employeeId, 12);

        if (user) {
            console.log(`[Provision] User exists (${user._id}), UPDATING password to Employee ID`);
            user.password = hashedPassword;
            // Ensure organization membership is added if not present
            const hasMembership = user.memberships.some(
                (m: any) => m.organizationId?.toString() === organizationId
            );
            if (!hasMembership) {
                user.memberships.push({ organizationId, role: "member" });
            }
            await user.save();
            userId = user._id.toString();
        } else {
            console.log(`[Provision] Creating new user for: ${email}`);
            const newUser = await User.create({
                email,
                password: hashedPassword,
                fullName,
                name: fullName,
                role: "user",
                memberships: [{ organizationId, role: "member" }]
            });
            userId = newUser._id.toString();
            isNewUser = true;
        }

        // 4. Send Invite Email
        try {
            await mailService.sendEmployeeInviteEmail(
                email,
                orgName,
                fullName,
                clockLink,
                isNewUser,
                employeeId
            );
        } catch (mailErr) {
            console.error("[Provision] mailService error:", mailErr);
        }

        return NextResponse.json({ userId });

    } catch (error: any) {
        console.error("[Provision] Error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
