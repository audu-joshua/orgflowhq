import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { dashboardService } from "@/features/dashboard/services/dashboardService"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const organizationId = searchParams.get("organizationId")

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
        }

        const roles = await dashboardService.getRoles(organizationId)
        return NextResponse.json(roles)
    } catch (error) {
        console.error("Failed to fetch roles:", error)
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
    }
}
