"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { authService } from "../services/authService"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, setUser, organization, setOrganization, setInitialized } = useAppStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()

        if (currentUser) {
          const profile = await authService.getUserProfile(currentUser.id)

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
            // User is logged in but has no profile yet (registration in progress)
            setUser({
              id: currentUser.id,
              email: currentUser.email || "",
              organization_id: "",
              created_at: currentUser.created_at,
            })
          }
        } else {
          // No session exists - user is not logged in (this is normal)
          setUser(null)
          setOrganization(null)
        }
      } catch (err) {
        // Only log actual errors, not missing sessions
        if (err instanceof Error && !err.message.includes("session missing")) {
          console.error("Auth initialization error:", err)
          setError(err.message)
        }
        // Clear user state on error
        setUser(null)
        setOrganization(null)
      } finally {
        setInitialized(true)
        setLoading(false)
      }
    }

    initAuth()
  }, [setUser, setOrganization, setInitialized])

  const signUp = async (email: string, password: string, organizationName: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: newUser } = await authService.signUp(
        email,
        password,
        organizationName
      )
      // For signUp, the user who signs up is automatically an 'owner'
      setUser({
        id: newUser.id,
        email: newUser.email || "",
        organization_id: "", // Will be updated after provisioning
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
      const profile = await authService.getUserProfile(authUser.id)

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

  return {
    user,
    organization,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  }
}
