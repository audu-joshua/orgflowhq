"use client"

import { useState } from "react"
import type React from "react"
import { useAppStore } from "@/store/useAppStore"
import { Building2, User } from "lucide-react"
import { UserProfileModal } from "@/features/auth/components/UserProfileModal"

export default function ClockLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { organization, user } = useAppStore()
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="p-6 border-b border-border bg-card">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    {/* App Logo (Left) */}
                    <div className="flex items-center gap-1">
                        <img src="/logo.png" alt="OrgFlow" className="h-11 w-auto object-contain" />
                        <span className="font-bold text-foreground text-xl tracking-tight -ml-2">rgFlow Clock</span>
                    </div>

                    {/* Right Side: Organization & User Profile */}
                    <div className="flex items-center gap-6">
                        {/* User Profile Trigger - Shown only when logged in */}
                        {user && (
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-3 p-1.5 pr-4 pl-1.5 rounded-xl hover:bg-muted transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <User size={16} />
                                </div>
                                <div className="text-left hidden xs:block">
                                    <p className="text-[10px] font-bold text-foreground">My Profile</p>
                                    <p className="text-[9px] text-muted-foreground truncate max-w-[100px]">{user.email}</p>
                                </div>
                            </button>
                        )}

                        {/* Organization Logo (Right) */}
                        {organization && (
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{organization.name}</p>
                                    <p className="text-[9px] text-primary/60 font-medium">Verified Portal</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                                    {organization.logo_url ? (
                                        <img
                                            src={organization.logo_url}
                                            alt={organization.name}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/20">
                {children}
            </main>

            <footer className="p-6 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-t border-border bg-card">
                &copy; {new Date().getFullYear()} OrgFlow. Enterprise Personnel Management.
            </footer>

            <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    )
}
