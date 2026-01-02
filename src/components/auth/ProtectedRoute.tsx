"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { LoadingSpinner } from "../shared/LoadingSpinner"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, organization, isInitialized } = useAppStore()

    useEffect(() => {
        if (!isInitialized) return

        // Wait for hydration/initial load
        const checkAuth = async () => {
            if (!user) {
                router.push("/login")
                return
            }

            // Role-based route guarding
            const isAdminRoute = pathname.startsWith("/dashboard")
            const hasAdminRole = ["owner", "admin", "hr", "manager", "finance"].includes(user.role || "")

            if (isAdminRoute && !hasAdminRole) {
                // If they are an employee but not an admin, they should go to clock page
                if (organization) {
                    router.push(`/org/${organization.slug}/clock`)
                } else {
                    router.push("/login")
                }
                return
            }

            if (!organization && pathname !== "/setup") {
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
