"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { signIn, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState(() => {
    // Check if redirect with error via client-side router
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error') === 'terminated') {
        return "Account not Found; Contact Your Hr..."
      }
    }
    return ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    try {
      const profile = await signIn(email, password)

      if (!profile) {
        throw new Error("Could not fetch user profile")
      }

      // 1. Critical Policy: Termination check
      if (profile.status === 'terminated') {
        // Sign out immediately (since auth succeeded but business policy denied)
        const { getSupabaseClient } = await import("@/lib/supabaseClient")
        await getSupabaseClient().auth.signOut()
        setFormError("Account not Found; Contact Your Hr...")
        return
      }

      // Check for privileged roles
      const privilegedRoles = ["owner", "admin", "hr", "manager", "finance"]

      if (privilegedRoles.includes(profile.role)) {
        router.push("/dashboard")
      } else if (profile.organizations?.slug) {
        // If employee or other role, redirect to clock (or block)
        router.push(`/org/${profile.organizations.slug}/clock`)
      } else {
        setFormError("No active organization found for this account. If you just signed up, your organization might still be provisioning. Otherwise, please register a new organization.")
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed")
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login implementation
    console.log(`Login with ${provider}`)
  }

  return (
    <div className="space-y-6">
      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all"
            placeholder="batukra312@||"
          />
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
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forget Password?
          </Link>
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
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {/* Footer Links */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
        <Link href="/" className="block text-muted-foreground hover:text-foreground text-sm">
          Back to home
        </Link>
      </div>

      {/* Copyright */}
      <div className="pt-6 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OrgFlow. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}
