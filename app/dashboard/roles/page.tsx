"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Power, PowerOff, Loader2 } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { dashboardService } from "@/features/dashboard/services/dashboardService"
import { RoleCard } from "@/features/dashboard/components/RoleCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Role } from "@/features/roles/types"
import { MigrationHelper } from "@/components/admin/MigrationHelper"
import { roleService } from "@/features/roles/services/roleService"
import { toast } from "sonner"

export default function RolesPage() {
  const router = useRouter()
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [roles, setRoles] = useState<(Role & { application_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<Role["status"] | null>(null)

  useEffect(() => {
    if (authLoading || !organization) return

    const loadRoles = async () => {
      try {
        const data = await dashboardService.getRoles(organization.id)
        setRoles(data)
      } catch (error) {
        console.error("Failed to load roles:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRoles()
  }, [organization, authLoading])

  const handleBulkStatusUpdate = async (status: Role["status"]) => {
    if (!organization) return
    setUpdatingStatus(status)

    try {
      await roleService.updateAllRolesStatus(organization.id, status)
      // Refresh the roles list
      const updatedRoles = await dashboardService.getRoles(organization.id)
      setRoles(updatedRoles)
      toast.success(`All roles ${status === "active" ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Bulk update failed:", error)
      toast.error(`Failed to ${status === "active" ? "activate" : "deactivate"} all roles`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">Job Roles</h1>
        <div className="flex flex-wrap items-center gap-2">
          {roles.length > 0 && (
            <>
              <button
                disabled={!!updatingStatus}
                onClick={() => handleBulkStatusUpdate("active")}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/20 transition-colors font-medium disabled:opacity-50 cursor-pointer min-w-[140px] justify-center"
              >
                {updatingStatus === "active" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Power size={18} />
                    Activate All
                  </>
                )}
              </button>
              <button
                disabled={!!updatingStatus}
                onClick={() => handleBulkStatusUpdate("closed")}
                className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium disabled:opacity-50 cursor-pointer min-w-[150px] justify-center"
              >
                {updatingStatus === "closed" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <PowerOff size={18} />
                    Deactivate All
                  </>
                )}
              </button>
            </>
          )}
          <button
            onClick={() => router.push("/dashboard/roles/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={20} />
            Create Role
          </button>
        </div>
      </div>

      {/* <MigrationHelper /> */}

      {roles.length === 0 ? (
        <EmptyState
          title="No roles yet"
          description="Create your first job role to start accepting applications"
          action={{
            label: "Create Role",
            onClick: () => router.push("/dashboard/roles/new"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  )
}
