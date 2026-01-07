"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        // Basic check to see if we have an active recovery session
        const checkSession = async () => {
            const supabase = getSupabaseClient()

            // Wait up to 2 seconds for session to initialize from hash
            let session = null
            for (let i = 0; i < 4; i++) {
                const { data } = await supabase.auth.getSession()
                if (data.session) {
                    session = data.session
                    break
                }
                await new Promise(r => setTimeout(r, 500))
            }

            if (!session) {
                console.warn("[ResetPassword] No session found after wait. Redirecting...")
                toast.error("Invalid or expired reset link")
                router.push("/login")
            }
        }
        checkSession()
    }, [router])

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
            const supabase = getSupabaseClient()
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error
            setSubmitted(true)

            // Redirect to login after a short delay
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: any) {
            setError(err.message || "Failed to update password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPageLayout
            title="Reset Password"
            imagePath="/login_image.jpg"
            subtitle="Set your new security credentials"
        >
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
                            disabled={loading}
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
        </AuthPageLayout>
    )
}
