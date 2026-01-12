"use client"

import { useEffect, useState } from "react"
import { Users, Loader2, AlertTriangle, XCircle, Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { roleService } from "@/features/roles/services/roleService"
import { applicationService } from "../services/applicationService"
import { bulkRejectRemainingAction } from "../actions"
import { toast } from "sonner"
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
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const stages = [
    { id: "all", label: "All" },
    { id: "New", label: "New" },
    { id: "Shortlisted", label: "Shortlisted" },
    { id: "Interview Scheduled", label: "Scheduled" },
    { id: "Interview Completed", label: "Interviewed" },
    { id: "Hired", label: "Hired" },
    { id: "Rejected", label: "Rejected" }
  ]

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
      setLoadingApplications(true)
      try {
        const data = await applicationService.getApplicationsByRole(selectedRole)
        setApplications(data)
      } catch (error) {
        console.error("Failed to load applications:", error)
      } finally {
        setLoadingApplications(false)
      }
    }

    loadApplications()
  }, [selectedRole, organization])

  const filteredApplications = applications.filter((app: Application & { roles?: { title: string } }) =>
    statusFilter === "all" || app.current_stage === statusFilter
  )

  const hasHired = applications.some((app: Application) => app.current_stage === "Hired")
  const hasPending = applications.some((app: Application) => !["Hired", "Rejected"].includes(app.current_stage || ""))

  const handleBulkReject = async () => {
    if (!selectedRole || !organization) return

    if (!confirm("Are you sure you want to reject ALL remaining candidates for this position? This will send rejection emails to everyone who hasn't been hired or rejected yet.")) {
      return
    }

    setBulkLoading(true)
    try {
      const result = await bulkRejectRemainingAction(selectedRole, organization.id)
      if (result.success) {
        toast.success(`Successfully rejected ${result.count} candidates`)
        window.location.reload() // Refresh to update all cards and counts
      } else {
        toast.error(result.error || "Bulk rejection failed")
      }
    } catch (error) {
      toast.error("Something went wrong during bulk rejection")
    } finally {
      setBulkLoading(false)
    }
  }

  const currentRole = roles.find((r: Role & { application_count?: number }) => r.id === selectedRole)

  const handleCopyLink = () => {
    if (!currentRole) return
    const url = `${window.location.origin}/apply/${currentRole.slug}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success("Job link copied to clipboard")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleStatusUpdate = (applicationId: string, newStage: string) => {
    setApplications((prev: (Application & { roles?: { title: string } })[]) => prev.map((app: Application & { roles?: { title: string } }) =>
      app.id === applicationId
        ? { ...app, current_stage: newStage, status: newStage.toLowerCase() }
        : app
    ))
  }

  const handleDelete = (applicationId: string) => {
    setApplications((prev) => prev.filter(app => app.id !== applicationId))
  }

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Applications
            {selectedRole && currentRole && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 text-xs font-semibold cursor-pointer border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={handleCopyLink}
              >
                {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-primary" />}
                <span className={isCopied ? "text-green-600" : "text-foreground"}>
                  {isCopied ? "Copied!" : "Share Role Link"}
                </span>
              </Button>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedRole ? `${applications.length} applicant${applications.length !== 1 ? "s" : ""} for this role` : "Select a role to view applications"}
          </p>
        </div>
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
              {roles.map((role: Role & { application_count?: number }) => {
                const isClosed = role.status === 'closed'
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`bg-card rounded-lg border border-border p-6 cursor-pointer hover:shadow-lg transition-all relative group ${isClosed ? 'opacity-75 grayscale-[0.5]' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{role.title}</h3>
                        {role.department && (
                          <p className="text-sm text-muted-foreground">{role.department}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={16} />
                          <span className="text-sm font-medium">{role.application_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    {role.location && (
                      <p className="text-xs text-muted-foreground mt-2">{role.location}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/10 pb-4">
            <button
              onClick={() => setSelectedRole(null)}
              className="group text-sm font-bold text-primary flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Roles
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3 px-1">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setStatusFilter(stage.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border-2 flex items-center gap-2.5 ${statusFilter === stage.id
                    ? "bg-primary text-white border-primary shadow-lg scale-105"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                >
                  {stage.label}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${statusFilter === stage.id
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                    }`}>
                    {applications.filter((app: Application) => (stage.id === "all" ? true : app.current_stage === stage.id)).length}
                  </span>
                </button>
              ))}
            </div>

            {hasHired && hasPending && (
              <button
                onClick={handleBulkReject}
                disabled={bulkLoading}
                className="flex items-center justify-center gap-2.5 px-6 py-2.5 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-full text-xs font-black hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject Remaining
              </button>
            )}
          </div>

          {loadingApplications ? (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
              <span className="ml-2 text-muted-foreground">Loading applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title={statusFilter === "all" ? "No applications yet" : `No ${statusFilter} applicants`}
              description={statusFilter === "all"
                ? "Applications will appear here once candidates apply for this role"
                : `There are currently no candidates in the ${statusFilter} stage.`
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredApplications.map((application: Application & { roles?: { title: string } }) => (
                  <motion.div
                    key={application.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
