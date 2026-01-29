"use client"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { SessionProvider } from "next-auth/react"

/**
 * Separate component to call useAuth hook inside SessionProvider context
 */
function AuthStoreSync({ children }: { children: React.ReactNode }) {
    useAuth();
    return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthStoreSync>
                {children}
            </AuthStoreSync>
        </SessionProvider>
    );
}
