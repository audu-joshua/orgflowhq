import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const supabaseAdmin = getSupabaseAdmin()

        // Check employees table via Admin client (bypasses RLS safety)
        const { data: employee, error } = await supabaseAdmin
            .from("employees")
            .select("status")
            .eq("email", email.trim().toLowerCase())
            .maybeSingle()

        if (error) {
            console.error("[ValidateStatus] DB Error:", error)
            return NextResponse.json({ allowed: true }) // Fail open to avoid blocking valid auth
        }

        if (employee && (employee.status === 'inactive' || employee.status === 'terminated')) {
            return NextResponse.json({
                allowed: false,
                error: "You have been Deactivated; Contact Your Hr"
            })
        }

        return NextResponse.json({ allowed: true })

    } catch (error: any) {
        console.error("[ValidateStatus] Unexpected error:", error)
        return NextResponse.json({ allowed: true }) // Fail open
    }
}
