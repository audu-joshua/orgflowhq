import { NextRequest, NextResponse } from "next/server"
import { roleService } from "@/features/roles/services/roleService"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const role = await roleService.getRoleById(id)
        return NextResponse.json(role)
    } catch (error) {
        console.error("Failed to fetch role:", error)
        return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 })
    }
}
