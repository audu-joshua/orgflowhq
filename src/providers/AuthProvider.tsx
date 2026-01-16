"use client"

import { useAuth } from "@/features/auth/hooks/useAuth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // This hook initializes the auth state in the global store
    useAuth()
    return <>{children}</>
}
