"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, FileText, Building, Users, Clock, Settings, LogOut, Sun, Moon, ChevronLeft, ChevronRight, ExternalLink, Copy, Check, ShieldCheck } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useTheme } from "@/providers/ThemeProvider"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { navItems } from "@/config/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const { user, organization, isSidebarCollapsed, toggleSidebar } = useAppStore()
  const { theme, toggleTheme } = useTheme()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [copied, setCopied] = useState(false)

  const clockUrl = organization ? `${window.location.origin}/org/${organization.slug}/clock` : ""

  const handleCopyClockUrl = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!clockUrl) return
    navigator.clipboard.writeText(clockUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (e) {
      setIsSigningOut(false)
    }
  }

  return (
    <aside
      className={`
        ${isSidebarCollapsed ? "w-20" : "w-64"} 
        bg-sidebar border-r border-sidebar-border h-full flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out
      `}
    >
      <div className={`p-4 h-16 flex items-center border-b border-sidebar-border ${isSidebarCollapsed ? "justify-center px-1" : "justify-between"}`}>
        <div className="flex items-center gap-1 overflow-hidden">
          <div className="flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="OrgFlow" className="h-10 w-auto object-contain" />
          </div>
          {!isSidebarCollapsed && (
            <span className="font-bold text-sidebar-foreground whitespace-nowrap opacity-100 transition-opacity duration-300 text-lg tracking-tight -ml-2">rgFlow</span>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className={`
                p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors
                ${isSidebarCollapsed ? "hidden" : "block"}
            `}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isAllowed = !item.allowedRoles || (user?.role && item.allowedRoles.includes(user.role))

          // Special rendering for Settings to show disabled state if not owner
          const isSettings = item.label === "Settings"
          const effectivelyAllowed = isSettings ? (user?.role === "owner" || user?.role === "super_admin") : isAllowed

          if (item.label === "Settings") {
            return (
              <div key="clock-settings-group" className="space-y-2">
                {/* Clock URL Item */}
                <div
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                    text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer
                    ${isSidebarCollapsed ? "justify-center px-2" : ""}
                  `}
                  onClick={handleCopyClockUrl}
                  title={isSidebarCollapsed ? "Copy Clock URL" : undefined}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="relative flex items-center justify-center shrink-0">
                      {copied ? <Check size={18} className="text-green-500" /> : <Clock size={18} />}
                    </div>
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden transition-all duration-300 text-sm font-medium">
                        {copied ? "URL Copied!" : "Clock URL"}
                      </span>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(clockUrl, "_blank")
                      }}
                      className="p-1 hover:bg-sidebar-primary/20 rounded text-primary transition-colors ml-auto"
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>

                {/* Actual Settings Item */}
                {effectivelyAllowed ? (
                  <Link href={item.href} className="block">
                    <div
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                        ${isActive ? "bg-sidebar-primary/10 text-primary font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"}
                        ${isSidebarCollapsed ? "justify-center px-2" : ""}
                      `}
                    >
                      <Icon size={20} className={`shrink-0 ${isActive ? "text-primary" : ""}`} />
                      {!isSidebarCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                      {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />}
                    </div>
                  </Link>
                ) : (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                            text-sidebar-foreground/30 cursor-not-allowed opacity-50
                            ${isSidebarCollapsed ? "justify-center px-2" : ""}
                          `}
                        >
                          <Icon size={20} className="shrink-0" />
                          {!isSidebarCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Only Owners can access settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )
          }

          const LinkContent = (
            <div
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                ${isActive
                  ? "bg-sidebar-primary/10 text-primary font-medium"
                  : isAllowed
                    ? "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"
                    : "text-sidebar-foreground/30 cursor-not-allowed opacity-50"
                }
                ${isSidebarCollapsed ? "justify-center px-2" : ""}
              `}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? "text-primary" : ""}`} />

              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{item.label}</span>
              )}

              {/* Active Indicator Strip */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
              )}
            </div>
          )

          if (!isAllowed) {
            return (
              <TooltipProvider key={item.href}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    {LinkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>You access to this; Contact Your Admin</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {LinkContent}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border mt-auto space-y-2">

        {/* Collapsed Toggle (When sidebar is small, show it here to expand) */}
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/50 transition-colors mb-2"
            title="Expand Sidebar"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            flex items-center gap-3 w-full px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors
            ${isSidebarCollapsed ? "justify-center" : ""}
          `}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {!isSidebarCollapsed && <span className="font-medium text-sm">Theme</span>}
        </button>

        {/* Super Admin Switcher */}
        {user?.role === 'super_admin' && (
          <Link
            href="/admin"
            className={`
              flex items-center gap-3 w-full px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors
              ${isSidebarCollapsed ? "justify-center" : ""}
            `}
            title="Switch to Admin Portal"
          >
            <ShieldCheck size={20} />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Admin Portal</span>}
          </Link>
        )}

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`
            flex items-center gap-3 w-full px-3 py-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors
            ${isSidebarCollapsed ? "justify-center" : ""}
          `}
          title="Sign Out"
        >
          {isSigningOut ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut size={20} />
          )}
          {!isSigningOut && !isSidebarCollapsed && <span className="font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
