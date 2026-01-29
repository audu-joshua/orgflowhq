"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react"
import { useAppStore } from "@/store/useAppStore"
import { getUserProfileAction, signUpAction } from "../actions"
import { IUser, IOrganization } from "@/models/types"

export function useAuth() {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  const { user, setUser, organization, setOrganization, setInitialized } = useAppStore()

  const refreshProfile = useCallback(async (userId: string, orgId?: string) => {
    try {
      const profile = await getUserProfileAction(userId, orgId)
      if (profile) {
        if (profile.organization) {
          setOrganization(profile.organization as any)
        }

        setUser({
          id: profile.id,
          email: profile.email,
          organizationId: profile.organizationId,
          role: profile.role,
          fullName: profile.fullName,
          profileImageUrl: profile.profileImageUrl,
          status: profile.status,
          createdAt: profile.createdAt,
        })
        return profile
      }
      return null
    } catch (err) {
      console.error("[useAuth] refreshProfile failed:", err)
      return null
    }
  }, [setUser, setOrganization])

  useEffect(() => {
    if (status === "loading") return

    const syncStoreWithSession = async () => {
      if (session?.user) {
        const sessionUser = session.user as any

        // If store user is missing, fetch full profile from MongoDB
        if (!user || user.id !== sessionUser.id) {
          await refreshProfile(sessionUser.id)
        }
      } else {
        setUser(null)
        setOrganization(null)
      }
      setInitialized(true)
    }

    syncStoreWithSession()
  }, [session, status, user, refreshProfile, setUser, setOrganization, setInitialized])

  const signUp = async (email: string, password: string, organizationName: string, fullName?: string) => {
    setError(null)
    try {
      const result = await signUpAction(email, password, organizationName, fullName)
      if (!result.success) throw new Error(result.error)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed"
      setError(message)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      const result = await nextAuthSignIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Store sync will happen via useEffect on session change
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed"
      setError(message)
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await nextAuthSignOut({ redirect: true, callbackUrl: "/login" })
      setUser(null)
      setOrganization(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed"
      setError(message)
      throw err
    }
  }

  const clearError = useCallback(() => setError(null), [])

  return {
    user,
    organization,
    loading: status === "loading",
    error,
    clearError,
    signUp,
    signIn,
    signOut,
    refreshProfile
  }
}
