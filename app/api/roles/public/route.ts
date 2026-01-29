import { NextResponse } from "next/server"
import { roleService } from "@/features/roles/services/roleService"

export async function GET() {
    try {
        const roles = await roleService.getAllOpenRoles()
        return NextResponse.json(roles)
    } catch (error) {
        console.error("Failed to fetch public roles:", error)
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
    }
}
