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

    if (!validateCompanyEmail(email)) {
      setFormError("Please use a company email address. Free email providers (Gmail, Yahoo, etc.) are not allowed.")
      return
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    try {
      await signUp(email, password, organizationName)
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
          <p className="mt-1 text-xs text-muted-foreground">
            Please use your company email address
          </p>
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
