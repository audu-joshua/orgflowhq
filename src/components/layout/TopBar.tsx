"use client"

import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useTheme } from "@/providers/ThemeProvider"
import { User, LogOut, Sun, Moon, ChevronDown, Settings } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"

export function TopBar() {
  const { user, organization } = useAppStore()
  const { signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 right-0 left-0 h-16 bg-card/80 backdrop-blur-md border-b border-border px-6 flex items-center justify-between z-40 w-full shrink-0">
      <div className="flex items-center gap-3">
        {organization?.logo_url ? (
          <img
            src={organization.logo_url}
            alt={organization.name}
            className="w-8 h-8 rounded-lg object-cover bg-white border border-border"
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">{organization?.name?.[0]?.toUpperCase() || "H"}</span>
          </div>
        )}
        <span className="font-bold text-foreground text-lg hidden sm:inline">
          {organization?.name || "HR System"}
        </span>
      </div>

      <div className="flex items-center gap-4" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground">
                {user?.role === 'owner'
                  ? user?.email?.split('@')[0]
                  : (user?.full_name || user?.email?.split('@')[0])
                }
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{user?.role || "Staff"}</p>
            </div>

            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 overflow-hidden">
              {user?.role !== 'owner' && user?.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user?.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (user?.role !== 'owner' && user?.full_name) || user?.email ? (
                <span className="text-primary font-bold text-sm">
                  {user?.role === 'owner'
                    ? user?.email?.[0]?.toUpperCase()
                    : (user?.full_name?.[0] || user?.email?.[0] || "").toUpperCase()
                  }
                </span>
              ) : (
                <User size={18} className="text-primary" />
              )}
            </div>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden p-2 z-50"
              >
                <div className="px-3 py-3 border-b border-border/50 mb-2">
                  <p className="text-sm font-bold text-foreground truncate">
                    {user?.role === 'owner'
                      ? user?.email?.split('@')[0]
                      : (user?.full_name || user?.email?.split('@')[0])
                    }
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    <span className="font-medium">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    <span className="font-medium">Settings</span>
                  </button>

                  <div className="h-px bg-border/50 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="font-bold">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
