"use server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

/**
 * Helper to enforce Super Admin Access
 * This function must be called at the start of EVERY admin action.
 */
async function requireSuperAdmin() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check strict database role
    const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

    if (error || userData?.role !== 'super_admin') {
        throw new Error("Forbidden: Super Admin Access Required")
    }

    return user
}

export async function getSystemStats() {
    await requireSuperAdmin()
    const adminClient = getSupabaseAdmin()

    // Execute queries in parallel for performance
    const [
        { count: tenantCount },
        { count: userCount },
        { count: jobCount }
    ] = await Promise.all([
        adminClient.from("organizations").select("*", { count: 'exact', head: true }),
        adminClient.from("users").select("*", { count: 'exact', head: true }),
        adminClient.from("campaigns").select("*", { count: 'exact', head: true }) // Assuming 'campaigns' table stores jobs? Need to verify.
    ])

    return {
        tenants: tenantCount || 0,
        users: userCount || 0,
        jobs: jobCount || 0
    }
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
            users_organizations!users_organizations_organization_id_fkey (count)
        `, { count: 'exact' }) // Rough employee count via links
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

    const { data, count, error } = await query
        .range((page - 1) * pageSize, (page - 1) * pageSize + pageSize - 1)
        .order("created_at", { ascending: false })

    if (error) throw error
    return { data, count }
}
