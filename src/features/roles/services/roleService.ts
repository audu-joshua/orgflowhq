import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Role } from "../types"

// Type for role with additional computed fields
export interface RoleWithImages extends Role {
  role_images: Array<{
    id: string
    role_id: string
    image_url: string
    display_order: number
    created_at: string
  }>
  organizations?: {
    name: string
    logo_url: string | null
  }
  applications?: Array<{ count: number }>
  application_count?: number
}

export const roleService = {
  async createRole(organizationId: string, roleData: Omit<Role, "id" | "created_at" | "updated_at" | "slug">) {
    const supabase = getSupabaseClient()

    // Fetch organization name to include in slug
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single()

    const orgName = org?.name || "job"

    // Generate slug from organization name and title
    const slug = `${orgName}-${roleData.title}`
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters except hyphens
      .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, '')   // Trim hyphens
      .trim();

    const { data, error } = await supabase
      .from("roles")
      .insert([{ ...roleData, organization_id: organizationId, slug }])
      .select()
      .single()

    if (error) {
      console.error("Error creating role:", error)
      throw error
    }
    return data as Role
  },

  async updateRole(roleId: string, roleData: Partial<Role>) {
    const supabase = getSupabaseClient()

    const updates: Partial<Role> = { ...roleData }

    // If title is updated, regenerate slug
    if (roleData.title) {
      // Fetch role to get organization_id
      const { data: existingRole } = await supabase
        .from("roles")
        .select("organization_id")
        .eq("id", roleId)
        .single()

      if (existingRole) {
        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", existingRole.organization_id)
          .single()

        const orgName = org?.name || "job"

        updates.slug = `${orgName}-${roleData.title}`
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .trim();
      }
    }

    const { data, error } = await supabase
      .from("roles")
      .update(updates)
      .eq("id", roleId)
      .select()
      .single()

    if (error) {
      console.error("Error updating role:", error)
      throw error
    }
    return data as Role
  },

  async updateRoleStatus(roleId: string, status: Role["status"]) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .update({ status })
      .eq("id", roleId)
      .select()
      .single()

    if (error) {
      console.error("Error updating role status:", error)
      throw error
    }
    return data as Role
  },

  async updateAllRolesStatus(organizationId: string, status: Role["status"]) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .update({ status })
      .eq("organization_id", organizationId)
      .select()

    if (error) {
      console.error("Error updating all roles status:", error)
      throw error
    }
    return data as Role[]
  },

  async deleteRole(roleId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("roles")
      .delete()
      .eq("id", roleId)

    if (error) {
      console.error("Error deleting role:", error)
      throw error
    }
  },

  async getRoleById(roleId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .select(`
        *,
        role_images(*),
        applications(count)
      `)
      .eq("id", roleId)
      .single()

    if (error) {
      console.error("Error fetching role:", error)
      throw error
    }
    return data as RoleWithImages
  },

  async uploadRoleImage(roleId: string, file: File, displayOrder: number = 0) {
    const supabase = getSupabaseClient()

    // Generate unique filename with proper extension
    const fileExt = file.name.split('.').pop()
    const fileName = `${roleId}/${Date.now()}_${displayOrder}.${fileExt}`

    console.log(`Uploading image: ${fileName}`)

    // Upload to Supabase Storage (bucket name: role-images with hyphen)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("role-images")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError)
      throw uploadError
    }

    console.log("Upload successful:", uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("role-images")
      .getPublicUrl(fileName)

    console.log("Public URL:", publicUrl)

    // Save to role_images table
    const { data: imageData, error: dbError } = await supabase
      .from("role_images")
      .insert([{
        role_id: roleId,
        image_url: publicUrl,
        display_order: displayOrder
      }])
      .select()
      .single()

    if (dbError) {
      console.error("Error saving to database:", dbError)
      throw dbError
    }

    console.log("Image saved to database:", imageData)
    return imageData
  },

  async deleteRoleImage(imageId: string, imageUrl: string) {
    const supabase = getSupabaseClient()

    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/role-images/[roleId]/[filename]
    const urlParts = imageUrl.split("/role-images/")
    const filePath = urlParts.length > 1 ? urlParts[1] : null

    if (!filePath) {
      console.error("Invalid image URL format:", imageUrl)
      throw new Error("Invalid image URL format")
    }

    console.log("Deleting file:", filePath)

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("role-images")
      .remove([filePath])

    if (storageError) {
      console.error("Error deleting from storage:", storageError)
      throw storageError
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("role_images")
      .delete()
      .eq("id", imageId)

    if (dbError) {
      console.error("Error deleting from database:", dbError)
      throw dbError
    }

    console.log("Image deleted successfully")
  },

  async getRolesByOrganization(organizationId: string): Promise<RoleWithImages[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .select(`
        *,
        role_images(*),
        applications(count)
      `)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching roles:", error)
      throw error
    }

    // Transform the data to include application_count
    return (data as RoleWithImages[]).map((role) => ({
      ...role,
      application_count: role.applications?.[0]?.count || 0
    }))
  },

  async getRoleBySlug(slug: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("roles")
      .select(`
        *,
        role_images(*),
        applications(count)
      `)
      .eq("slug", slug)
      .single()

    if (error) {
      console.error("Error fetching role by slug:", error)
      throw error
    }
    return data as RoleWithImages
  },

  async getAllOpenRoles(): Promise<RoleWithImages[]> {
    try {
      const response = await fetch("/api/public/roles")
      if (!response.ok) {
        throw new Error("Failed to fetch roles from API")
      }
      return await response.json()
    } catch (error) {
      console.error("Error in getAllOpenRoles:", error)
      throw error
    }
  },
}
