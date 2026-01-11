import { getSupabaseClient } from "@/lib/supabaseClient"

export type ActivityEntityType = 'application' | 'interview' | 'role'

export const activityLogger = {
    async logActivity(
        organizationId: string,
        entityType: ActivityEntityType,
        entityId: string,
        action: string,
        description?: string,
        performedBy?: string // Optional, null means system
    ) {
        const supabase = getSupabaseClient()

        try {
            const { error } = await supabase.from('activity_logs').insert([{
                organization_id: organizationId,
                entity_type: entityType,
                entity_id: entityId,
                action,
                description,
                performed_by: performedBy || null
            }])

            if (error) {
                console.error("Error logging activity:", error)
            }
        } catch (e) {
            console.error("Exception logging activity:", e)
        }
    }
}
