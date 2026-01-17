"use client"

import React from "react"
import { Search, Bell, HelpCircle } from "lucide-react"

export function AdminHeader() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md fixed top-0 right-0 left-64 z-30 transition-all">
            <div className="h-full px-8 flex items-center justify-between">
                {/* Search Bar - Prominent & High Contrast */}
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 font-bold" />
                        <input
                            type="search"
                            placeholder="Search organizations, logs, or transactions..."
                            className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">
                            Super Admin
                        </span>
                    </div>
                </div>
            </div>
        </header>
    )
}
