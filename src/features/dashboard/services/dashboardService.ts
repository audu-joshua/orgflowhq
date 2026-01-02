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

    // Map the returned count to application_count property
    return (data || []).map((role: any) => ({
      ...role,
      application_count: role.applications?.[0]?.count || 0
    }))
  },

  async getApplicationStats(organizationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("applications")
      .select("status")
      .eq("organization_id", organizationId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      new: data?.filter((a: any) => a.status === "new").length || 0,
      shortlisted: data?.filter((a: any) => a.status === "shortlisted").length || 0,
      interviewed: data?.filter((a: any) => a.status === "interviewed").length || 0,
      hired: data?.filter((a: any) => a.status === "hired").length || 0,
    }

    return stats
  },

  async getApplicationsOverTime(organizationId: string) {
    const supabase = getSupabaseClient()

    // Get applications from the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1) // Start from beginning of month ensures clean comparison
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // Fetch critical fields: date and status
    const { data, error } = await supabase
      .from("applications")
      .select("created_at, status")
      .eq("organization_id", organizationId)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (error) throw error

    // Generate last 6 months keys
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(d.toLocaleString('default', { month: 'short' }));
    }

    // Initialize accumulators
    const groupedData = last6Months.reduce((acc: any, month) => {
      acc[month] = { applications: 0, hired: 0 };
      return acc;
    }, {});

    // Populate data
    (data || []).forEach((app: any) => {
      const month = new Date(app.created_at).toLocaleString('default', { month: 'short' });
      // Only count if it falls within our generated month buckets (safety check)
      if (groupedData[month]) {
        groupedData[month].applications += 1;
        if (app.status === 'hired') {
          groupedData[month].hired += 1;
        }
      }
    });

    return last6Months.map(month => ({
      name: month,
      applications: groupedData[month].applications,
      hired: groupedData[month].hired
    }));
  }
}
