"use server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

/**
 * Helper to enforce Super Admin Access
 * This function must be called at the start of EVERY admin action.
 */
async function requireSuperAdmin() {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabase = await createSupabaseServerClient()
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) {
            console.error("SuperAdmin Auth Error:", authError)
            throw new Error(`Auth check failed: ${authError.message}`)
        }
        if (!user) throw new Error("Unauthorized")

        const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single()

        if (error || userData?.role !== 'super_admin') {
            throw new Error("Forbidden: Super Admin Access Required")
        }

        return user
    } catch (e: any) {
        console.error("requireSuperAdmin Catch-all Error:", e)
        if (e.message?.includes('fetch failed')) {
            console.error("Fetch failure detected. This might be a networking issue or malformed SUPABASE_URL.")
        }
        throw e
    }
}

export async function getSystemStats() {
    await requireSuperAdmin()
    const adminClient = getSupabaseAdmin()

    // Execute queries in parallel for performance
    const [
        { count: tenantCount },
        { count: userCount },
        { count: activeCount }
    ] = await Promise.all([
        adminClient.from("organizations").select("*", { count: 'exact', head: true }),
        adminClient.from("users").select("*", { count: 'exact', head: true }).neq("role", "super_admin"),
        adminClient.from("roles").select("*", { count: 'exact', head: true })
    ])

    return {
        tenants: tenantCount || 0,
        users: userCount || 0,
        activeTenants: activeCount || 0,
        revenue: (tenantCount || 0) * 15000 // Mock revenue for the gauge
    }
}

export async function getLatestOrganizations(limit = 5) {
    await requireSuperAdmin()
    const adminClient = getSupabaseAdmin()

    const { data, error } = await adminClient
        .from("organizations")
        .select(`
            *,
            users_organizations!users_organizations_organization_id_fkey (count),
            employees!employees_organization_id_fkey (count)
        `)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

export async function getAllTenants(page = 1, pageSize = 20) {
    await requireSuperAdmin()
    const adminClient = getSupabaseAdmin()

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, count, error } = await adminClient
        .from("organizations")
        .select(`
            *,
            users_organizations!users_organizations_organization_id_fkey (count),
            employees!employees_organization_id_fkey (count)
        `, { count: 'exact' })
        .range(from, to)
        .order("created_at", { ascending: false })

    if (error) throw error
    return { data, count }
}

export async function getAllUsers(page = 1, pageSize = 20, search?: string) {
    await requireSuperAdmin()
    const adminClient = getSupabaseAdmin()

    let query = adminClient
        .from("users")
        .select("*", { count: 'exact' })

    if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    query = query.neq("role", "super_admin")

    const { data, count, error } = await query
        .range((page - 1) * pageSize, (page - 1) * pageSize + pageSize - 1)
        .order("created_at", { ascending: false })

    if (error) throw error
    return { data, count }
}
