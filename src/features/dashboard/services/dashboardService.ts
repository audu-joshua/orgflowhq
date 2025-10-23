import { getSupabaseClient } from "@/lib/supabaseClient"

export const dashboardService = {
  async getRoles(organizationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .select("*, applications(count)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getApplicationStats(organizationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("applications").select("status").eq("organization_id", organizationId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      new: data?.filter((a) => a.status === "new").length || 0,
      shortlisted: data?.filter((a) => a.status === "shortlisted").length || 0,
      interviewed: data?.filter((a) => a.status === "interviewed").length || 0,
      hired: data?.filter((a) => a.status === "hired").length || 0,
    }

    return stats
  },
}
