"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { authService } from "../services/authService"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, setUser, organization, setOrganization } = useAppStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        
        if (currentUser) {
          const profile = await authService.getUserProfile(currentUser.id)
          setUser({
            id: profile.id,
            email: profile.email,
            organization_id: profile.organization_id,
            created_at: profile.created_at,
          })
          if (profile.organizations) {
            setOrganization(profile.organizations)
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
        setLoading(false)
      }
    }

    initAuth()
  }, [setUser, setOrganization])

  const signUp = async (email: string, password: string, organizationName: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: newUser, organization: newOrg } = await authService.signUp(
        email,
        password,
        organizationName
      )
      setUser({
        id: newUser.id,
        email: newUser.email || "",
        organization_id: newOrg.id,
        created_at: new Date().toISOString(),
      })
      setOrganization(newOrg)
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
      setUser({
        id: profile.id,
        email: profile.email,
        organization_id: profile.organization_id,
        created_at: profile.created_at,
      })
      if (profile.organizations) {
        setOrganization(profile.organizations)
      }
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