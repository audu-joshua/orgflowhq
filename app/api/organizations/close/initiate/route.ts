import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"
import { mailService } from "@/lib/mail/mailService"
import { randomInt } from "crypto"

export async function POST(req: Request) {
    try {
        const { organizationId } = await req.json()

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
        }

        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        )
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth error:", authError)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()

        // Verify user is owner of the organization
        const { data: userOrg, error: permError } = await supabaseAdmin
            .from("users_organizations")
            .select("role")
            .eq("user_id", user.id)
            .eq("organization_id", organizationId)
            .single()

        if (permError || userOrg.role !== 'owner') {
            return NextResponse.json({ error: "Only owners can close an organization" }, { status: 403 })
        }

        // Generate 6-digit PIN
        const pin = randomInt(100000, 999999).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins

        // Store PIN in DB
        const { error: updateError } = await supabaseAdmin
            .from("organizations")
            .update({
                delete_confirmation_code: pin,
                delete_confirmation_expires_at: expiresAt
            })
            .eq("id", organizationId)

        if (updateError) {
            console.error("Failed to store delete PIN:", updateError)
            return NextResponse.json({ error: "Failed to initiate deletion" }, { status: 500 })
        }

        // Send Email
        await mailService.sendOrgDeletionPin(user.email!, pin)

        return NextResponse.json({ success: true, message: "Confirmation PIN sent to your email" })

    } catch (error: any) {
        console.error("Delete initiation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
