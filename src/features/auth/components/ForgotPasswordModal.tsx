"use client"

import { useState } from "react"
import { X, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { authService } from "../services/authService"
import { toast } from "@/lib/toast"

interface ForgotPasswordModalProps {
    isOpen: boolean
    onClose: () => void
    initialEmail?: string
}

export function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState(initialEmail)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await authService.sendPasswordResetEmail(email)
            setSuccess(true)
            toast.success("Reset email sent! Check your inbox.")
        } catch (err: any) {
            setError(err.message || "Failed to send reset email")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-md"
                onClick={onClose}
            />
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden relative z-10">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Forgot Password</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Email Sent!</h3>
                            <p className="text-sm text-muted-foreground">We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>. Please check your inbox and spam folder.</p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm mt-4 transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                                <AlertCircle size={18} className="text-primary mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Enter the email address associated with your account and we'll send you a link to reset your password.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder="name@company.com"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-xl flex items-center gap-2">
                                    <X size={14} /> {error}
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 border border-border rounded-xl font-bold text-sm hover:bg-muted transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 h-[44px] py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send Reset Link"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
