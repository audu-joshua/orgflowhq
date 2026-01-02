"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAppStore } from "@/store/useAppStore"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSidebarCollapsed } = useAppStore()

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        <Sidebar />
        <div
          className={`
                flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? "ml-20" : "ml-64"}
            `}
        >
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
