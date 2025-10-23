import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Role } from "../types"

export const roleService = {
  async createRole(organizationId: string, roleData: Omit<Role, "id" | "created_at" | "updated_at">) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .insert([{ ...roleData, organization_id: organizationId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateRole(roleId: string, roleData: Partial<Role>) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.from("roles").update(roleData).eq("id", roleId).select().single()

    if (error) throw error
    return data
  },

  async deleteRole(roleId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("roles").delete().eq("id", roleId)

    if (error) throw error
  },

  async getRoleById(roleId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .select("*, role_images(*), applications(count)")
      .eq("id", roleId)
      .single()

    if (error) throw error
    return data
  },

  async uploadRoleImage(roleId: string, file: File) {
    const supabase = getSupabaseClient()
    const fileName = `${roleId}/${Date.now()}-${file.name}`

    const { data, error: uploadError } = await supabase.storage.from("role_images").upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("role_images").getPublicUrl(fileName)

    const { data: imageData, error: dbError } = await supabase
      .from("role_images")
      .insert([{ role_id: roleId, image_url: urlData.publicUrl }])
      .select()
      .single()

    if (dbError) throw dbError
    return imageData
  },

  async deleteRoleImage(imageId: string, imageUrl: string) {
    const supabase = getSupabaseClient()

    // Extract file path from URL
    const filePath = imageUrl.split("/").slice(-2).join("/")

    const { error: storageError } = await supabase.storage.from("role_images").remove([filePath])

    if (storageError) throw storageError

    const { error: dbError } = await supabase.from("role_images").delete().eq("id", imageId)

    if (dbError) throw dbError
  },
}
