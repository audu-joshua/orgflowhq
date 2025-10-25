import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Application } from "../types"

export const applicationService = {
  async createApplication(
    organizationId: string,
    applicationData: Omit<Application, "id" | "created_at" | "updated_at">,
  ) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("applications")
      .insert([{ ...applicationData, organization_id: organizationId, status: "new" }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getApplicationsByRole(roleId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("role_id", roleId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getApplicationsByOrganization(organizationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("applications")
      .select("*, roles(title)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateApplicationStatus(applicationId: string, status: Application["status"]) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteApplication(applicationId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("applications").delete().eq("id", applicationId)

    if (error) throw error
  },

  async uploadResume(applicationId: string, file: File) {
    const supabase = getSupabaseClient()
    const fileName = `${applicationId}/${Date.now()}-${file.name}`

    const { data, error: uploadError } = await supabase.storage.from("attachments").upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(fileName)

    return urlData.publicUrl
  },
}
