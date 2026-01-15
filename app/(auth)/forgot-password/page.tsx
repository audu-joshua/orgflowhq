"use client"

import { useState } from "react"
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"
import { getSupabaseClient } from "@/lib/supabaseClient"
import Link from "next/link"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const supabase = getSupabaseClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error
            setSubmitted(true)
        } catch (err: any) {
            setError(err.message || "Failed to send reset link")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout
            title="Forgot Password"
            imagePath="/login_image.jpg"
            subtitle="Recover your access"
        >
            <div className="space-y-6">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
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
                                placeholder="name@company.com"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive rounded-xl text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[52px] px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold text-lg cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Check your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We've sent a password reset link to <strong>{email}</strong>.
                        </p>
                    </div>
                )}

                <div className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline font-medium">
                        Back to login
                    </Link>
                </div>
            </div>
        </AuthPageLayout>
    )
}
