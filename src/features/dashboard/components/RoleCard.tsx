"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Briefcase, Calendar, Power, PowerOff, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { roleService } from "@/features/roles/services/roleService"
import type { Role } from "@/features/roles/types"
import { toast } from "@/lib/toast"

interface RoleCardProps {
  role: Role & { application_count?: number }
}

export function RoleCard({ role: initialRole }: RoleCardProps) {
  const [role, setRole] = useState(initialRole)
  const [isUpdating, setIsUpdating] = useState(false)

  // Sync state with props for bulk updates
  useEffect(() => {
    setRole(initialRole)
  }, [initialRole])

  const isClosed = role.status === "closed"

  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newStatus = isClosed ? "active" : "closed"
    setIsUpdating(true)

    try {
      const updatedRole = await roleService.updateRoleStatus(role.id, newStatus)
      setRole(updatedRole)
      toast.success(`Role ${newStatus === "active" ? "activated" : "closed"}`, {
        description: `${role.title} is now ${newStatus}.`,
      })
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update role status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Link href={`/dashboard/roles/${role.id}`}>
      <div className={`bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all cursor-pointer h-full relative group ${isClosed ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isClosed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{role.title}</h3>
              <p className="text-sm text-muted-foreground">{role.department}</p>
            </div>
          </div>

          <button
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`p-2 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center ${isClosed
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
              }`}
            title={isClosed ? "Activate Role" : "Close Role"}
          >
            {isUpdating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              isClosed ? <PowerOff size={18} /> : <Power size={18} />
            )}
          </button>
        </div>


        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>{formatDate(role.created_at)}</span>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{role.application_count || 0}</span> applications
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
