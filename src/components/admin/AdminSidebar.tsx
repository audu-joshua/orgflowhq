"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Building2,
    Users,
    CreditCard,
    FileText,
    Settings,
    LogOut,
    ArrowUpRight,
    Activity,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Loader2 } from "lucide-react"

const adminNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Organizations", href: "/admin/organizations", icon: Building2 },
    { name: "Revenue", href: "/admin/revenue", icon: CreditCard },
    { name: "System Logs", href: "/admin/logs", icon: FileText },
    { name: "Plans & Pricing", href: "/admin/plans", icon: Settings },
]

export function AdminSidebar({ user, authUser }: { user: any; authUser: any }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            const supabase = getSupabaseClient()
            await supabase.auth.signOut()
            router.refresh()
            router.push("/login")
        } catch (error) {
            console.error("Logout failed:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <div className="flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800 fixed left-0 top-0 z-40">
            {/* Branding - Pure White on Dark */}
            <div className="p-8">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <img src="/logo.png" alt="Logo" className="h-6 brightness-0 invert" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        OrgFlow
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Platform Control</p>
                {adminNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group",
                                isActive
                                    ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-400"
                            )} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50 backdrop-blur-sm">
                <div className="space-y-1 mb-4">
                    <Link
                        href="/dashboard?portal=org"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium group"
                    >
                        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                            <LayoutDashboard className="h-4 w-4 group-hover:text-emerald-400" />
                        </div>
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                            {isLoggingOut ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                            ) : (
                                <LogOut className="h-4 w-4 group-hover:text-red-400" />
                            )}
                        </div>
                        {isLoggingOut ? 'Signing out...' : 'Logout'}
                    </button>
                </div>

                {/* Profile Mini Card */}
                <div className="flex items-center gap-3 px-3 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs ring-4 ring-slate-900">
                        {user?.full_name?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user?.full_name || "Super Admin"}</p>
                        <p className="text-[10px] text-slate-500 truncate">{authUser?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
