"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { LoadingSpinner } from "../shared/LoadingSpinner"
import { navItems } from "@/config/navigation"
import { signOut } from "next-auth/react"

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

            // 1. Policy: Termination/Deactivation check
            if (user.status === 'terminated' || user.status === 'inactive') {
                console.warn(`Deactivated user ${user.email} attempted access.`)
                await signOut({ callbackUrl: "/login?error=terminated" })
                return
            }

            // 2. Policy: Super Admin portal selection logic
            const isChoosingOrg = pathname === '/dashboard' && new URLSearchParams(window.location.search).get('portal') === 'org'

            if (user.role === 'super_admin' && pathname === '/dashboard' && !isChoosingOrg) {
                console.log("[ProtectedRoute] Super Admin on root dashboard - Redirecting to portal selection")
                router.push("/select-portal")
                return
            }

            // 3. Policy: Role-based route protection
            if (pathname.startsWith("/dashboard")) {
                const userRole = user.role || ""

                const matchedNavItem = navItems.find(item => {
                    if (item.href === "/dashboard") return pathname === "/dashboard"
                    return pathname.startsWith(item.href)
                })

                // Function to find a safe landing page for this user
                const getSafeLandingPage = () => {
                    const firstAllowedItem = navItems.find(item =>
                        !item.allowedRoles || item.allowedRoles.includes(userRole)
                    )
                    if (firstAllowedItem) return firstAllowedItem.href
                    if (organization) return `/org/${organization.slug}/clock`
                    return "/login"
                }

                if (matchedNavItem) {
                    const isAllowed = !matchedNavItem.allowedRoles || matchedNavItem.allowedRoles.includes(userRole)
                    if (!isAllowed) {
                        console.warn(`User ${userRole} attempted unauthorized access to ${pathname}`)
                        router.push(getSafeLandingPage())
                        return
                    }
                }

                // Global admin check for dashboard access
                const hasAnyAdminRole = ["owner", "admin", "hr", "manager", "finance", "super_admin"].includes(userRole)
                if (!hasAnyAdminRole) {
                    router.push(getSafeLandingPage())
                    return
                }
            }

            // 4. Policy: Organization context check
            // If they are logged in but have no org, they might need to be redirected to setup
            // This applies to non-Super Admins mostly
            if (!organization && user.role !== 'super_admin' && !pathname.startsWith("/org") && pathname !== "/dashboard") {
                // If dashboard is empty and no org, might need redirect to setup
                // router.push("/setup")
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
