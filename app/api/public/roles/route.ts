import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
    try {
        const supabaseAdmin = getSupabaseAdmin()

        const { data, error } = await supabaseAdmin
            .from("roles")
            .select(`
        *,
        role_images(*),
        organizations(name, logo_url)
      `)
            .eq("status", "active")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("[API Roles] Database error:", error)
            return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("[API Roles] Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
