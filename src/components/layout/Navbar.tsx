"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useTheme } from "@/providers/ThemeProvider"
import { useState } from "react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const isAuthPage = pathname?.startsWith("/(auth)") || pathname?.includes("/login") || pathname?.includes("/register")
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <nav className="bg-card shadow-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-foreground hidden sm:inline">HR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/roles" className="text-muted-foreground hover:text-foreground transition-colors">
                  Roles
                </Link>
                <Link
                  href="/dashboard/applications"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Applications
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Logout
                </button>
              </>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-muted">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!user ? (
              <>
                <Link href="/" className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg">
                  Home
                </Link>
                <Link href="/login" className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg">
                  Sign In
                </Link>
                <Link href="/register" className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg">
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/roles"
                  className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
                >
                  Roles
                </Link>
                <Link
                  href="/dashboard/applications"
                  className="block px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
                >
                  Applications
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 bg-destructive text-destructive-foreground rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
