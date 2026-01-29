import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { JobRole } from "@/models/Business";

export async function GET() {
    try {
        await connectToDatabase();

        const roles = await JobRole.find({ status: "active" })
            .populate("organizationId", "name logoUrl")
            .sort({ createdAt: -1 });

        // Map to UI compat structure
        const mappedRoles = roles.map((role: any) => {
            const obj = role.toObject();
            return {
                ...obj,
                id: obj._id.toString(),
                organization_id: obj.organizationId?._id?.toString() || obj.organizationId?.toString(),
                organizations: obj.organizationId ? {
                    name: obj.organizationId.name,
                    logo_url: obj.organizationId.logoUrl
                } : null,
                role_images: (obj.images || []).map((img: any) => ({
                    id: img._id?.toString(),
                    image_url: img.imageUrl,
                    display_order: img.displayOrder
                }))
            };
        });

        return NextResponse.json(mappedRoles);
    } catch (error: any) {
        console.error("[API Roles] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
