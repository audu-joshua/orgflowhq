"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import Link from "next/link"
import { Loader2 } from "lucide-react"

// Common free email providers to reject
const FREE_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
  'yandex.com', 'zoho.com', 'gmx.com'
]

export function RegisterForm() {
  const router = useRouter()
  const { signUp, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [formError, setFormError] = useState("")

  const validateCompanyEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false

    return !FREE_EMAIL_PROVIDERS.includes(domain)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    const isFreeEmail = !validateCompanyEmail(email)

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    try {
      // 1. Attempt to sign up (create identity)
      try {
        await signUp(email, password, organizationName)
      } catch (err: any) {
        // If user already exists in auth.users, try to sign in instead
        if (err.message?.includes("already registered") || err.code === "user_already_exists") {
          console.log("[RegisterForm] User exists, attempting sign-in to provision org...")
          const { useAuth } = await import("../hooks/useAuth")
          // We need the signIn from the hook directly since authData might not be accessible easily
          // But we are already in the RegisterForm which uses useAuth
        } else {
          throw err
        }
      }

      // If signUp failed because user exists, we need to sign in to get a session
      const { getSupabaseClient } = await import("@/lib/supabaseClient")
      const supabase = getSupabaseClient()

      let { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log("[RegisterForm] No session, attempting manual sign-in...")
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw new Error("This email is already registered. Please provide the correct password to create your organization.")
        session = signInData.session
      }

      if (!session) {
        throw new Error("Authentication failed. Please try again.")
      }

      // 2. Provision Organization on the server
      const response = await fetch("/api/auth/register-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ organizationName })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // If they already have an org, maybe we should tell them
        if (errorData.error?.includes("already linked")) {
          throw new Error("You are already registered with an organization. Please log in normally.")
        }
        throw new Error(errorData.error || "Failed to finalize organization setup")
      }

      const provisionData = await response.json()

      // 3. Update Store with full Org details
      const { useAppStore } = await import("@/store/useAppStore")
      const store = useAppStore.getState()

      store.setOrganization({
        id: provisionData.organizationId,
        slug: provisionData.slug,
        name: organizationName
      })

      // Ensure user has the org id too
      if (store.user) {
        store.setUser({
          ...store.user,
          organization_id: provisionData.organizationId
        })
      }

      router.push("/dashboard")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed")
    }
  }

  const handleSocialSignup = (provider: string) => {
    // Placeholder for social signup implementation
    console.log(`Sign up with ${provider}`)
  }

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
            Organization Name
          </label>
          <input
            id="organization"
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all"
            placeholder="Your Company"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Company Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all"
            placeholder="you@company.com"
          />
          {email && !validateCompanyEmail(email) ? (
            <p className="mt-1 text-xs text-amber-600 font-medium">
              Note: Work emails are recommended for better organization features.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              We recommend using your company email address.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all"
            placeholder="Enter your Password"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum 6 characters
          </p>
        </div>

        {(formError || error) && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-xl text-destructive text-sm">
            {formError || error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold text-lg cursor-pointer flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {/* Footer Links */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
        <Link href="/" className="block text-muted-foreground hover:text-foreground text-sm">
          Back to home
        </Link>
      </div>

      {/* Copyright */}
      <div className="pt-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          ©2025 HR All Right Reserved
        </p>
      </div>
    </div>
  )
}
