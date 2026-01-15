"use server"

import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { revalidatePath } from "next/cache"

export async function disconnectGoogleAction() {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("Unauthorized")

        const { error } = await supabase
            .from("user_integrations")
            .delete()
            .eq("user_id", user.id)
            .eq("provider", "google")

        if (error) throw error

        revalidatePath("/dashboard/settings")
        revalidatePath("/dashboard/interviews")

        return { success: true }
    } catch (error) {
        console.error("Failed to disconnect Google:", error)
        return { success: false, error: "Failed to disconnect." }
    }
}
