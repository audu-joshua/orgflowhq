"use client"

import { useAppStore } from "@/store/useAppStore"
import { ReactNode } from "react"

interface RoleGuardProps {
    children: ReactNode
    allowedRoles: string[]
    fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { user } = useAppStore()

    if (!user || (user.role && !allowedRoles.includes(user.role))) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
