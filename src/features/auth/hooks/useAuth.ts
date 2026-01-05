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

  const refreshProfile = useCallback(async (userId: string, orgId?: string) => {
    const profile = await authService.getUserProfile(userId, orgId)
    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        organization_id: profile.organization_id,
        created_at: profile.created_at,
        role: profile.role,
        full_name: profile.full_name,
        profile_image_url: profile.profile_image_url,
      })
      if (profile.organizations) {
        setOrganization(profile.organizations)
      }
    } else {
      setUser({
        id: userId,
        email: "", // Will be filled by subsequent lookups or fallback
        organization_id: "",
        created_at: new Date().toISOString(),
      })
    }
  }, [setUser, setOrganization])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()

        if (currentUser) {
          let orgId = organization?.id

          // If we have a slug in the URL, prioritize that organization
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
            setUser({
              id: profile.id,
              email: profile.email,
              organization_id: profile.organization_id,
              created_at: profile.created_at,
              role: profile.role,
              full_name: profile.full_name,
              profile_image_url: profile.profile_image_url,
            })
            if (profile.organizations) {
              setOrganization(profile.organizations)
            }
          } else {
            // User is logged in but has no profile for THIS org
            setUser({
              id: currentUser.id,
              email: currentUser.email || "",
              organization_id: "",
              created_at: currentUser.created_at,
            })
          }
        } else {
          // No session exists
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
  }, [slug, setUser, setOrganization, setInitialized])

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
        setUser({
          id: profile.id,
          email: profile.email,
          organization_id: profile.organization_id,
          created_at: profile.created_at,
          role: profile.role,
          full_name: profile.full_name,
          profile_image_url: profile.profile_image_url,
        })
        if (profile.organizations) {
          setOrganization(profile.organizations)
        }
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

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    organization,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    clearError
  }
}
