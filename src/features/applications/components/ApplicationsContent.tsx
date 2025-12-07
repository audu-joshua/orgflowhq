"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { roleService } from "@/features/roles/services/roleService"
import { applicationService } from "../services/applicationService"
import { ApplicationCard } from "./ApplicationCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Application } from "../types"
import type { Role } from "@/features/roles/types"

export function ApplicationsContent() {
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [roles, setRoles] = useState<(Role & { application_count?: number })[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [applications, setApplications] = useState<(Application & { roles?: { title: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !organization) return

    const loadRoles = async () => {
      try {
        const data = await roleService.getRolesByOrganization(organization.id)
        setRoles(data)
      } catch (error) {
        console.error("Failed to load roles:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRoles()
  }, [organization, authLoading])

  useEffect(() => {
    if (!selectedRole || !organization) return

    const loadApplications = async () => {
      try {
        const data = await applicationService.getApplicationsByRole(selectedRole)
        setApplications(data)
      } catch (error) {
        console.error("Failed to load applications:", error)
      }
    }

    loadApplications()
  }, [selectedRole, organization])

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground mt-1">
          {selectedRole ? `${applications.length} applicant${applications.length !== 1 ? "s" : ""} for this role` : "Select a role to view applications"}
        </p>
      </div>

      {!selectedRole ? (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Open Roles</h2>
          {roles.length === 0 ? (
            <EmptyState
              title="No roles yet"
              description="Create roles to start receiving applications"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="bg-card rounded-lg border border-border p-6 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={18} />
                      <span className="text-sm font-medium">{role.application_count || 0}</span>
                    </div>
                  </div>
                  {role.department && (
                    <p className="text-sm text-muted-foreground mb-2">{role.department}</p>
                  )}
                  {role.location && (
                    <p className="text-xs text-muted-foreground">{role.location}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedRole(null)}
            className="text-primary hover:text-primary/90 font-medium"
          >
            ← Back to Roles
          </button>

          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Applications will appear here once candidates apply for this role"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {applications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
