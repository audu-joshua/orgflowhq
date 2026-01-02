import { getSupabaseClient } from "@/lib/supabaseClient"
import { slugify } from "@/lib/utils"
import type { Organization } from "../types"

export const organizationService = {
    async getOrganizationBySlug(slug: string) {
        const supabase = getSupabaseClient()
        // Use maybeSingle to avoid 406 error if not found
        const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("slug", slug)
            .maybeSingle()

        if (error) throw error
        if (!data) throw new Error("Organization not found")

        return data as Organization
    },

    async getOrganizationById(id: string) {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", id)
            .maybeSingle()

        if (error) throw error
        if (!data) throw new Error("Organization not found")

        return data as Organization
    },

    async updateOrganization(id: string, updates: Partial<Organization>) {
        const supabase = getSupabaseClient()

        let finalUpdates = { ...updates }

        // If name changes, update slug too (user's request)
        if (updates.name) {
            let slug = slugify(updates.name)

            // Check for potential collisions
            const { data: existingOrgs } = await supabase
                .from("organizations")
                .select("id, slug")
                .ilike("slug", `${slug}%`)
                .neq("id", id)

            if (existingOrgs && existingOrgs.length > 0) {
                const slugs = existingOrgs.map((o: { slug: string }) => o.slug)
                if (slugs.includes(slug)) {
                    let counter = 1
                    while (slugs.includes(`${slug}-${counter}`)) {
                        counter++
                    }
                    slug = `${slug}-${counter}`
                }
            }
            finalUpdates.slug = slug
        }

        const { data, error } = await supabase
            .from("organizations")
            .update(finalUpdates)
            .eq("id", id)
            .select()
            .maybeSingle()

        if (error) throw error
        return data as Organization
    }
}
