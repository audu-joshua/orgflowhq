"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useAuth } from "../hooks/useAuth"
import Link from "next/link"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "@/lib/toast"

// Common free email providers to reject
const FREE_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
  'yandex.com', 'zoho.com', 'gmx.com'
]

export function RegisterForm() {
  const router = useRouter()
  const { update } = useSession()
  const { signUp, loading, error, clearError, refreshProfile } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const validateCompanyEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false

    return !FREE_EMAIL_PROVIDERS.includes(domain)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)

    if (password.length < 6) {
      toast.error("Password too short", { description: "Password must be at least 6 characters" })
      setLocalLoading(false)
      return
    }

    try {
      const { signIn: nextAuthSignIn, getSession } = await import("next-auth/react")

      // 1. Signup (Create MongoDB User)
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName })
      })

      if (!signupRes.ok) {
        const signupError = await signupRes.json()
        if (!signupError.error?.includes("already exists")) {
          throw new Error(signupError.error || "Signup failed")
        }
        // If user already exists, we'll try to sign in and provision org if missing
      }

      // 2. Sign In to get session for org provisioning
      const signInResult = await nextAuthSignIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (signInResult?.error) {
        if (signupRes.ok) throw new Error("Could not sign in after account creation")
        toast.error("Account already exists", {
          description: "This email is registered. Please use login or try a different email."
        })
        return
      }

      const session = await getSession()
      if (!session) throw new Error("Failed to establish session")

      // 3. Provision Organization
      const orgRes = await fetch("/api/auth/register-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName, fullName })
      })

      if (!orgRes.ok) {
        const orgError = await orgRes.json()
        throw new Error(orgError.error || "Failed to set up organization")
      }

      const orgData = await orgRes.json()

      // 4. Enrich session with new organization data
      await update()

      // 5. Sync store with new data
      const updatedSession = await getSession() as any
      if (updatedSession?.user?.id) {
        await refreshProfile(updatedSession.user.id)
      }

      toast.success("Success", {
        title: "Setup Complete!",
        description: `${organizationName} is ready. Redirecting...`,
        duration: 4000,
      })

      router.push("/dashboard")
    } catch (err) {
      toast.error("Registration failed", { description: err instanceof Error ? err.message : "Internal Error" })
    } finally {
      setLocalLoading(false)
    }
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
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
            Your Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all"
            placeholder="John Doe"
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
          {/* Removed Google Hint Box */}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground transition-all pr-12"
              placeholder="Enter your Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum 6 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={localLoading || loading}
          className="w-full h-[52px] px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold text-lg cursor-pointer flex items-center justify-center gap-2"
        >
          {localLoading || loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign Up"}
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

    </div>
  )
}

