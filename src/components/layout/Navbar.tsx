"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useState } from "react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const isAuthPage = pathname?.startsWith("/(auth)") || pathname?.includes("/login") || pathname?.includes("/register")
  const isDashboard = pathname?.startsWith("/dashboard")

  return (
    <nav className="bg-slate-900 shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-white hidden sm:inline">HR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/roles" className="text-slate-300 hover:text-white transition-colors">
                  Roles
                </Link>
                <Link href="/dashboard/applications" className="text-slate-300 hover:text-white transition-colors">
                  Applications
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-800">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!user ? (
              <>
                <Link href="/" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                  Home
                </Link>
                <Link href="/login" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                  Sign In
                </Link>
                <Link href="/register" className="block px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                  Dashboard
                </Link>
                <Link href="/dashboard/roles" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">
                  Roles
                </Link>
                <Link
                  href="/dashboard/applications"
                  className="block px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                  Applications
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg">
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
