import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { roleService } from "@/features/roles/services/roleService"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { organizationId, status } = await request.json()

        if (!organizationId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        await roleService.updateAllRolesStatus(organizationId, status)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Bulk status update failed:", error)
        return NextResponse.json({ error: "Failed to update roles" }, { status: 500 })
    }
}
