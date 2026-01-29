"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"
import { Loader2, CheckCircle2 } from "lucide-react"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")

    const token = searchParams.get("token")
    const email = searchParams.get("email")

    useEffect(() => {
        if (!token || !email) {
            setError("Invalid reset link")
        }
    }, [token, email])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword: password })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to update password")

            setSubmitted(true)
            setTimeout(() => router.push("/login"), 3000)
        } catch (err: any) {
            setError(err.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Please enter your new password below.
                    </p>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 border-2 border-border bg-background text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive rounded-xl text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !!error && !token}
                        className="w-full h-[52px] px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold text-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Update Password"}
                    </button>
                </form>
            ) : (
                <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Password Update Successful</h3>
                    <p className="text-sm text-muted-foreground">
                        Your password has been successfully reset. Redirecting you to the login page...
                    </p>
                </div>
            )}
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <AuthPageLayout
            title="Reset Password"
            imagePath="/login_image.jpg"
            subtitle="Set your new security credentials"
        >
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthPageLayout>
    )
}
