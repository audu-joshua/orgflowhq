import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Organization } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || id === "undefined") {
            return NextResponse.json({ error: "Invalid Organization ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions) as any;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const { name, address, logoUrl, website, description, contactEmail } = await req.json();

        // 1. Verify User has access to this organization
        const isMember = session.user.memberships.some(
            (m: any) => m.organizationId === id && ["owner", "admin"].includes(m.role)
        );

        if (!isMember && session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Forbidden: You don't have permission to update this organization" }, { status: 403 });
        }

        // 2. Update Organization
        const updatedOrg = await Organization.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(name && { name }),
                    ...(address !== undefined && { address }),
                    ...(logoUrl && { logoUrl }),
                    ...(website !== undefined && { website }),
                    ...(description !== undefined && { description }),
                    ...(contactEmail !== undefined && { contactEmail }),
                }
            },
            { new: true }
        ).lean();

        if (!updatedOrg) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        return NextResponse.json(updatedOrg);

    } catch (error: any) {
        console.error("[Organization Update] error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
