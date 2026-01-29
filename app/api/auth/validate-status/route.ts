import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Employee } from "@/models/Business";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check employees table
        const employee = await Employee.findOne({
            email: email.trim().toLowerCase()
        });

        if (employee && (employee.status === 'inactive' || employee.status === 'terminated')) {
            return NextResponse.json({
                allowed: false,
                error: "You have been Deactivated; Contact Your Hr"
            });
        }

        return NextResponse.json({ allowed: true });

    } catch (error: any) {
        console.error("[ValidateStatus] Unexpected error:", error);
        return NextResponse.json({ allowed: true }); // Fail open
    }
}
