import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Employee } from "@/models/Business";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        const userEmail = session.user?.email;
        if (!userEmail) {
            return NextResponse.json({ error: "User email not found in session" }, { status: 400 });
        }

        console.log(`[Activation] Attempting activation for ${userEmail}...`);

        await connectToDatabase();

        // 2. Perform Atomic Update
        const employee = await Employee.findOneAndUpdate(
            {
                email: userEmail.trim().toLowerCase(),
                status: "invited"
            },
            {
                $set: {
                    status: "active",
                    userId: (session.user as any).id,
                    activatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!employee) {
            console.warn(`[Activation] No invited employee found for ${userEmail}`);
            // If they are already active, just return success
            const existingActive = await Employee.findOne({ email: userEmail.toLowerCase(), status: "active" });
            if (existingActive) return NextResponse.json({ success: true, employee: existingActive });

            return NextResponse.json({ error: "No pending invitation found for this account" }, { status: 400 });
        }

        console.log(`[Activation] Success for ${userEmail}`);
        return NextResponse.json({ success: true, employee: employee.toObject() });

    } catch (error: any) {
        console.error("[Activation] Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
