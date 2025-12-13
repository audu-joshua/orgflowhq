"use client"

import { useAppStore } from "@/store/useAppStore"
import { User } from "lucide-react"

export function TopBar() {
  const { user, organization } = useAppStore()

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {organization?.logo_url ? (
          <img
            src={organization.logo_url}
            alt={organization.name}
            className="w-8 h-8 rounded-lg object-cover bg-white border border-border"
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">H</span>
          </div>
        )}
        <span className="font-bold text-foreground text-lg hidden sm:inline">
          {organization?.name || "HR System"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
