import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Organization, User } from "@/models/User";
import { Department, Employee } from "@/models/Business";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import mongoose from "mongoose";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { organizationName, fullName } = await req.json();

        if (!organizationName) {
            return NextResponse.json({ error: "Missing organization name" }, { status: 400 });
        }

        // 1. Verify User Session (Security)
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userEmail = session.user.email;
        const dbUser = await User.findOne({ email: userEmail });

        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // 2. Provisioning Transactional Logic
        console.log(`[Provision-Org] Starting atomic setup for ${organizationName} by ${userEmail}`);

        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            // A. Generate Slug
            let slug = slugify(organizationName);
            let finalSlug = slug;
            let counter = 1;

            // Check for slug uniqueness
            while (await Organization.findOne({ slug: finalSlug }).session(mongoSession)) {
                if (counter > 5) {
                    throw new Error("Could not generate a unique slug for your organization. Please try a different name.");
                }
                finalSlug = `${slug}-${counter}`;
                counter++;
            }

            // B. Create Organization
            const [newOrg] = await Organization.create(
                [{ name: organizationName, slug: finalSlug }],
                { session: mongoSession }
            );

            // C. Create "Management" Department
            const [managementDept] = await Department.create(
                [
                    {
                        organizationId: newOrg._id,
                        name: "Management",
                        description: "Executive and Administrative management team",
                    },
                ],
                { session: mongoSession }
            );

            // D. Update User Membership
            dbUser.memberships.push({
                organizationId: newOrg._id,
                role: "owner",
            });
            await dbUser.save({ session: mongoSession });

            // E. Create Employee Record for Owner
            await Employee.create(
                [
                    {
                        organizationId: newOrg._id,
                        userId: dbUser._id,
                        departmentId: managementDept._id,
                        fullName: fullName || dbUser.fullName || "Owner",
                        email: userEmail,
                        employeeId: "OWN-001",
                        position: "Owner",
                        status: "active",
                        hireDate: new Date(),
                    },
                ],
                { session: mongoSession }
            );

            await mongoSession.commitTransaction();
            console.log(`[Provision-Org] Successfully provisioned ${organizationName}`);

            // F. Send Welcome Email (Post-Transaction)
            try {
                const { mailService } = await import("@/lib/mail/mailService");
                await mailService.sendOrgWelcomeEmail(
                    userEmail,
                    organizationName,
                    fullName || dbUser.fullName || "Owner"
                );
            } catch (mailErr) {
                console.error("🚨 [Provision-Org] Mail FAILED:", mailErr);
            }

            return NextResponse.json({
                success: true,
                organizationId: newOrg._id,
                slug: finalSlug,
            });

        } catch (transactionError: any) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }

    } catch (error: any) {
        console.error("[Provision-Org] Final catch error:", error);
        let errorMessage = error.message || "Internal Server Error";

        // Map errors to friendly messages
        if (errorMessage.includes("duplicate key error")) {
            if (errorMessage.includes("slug")) {
                errorMessage = "This organization name is already taken. Please try a different name.";
            } else if (errorMessage.includes("email")) {
                errorMessage = "An account with this email already exists.";
            }
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
