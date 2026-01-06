"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { authService } from "../services/authService"
import { organizationService } from "@/features/organization/services/organizationService"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const slug = params?.slug as string | undefined
  const { user, setUser, organization, setOrganization, setInitialized } = useAppStore()

  const checkActivation = useCallback(async (profile: any) => {
    if (profile && profile.status === "invited") {
      console.log(`[useAuth] Detected INVITED status for ${profile.email}. Triggering activation...`)
      try {
        const { getSupabaseClient } = await import("@/lib/supabaseClient")
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          const activationUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/activate` : "/api/auth/activate"
          const response = await fetch(activationUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${session.access_token}`
            }
          })
          const result = await response.json()
          console.log("[useAuth] Activation result:", { status: response.status, result })

          if (response.ok) {
            profile.status = "active" // Update local object for immediate UI feedback
            return true
          }
        }
      } catch (err) {
        console.error("[useAuth] Activation trigger failed:", err)
      }
    }
    return false
  }, [])

  const refreshProfile = useCallback(async (userId: string, orgId?: string) => {
    try {
      const profile = await authService.getUserProfile(userId, orgId)
      if (profile) {
        if (profile.organizations) {
          setOrganization(profile.organizations)
        }

        // Check for activation
        await checkActivation(profile)

        setUser({
          id: profile.id,
          email: profile.email,
          organization_id: profile.organization_id,
          created_at: profile.created_at,
          role: profile.role,
          full_name: profile.full_name,
          profile_image_url: profile.profile_image_url,
          status: profile.status,
        })
      } else {
        setUser({
          id: userId,
          email: "",
          organization_id: "",
          created_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error("[useAuth] refreshProfile failed:", err)
    }
  }, [setUser, setOrganization, checkActivation])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()

        if (currentUser) {
          let orgId = organization?.id

          if (slug) {
            try {
              const org = await organizationService.getOrganizationBySlug(slug)
              orgId = org.id
            } catch (err) {
              console.warn("[useAuth] Failed to resolve org from slug:", slug)
            }
          }

          const profile = await authService.getUserProfile(currentUser.id, orgId)

          if (profile) {
            if (profile.organizations) {
              setOrganization(profile.organizations)
            }

            // Check for activation
            await checkActivation(profile)

            setUser({
              id: profile.id,
              email: profile.email,
              organization_id: profile.organization_id,
              created_at: profile.created_at,
              role: profile.role,
              full_name: profile.full_name,
              profile_image_url: profile.profile_image_url,
              status: profile.status,
            })
          } else {
            setUser({
              id: currentUser.id,
              email: currentUser.email || "",
              organization_id: "",
              created_at: currentUser.created_at,
            })
          }
        } else {
          setUser(null)
          setOrganization(null)
        }
      } catch (err) {
        if (err instanceof Error && !err.message.includes("session missing")) {
          console.error("Auth initialization error:", err)
          setError(err.message)
        }
        setUser(null)
        setOrganization(null)
      } finally {
        setInitialized(true)
        setLoading(false)
      }
    }

    initAuth()
  }, [slug, setUser, setOrganization, setInitialized, checkActivation])

  const signUp = async (email: string, password: string, organizationName: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: newUser } = await authService.signUp(
        email,
        password,
        organizationName
      )
      setUser({
        id: newUser.id,
        email: newUser.email || "",
        organization_id: "",
        created_at: new Date().toISOString(),
        role: "owner",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: authUser } = await authService.signIn(email, password)

      let orgIdToFetch = organization?.id
      if (slug) {
        try {
          const org = await organizationService.getOrganizationBySlug(slug)
          orgIdToFetch = org.id
        } catch (e) { }
      }

      const profile = await authService.getUserProfile(authUser.id, orgIdToFetch)

      if (profile) {
        if (profile.organizations) {
          setOrganization(profile.organizations)
        }

        // Check for activation
        await checkActivation(profile)

        setUser({
          id: profile.id,
          email: profile.email,
          organization_id: profile.organization_id,
          created_at: profile.created_at,
          role: profile.role,
          full_name: profile.full_name,
          profile_image_url: profile.profile_image_url,
          status: profile.status,
        })
      }
      return profile
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.signOut()
      setUser(null)
      setOrganization(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    organization,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshProfile
  }
}
