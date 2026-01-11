import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Application } from "../types"

export const applicationService = {
  async createApplication(
    organizationId: string,
    applicationData: Omit<Application, "id" | "created_at" | "updated_at" | "organization_id">,
  ) {
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("applications")
      .insert([{
        ...applicationData,
        organization_id: organizationId,
        status: "new",
        current_stage: "New"
      }])

    if (error) throw error
    return true
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

  async getApplicationById(applicationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("applications")
      .select("*, roles(title)")
      .eq("id", applicationId)
      .single()

    if (error) throw error
    return data as Application & { roles?: { title: string } }
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

  async updateApplicationStage(applicationId: string, stage: string) {
    const supabase = getSupabaseClient()

    // We keep status in sync for now for backward compatibility, 
    // but logic should rely on stage.
    // Map stage to rough status if possible, or just keep status as is.
    let status = "new"
    const lowerStage = stage.toLowerCase()
    if (lowerStage.includes("shortlist")) status = "shortlisted"
    else if (lowerStage.includes("interview")) status = "interviewed"
    else if (lowerStage.includes("hire") || lowerStage.includes("offer")) status = "hired"

    const { data, error } = await supabase
      .from("applications")
      .update({
        current_stage: stage,
        status,
        updated_at: new Date().toISOString()
      })
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

  async uploadResume(folder: string, file: File) {
    const supabase = getSupabaseClient()
    const fileName = `${folder}/${Date.now()}-${file.name}`

    // Ensure the 'applications' bucket is created in Supabase Storage with public access
    const { data, error: uploadError } = await supabase.storage.from("applications").upload(fileName, file)

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      throw uploadError
    }

    const { data: urlData } = supabase.storage.from("applications").getPublicUrl(fileName)

    return urlData.publicUrl
  },
}
