"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, FileText, Building, Users, LogOut, Sun, Moon, Settings } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useTheme } from "@/providers/ThemeProvider"
import { getSupabaseClient } from "@/lib/supabaseClient"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/roles", label: "Roles", icon: Briefcase },
  { href: "/dashboard/departments", label: "Departments", icon: Building },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/applications", label: "Applications", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { organization } = useAppStore()
  const { theme, toggleTheme } = useTheme()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">H</span>
          </div>
          <span className="font-bold text-sidebar-foreground">HR</span>
        </div>
        <p className="text-sm text-sidebar-foreground/80">Simplify Hr</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                ? "bg-sidebar-primary/20 text-sidebar-primary font-semibold border-l-4 border-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent px-4"
                }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-2">
        <div className="border-t border-sidebar-border pt-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
