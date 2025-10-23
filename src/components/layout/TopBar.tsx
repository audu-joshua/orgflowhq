"use client"

import { useAppStore } from "@/store/useAppStore"
import { User } from "lucide-react"

export function TopBar() {
  const { user } = useAppStore()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
