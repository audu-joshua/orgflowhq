"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Loader2 } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"

export function OnboardingForm() {
    const router = useRouter()
    const { refreshProfile, user: authUser } = useAuth()
    const [organizationName, setOrganizationName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            // Get session
            const { getSupabaseClient } = await import("@/lib/supabaseClient")
            const supabase = getSupabaseClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                // Should not happen if protected properly
                throw new Error("No active session found")
            }

            // Provision Organization
            const response = await fetch("/api/auth/register-org", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    organizationName,
                    fullName: authUser?.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create organization")
            }

            const provisionData = await response.json()

            // Update Store
            const store = useAppStore.getState()
            store.setOrganization({
                id: provisionData.organizationId,
                slug: provisionData.slug,
                name: organizationName
            })

            if (store.user) {
                store.setUser({
                    ...store.user,
                    organization_id: provisionData.organizationId,
                    role: "owner",
                })
            }

            // Force profile sync
            await refreshProfile(session.user.id, provisionData.organizationId)

            // Redirect to dashboard
            router.push("/dashboard")

        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Complete your Profile</h2>
                <p className="text-muted-foreground mt-2">Almost there! Just name your organization to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
                        Organization Name
                    </label>
                    <input
                        id="organization"
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all"
                        placeholder="e.g. Acme Corp"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive rounded-xl text-destructive text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold text-lg cursor-pointer flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Setup"}
                </button>
            </form>
        </div>
    )
}
