import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createClient } from "@supabase/supabase-js"
import { slugify } from "@/lib/utils"
import { mailService } from "@/lib/mail/mailService"

export async function POST(req: Request) {
    try {
        const { organizationName, fullName } = await req.json()

        if (!organizationName) {
            return NextResponse.json({ error: "Missing organization name" }, { status: 400 })
        }

        // 1. Verify User Session (Security)
        const authHeader = req.headers.get("Authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()

        // 2. Provisioning Transactional Logic
        console.log(`[Provision-Org] Starting setup for ${organizationName} by ${user.email}`)

        // A. Generate Slug
        let slug = slugify(organizationName)
        const { data: existingOrgs } = await supabaseAdmin
            .from("organizations")
            .select("slug")
            .ilike("slug", `${slug}%`)

        if (existingOrgs && existingOrgs.length > 0) {
            const slugs = existingOrgs.map((o: any) => o.slug)
            if (slugs.includes(slug)) {
                let counter = 1
                while (slugs.includes(`${slug}-${counter}`)) {
                    counter++
                }
                slug = `${slug}-${counter}`
            }
        }

        // B. Create Organization
        const { data: orgData, error: orgError } = await supabaseAdmin
            .from("organizations")
            .insert([{ name: organizationName, slug: slug }])
            .select()
            .single()

        if (orgError) throw orgError

        // C. Create "Management" Department
        const { data: deptData, error: deptError } = await supabaseAdmin
            .from("departments")
            .insert([{
                organization_id: orgData.id,
                name: "Management",
                description: "Executive and Administrative management team"
            }])
            .select()
            .single()

        if (deptError) throw deptError

        // D. Create or update User Profile
        const { error: userError } = await supabaseAdmin
            .from("users")
            .upsert({
                id: user.id,
                email: user.email,
                organization_id: orgData.id
            })
            .eq("id", user.id)

        if (userError) throw userError

        // E. Link User as Owner
        const { error: linkError } = await supabaseAdmin
            .from("users_organizations")
            .insert([{
                user_id: user.id,
                organization_id: orgData.id,
                role: "owner"
            }])

        if (linkError) throw linkError

        // F. Create Employee Record for Owner
        const { error: empError } = await supabaseAdmin
            .from("employees")
            .insert([{
                organization_id: orgData.id,
                user_id: user.id,
                department_id: deptData.id,
                full_name: fullName || user.user_metadata?.full_name || "Owner",
                email: user.email,
                employee_id: "OWN-001",
                position: "Owner",
                status: "active",
                hire_date: new Date().toISOString().split('T')[0]
            }])

        if (empError) throw empError

        // 3. Send Welcome Email
        try {
            await mailService.sendOrgWelcomeEmail(
                user.email!,
                organizationName,
                fullName || user.user_metadata?.full_name || "Owner"
            )
        } catch (mailErr) {
            console.error("[Provision-Org] Mail failed:", mailErr)
            // We don't fail the whole registration if mail fails
        }

        return NextResponse.json({
            success: true,
            organizationId: orgData.id,
            slug: orgData.slug
        })

    } catch (error: any) {
        console.error("[Provision-Org] Unexpected error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
