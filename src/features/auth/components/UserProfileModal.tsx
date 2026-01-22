"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone, Calendar, Building, User, Briefcase, Shield, Fingerprint, ExternalLink, LogOut, CheckCircle2, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { departmentService } from "@/features/departments/services/departmentService"
import { useAppStore } from "@/store/useAppStore"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { toast } from "@/lib/toast"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { ChangePasswordModal } from "./ChangePasswordModal"

interface UserProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const { user, organization, employee, setEmployee } = useAppStore()
    const { signOut } = useAuth()
    const [loading, setLoading] = useState(!employee) // Only load if we don't have it
    const [error, setError] = useState("")
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    useEffect(() => {
        if (isOpen && user && !employee) {
            const fetchProfile = async () => {
                setLoading(true)
                try {
                    const data = await departmentService.getEmployeeByUserId(user.id)
                    setEmployee(data)
                } catch (err) {
                    console.error("Failed to fetch profile:", err)
                    setError("Could not load your profile details.")
                } finally {
                    setLoading(false)
                }
            }
            fetchProfile()
        }
    }, [isOpen, user, employee, setEmployee])

    if (!isOpen) return null

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !employee) return

        setIsUploadingImage(true)
        try {
            const publicUrl = await departmentService.uploadEmployeeProfileImage(employee.id, file)
            // Update global store (which handles local state since we use the store)
            setEmployee({ ...employee, profile_image_url: publicUrl })
            toast.success("Profile image updated")
        } catch (err: any) {
            console.error("Profile image upload failed:", err)
            toast.error("Failed to update profile image")
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        try {
            await signOut()
            onClose()
            // Smart redirect: If in clock, reload (triggers middleware/page guard). Else go to /login
            if (window.location.pathname.includes("/clock")) {
                window.location.reload()
            } else {
                window.location.href = "/login"
            }
        } catch (err) {
            toast.error("Failed to sign out")
        } finally {
            setIsLoggingOut(false)
        }
    }

    const getInitial = () => {
        if (employee?.full_name) return employee.full_name[0].toUpperCase()
        if (user?.email) return user.email[0].toUpperCase()
        return "U"
    }

    return (
        <>
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start justify-center z-[100] p-4 animate-in fade-in duration-200 overflow-y-auto">
                <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden my-8">

                    {/* Header */}
                    <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">My Profile</h2>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Personal Workforce Record</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <LoadingSpinner />
                                <p className="text-sm text-muted-foreground animate-pulse">Retrieving secure record...</p>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="inline-block p-4 bg-destructive/10 text-destructive rounded-full">
                                    <Shield size={32} />
                                </div>
                                <p className="text-sm font-medium text-foreground">{error}</p>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    If you are an administrator, the system may still be provisioning your employee record.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Profile Top Section */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    <div className="relative group">
                                        <div className="relative">
                                            {employee?.profile_image_url ? (
                                                <img
                                                    src={employee.profile_image_url}
                                                    alt={employee.full_name}
                                                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-background shadow-xl transition-opacity group-hover:opacity-75"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center ring-4 ring-background shadow-lg border-2 border-dashed border-primary/20 transition-opacity group-hover:opacity-75">
                                                    <span className="text-primary font-bold text-3xl">{getInitial()}</span>
                                                </div>
                                            )}

                                            <label
                                                htmlFor="avatar-upload"
                                                className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer z-10 ${isUploadingImage
                                                    ? "opacity-100"
                                                    : "opacity-0 group-hover:opacity-100"
                                                    }`}
                                            >

                                                <div className="bg-black/40 p-2 rounded-full text-white backdrop-blur-sm">
                                                    {isUploadingImage ? <Loader2 size={20} className="animate-spin" /> : <Fingerprint size={20} />}
                                                </div>
                                            </label>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleProfileImageChange}
                                                disabled={isUploadingImage}
                                            />

                                            <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-500 rounded-lg text-white shadow-lg border-2 border-background z-20">
                                                <CheckCircle2 size={12} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center sm:text-left space-y-1 py-1">
                                        <h3 className="text-2xl font-bold text-foreground">{employee?.full_name || "User"}</h3>
                                        <p className="text-sm text-primary font-bold">{employee?.position || "System User"}</p>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted border border-border">
                                                {organization?.name || "Independent"}
                                            </span>
                                            {user?.role && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                                    {user.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Grid Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Fingerprint size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Identity Number</span>
                                        </div>
                                        <p className="font-mono text-xs font-bold text-foreground">{employee?.employee_id || "NOT-LINKED"}</p>
                                    </div>

                                    <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Employment Date</span>
                                        </div>
                                        <p className="text-xs font-bold text-foreground">{employee?.hire_date ? formatDate(employee.hire_date) : "System Account"}</p>
                                    </div>

                                    <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Mail size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Communication</span>
                                        </div>
                                        <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                                    </div>

                                    <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1 hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Building size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Department</span>
                                        </div>
                                        <p className="text-xs font-bold text-foreground">
                                            {employee?.departments?.name || "Unassigned"}
                                        </p>
                                    </div>
                                </div>

                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
                        <button
                            onClick={handleSignOut}
                            disabled={isLoggingOut}
                            className="flex items-center justify-center min-w-[120px] h-[40px] gap-2 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-all border-2 border-destructive/10 hover:border-destructive/30 cursor-pointer disabled:opacity-50"
                        >
                            {isLoggingOut ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <><LogOut size={14} /> Sign Out</>
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg font-bold text-xs transition-all mr-2"
                            >
                                Change Password
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-foreground text-background rounded-lg font-bold text-xs hover:bg-foreground/90 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </>
    )
}
