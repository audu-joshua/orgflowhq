"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { LoadingSpinner } from "../shared/LoadingSpinner"
import { navItems } from "@/config/navigation"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, organization, isInitialized } = useAppStore()

    useEffect(() => {
        if (!isInitialized) return

        const checkAuth = async () => {
            if (!user) {
                router.push("/login")
                return
            }

            // check if user is terminated
            if (user.status === 'terminated') {
                console.warn(`Terminated user ${user.email} attempted access.`)
                // Sign out immediately
                const { getSupabaseClient } = await import("@/lib/supabaseClient")
                const supabase = getSupabaseClient()
                await supabase.auth.signOut()
                router.push("/login?error=terminated")
                return
            }

            // check if user needs activation
            if (user.status === 'invited') {
                try {
                    console.log("Triggering first-login activation...")
                    const { data: { session } } = await (await import("@/lib/supabaseClient")).getSupabaseClient().auth.getSession()
                    if (session) {
                        await fetch("/api/auth/activate", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${session.access_token}`
                            }
                        })
                        // Update local state is handled by the page reload or next profile fetch
                        // For now we just let it happen in background
                    }
                } catch (err) {
                    console.error("Activation trigger failed:", err)
                }
            }

            // check if user is a super_admin and needs to select a portal
            // We redirect to /select-portal if they are hitting /dashboard directly
            // and haven't explicitly chosen the organization view via query param
            const isChoosingOrg = pathname === '/dashboard' && new URLSearchParams(window.location.search).get('portal') === 'org'

            if (user.role === 'super_admin' && pathname === '/dashboard' && !isChoosingOrg) {
                console.log("[ProtectedRoute] Super Admin detected on dashboard - Redirecting to portal selection")
                router.push("/select-portal")
                return
            }

            // check if user is trying to access a dashboard route
            if (pathname.startsWith("/dashboard")) {
                // Find the exact matching navigation item or the closest parent
                const matchedNavItem = navItems.find(item => {
                    if (item.href === "/dashboard") return pathname === "/dashboard"
                    return pathname.startsWith(item.href)
                })

                const userRole = user.role || ""

                // Function to find a safe landing page for this user
                const getSafeLandingPage = () => {
                    // Try to find the first dashboard route they ARE allowed to access
                    const firstAllowedItem = navItems.find(item =>
                        !item.allowedRoles || item.allowedRoles.includes(userRole)
                    )

                    if (firstAllowedItem) return firstAllowedItem.href

                    // Fallback to clock if they have an org
                    if (organization) return `/org/${organization.slug}/clock`
                    return "/login"
                }

                // If no direct match is found for a sub-path, or if it has role restrictions
                if (matchedNavItem) {
                    const isAllowed = !matchedNavItem.allowedRoles || matchedNavItem.allowedRoles.includes(userRole)

                    if (!isAllowed) {
                        console.warn(`User ${userRole} attempted unauthorized access to ${pathname}`)
                        router.push(getSafeLandingPage())
                        return
                    }
                } else if (pathname !== "/dashboard") {
                    // It's a dashboard subroute but doesn't exist in our navItems list?
                    // Maybe it's a dynamic route inside one of them. 
                    // Most dynamic routes will be covered by the startsWith check above.
                }

                // Global admin check for generic /dashboard access if not specifically in navItems
                const hasAnyAdminRole = ["owner", "admin", "hr", "manager", "finance", "super_admin"].includes(userRole)
                if (!hasAnyAdminRole) {
                    router.push(getSafeLandingPage())
                    return
                }
            }

            if (!organization && pathname !== "/setup" && pathname !== "/dashboard") {
                // If they are logged in but have no org, they must go to setup
                // Exception for /dashboard itself which might be needed for the setup flow
                router.push("/setup")
            }
        }

        checkAuth()
    }, [user, organization, router, pathname, isInitialized])

    if (!isInitialized || !user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <LoadingSpinner />
            </div>
        )
    }

    return <>{children}</>
}
