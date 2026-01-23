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

        // 2. Provisioning Transactional Logic (Using RPC for Atomicity)
        console.log(`[Provision-Org] Starting atomic setup for ${organizationName} by ${user.email}`)

        // A. Generate Slug
        let slug = slugify(organizationName)
        console.log(`[Provision-Org] Generated initial slug: ${slug}`)

        // B. Call the Atomic Provisioning Function
        const { data: result, error: rpcError } = await supabaseAdmin.rpc("provision_organization", {
            p_user_id: user.id,
            p_user_email: user.email,
            p_org_name: organizationName,
            p_org_slug: slug,
            p_full_name: fullName || user.user_metadata?.full_name || "Owner"
        })

        if (rpcError) {
            console.error("[Provision-Org] RPC Error:", rpcError)

            // Handle Slug Conflict explicitly if the RPC didn't catch it or for retry logic
            if (rpcError.message?.includes("organizations_slug_key")) {
                let counter = 1
                let finalResult = null

                // Retry with incremented slugs (limit to 5 attempts for safety)
                while (counter <= 5) {
                    const nextSlug = `${slug}-${counter}`
                    console.log(`[Provision-Org] Retrying with slug: ${nextSlug}`)

                    const { data: retryData, error: retryError } = await supabaseAdmin.rpc("provision_organization", {
                        p_user_id: user.id,
                        p_user_email: user.email,
                        p_org_name: organizationName,
                        p_org_slug: nextSlug,
                        p_full_name: fullName || user.user_metadata?.full_name || "Owner"
                    })

                    if (!retryError) {
                        finalResult = retryData
                        break
                    }

                    if (!retryError.message?.includes("organizations_slug_key")) {
                        throw retryError
                    }
                    counter++
                }

                if (!finalResult) throw new Error("Could not generate a unique slug for your organization. Please try a different name.")
                return handleSuccess(finalResult, user, organizationName, fullName)
            }

            throw rpcError
        }

        if (!result.success) {
            console.error("[Provision-Org] RPC Logic Error:", result.error)
            throw new Error(result.error || "Provisioning failed")
        }

        return handleSuccess(result, user, organizationName, fullName)

    } catch (error: any) {
        console.error("[Provision-Org] Final catch error:", error)

        // Map technical database errors to friendly messages
        let errorMessage = error.message || "Internal Server Error"

        if (errorMessage.includes("employees_employee_id_key")) {
            errorMessage = "This account is already registered as an employee. Please attempt to sign in."
        } else if (errorMessage.includes("organizations_slug_key")) {
            errorMessage = "This organization name is already taken. Please try a different name."
        } else if (errorMessage.includes("employees_email_key")) {
            errorMessage = "An employee with this email already exists."
        } else if (errorMessage.includes("users_pkey")) {
            errorMessage = "User account already exists."
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

async function handleSuccess(result: any, user: any, organizationName: string, fullName: string) {
    const supabaseAdmin = getSupabaseAdmin()

    // G. Sync Organization ID to Auth Metadata (Critical for Middleware)
    console.log("[Provision-Org] Updating auth metadata...")
    const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: { organization_id: result.organization_id } }
    )

    if (metaError) {
        console.error("[Provision-Org] Failed to sync auth metadata:", metaError)
    }

    try {
        const { mailService } = await import("@/lib/mail/mailService")
        await mailService.sendOrgWelcomeEmail(
            user.email!,
            organizationName,
            fullName || user.user_metadata?.full_name || "Owner"
        )
        console.log("[Provision-Org] Welcome email sent.")
    } catch (mailErr: any) {
        console.error("🚨 [Provision-Org] Mail FAILED:", mailErr.message || mailErr)
    }

    return NextResponse.json({
        success: true,
        organizationId: result.organization_id,
        slug: result.slug
    })
}
