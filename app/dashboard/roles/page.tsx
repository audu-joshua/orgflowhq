"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { dashboardService } from "@/features/dashboard/services/dashboardService"
import { RoleCard } from "@/features/dashboard/components/RoleCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Role } from "@/features/roles/types"

export default function RolesPage() {
  const router = useRouter()
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

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

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Job Roles</h1>
        <button
          onClick={() => router.push("/dashboard/roles/new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

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
