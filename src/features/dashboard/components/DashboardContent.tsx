"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { dashboardService } from "../services/dashboardService"
import { RoleCard } from "./RoleCard"
import { StatCard } from "./StatCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Role } from "@/features/roles/types"

export function DashboardContent() {
  const router = useRouter()
  const { user, organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [stats, setStats] = useState({ total: 0, new: 0, shortlisted: 0, interviewed: 0, hired: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user || !organization) {
      router.push("/login")
      return
    }

    const loadData = async () => {
      try {
        const [rolesData, statsData] = await Promise.all([
          dashboardService.getRoles(organization.id),
          dashboardService.getApplicationStats(organization.id),
        ])
        setRoles(rolesData)
        setStats(statsData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, organization, authLoading, router])

  if (authLoading || loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Applications" value={stats.total} />
          <StatCard label="New" value={stats.new} />
          <StatCard label="Shortlisted" value={stats.shortlisted} />
          <StatCard label="Interviewed" value={stats.interviewed} />
          <StatCard label="Hired" value={stats.hired} />
        </div>
      </div>

      {/* Roles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Job Roles</h2>
          <button
            onClick={() => router.push("/dashboard/roles/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
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
    </div>
  )
}
