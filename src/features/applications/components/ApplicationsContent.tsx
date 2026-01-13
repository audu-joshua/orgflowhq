"use client"

import { useEffect, useState } from "react"
import { Users, Loader2, AlertTriangle, XCircle, Copy, Check, Filter } from "lucide-react"
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
import { CustomSelect } from "@/components/ui/CustomSelect"
import type { Application } from "../types"
import type { Role } from "@/features/roles/types"

export function ApplicationsContent() {
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [roles, setRoles] = useState<(Role & { application_count?: number })[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [applications, setApplications] = useState<(Application & { roles?: { title: string } })[]>([])
  const [loading, setLoading] = useState(true)
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

    const loadData = async () => {
      try {
        const [rolesData, appsData] = await Promise.all([
          roleService.getRolesByOrganization(organization.id),
          applicationService.getApplicationsByOrganization(organization.id)
        ])
        setRoles(rolesData)
        setApplications(appsData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [organization, authLoading])

  const filteredApplications = applications.filter((app: Application & { roles?: { title: string } }) =>
    (statusFilter === "all" || app.current_stage === statusFilter) &&
    (selectedRole === "all" || app.role_id === selectedRole)
  )

  const hasHired = filteredApplications.some((app: Application) => app.current_stage === "Hired")
  const hasPending = filteredApplications.some((app: Application) => !["Hired", "Rejected"].includes(app.current_stage || ""))
  // Safety: Only allow bulk reject if a specific role is selected
  const canBulkReject = selectedRole !== "all" && hasPending

  const handleBulkReject = async () => {
    if (selectedRole === "all" || !organization) return

    if (!confirm("Are you sure you want to reject ALL remaining candidates for this position? This will send rejection emails to everyone who hasn't been hired or rejected yet.")) {
      return
    }

    setBulkLoading(true)
    try {
      const result = await bulkRejectRemainingAction(selectedRole, organization.id)
      if (result.success) {
        toast.success(`Successfully rejected ${result.count} candidates`)
        window.location.reload()
      } else {
        toast.error(result.error || "Bulk rejection failed")
      }
    } catch (error) {
      toast.error("Something went wrong during bulk rejection")
    } finally {
      setBulkLoading(false)
    }
  }

  const currentRole = roles.find((r) => r.id === selectedRole)

  const handleCopyLink = () => {
    if (!currentRole) return
    const url = `${window.location.origin}/apply/${currentRole.slug}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success("Job link copied to clipboard")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleStatusUpdate = (applicationId: string, newStage: string) => {
    setApplications((prev) => prev.map((app) =>
      app.id === applicationId
        ? { ...app, current_stage: newStage, status: newStage.toLowerCase() }
        : app
    ))
  }

  const handleDelete = (applicationId: string) => {
    setApplications((prev) => prev.filter(app => app.id !== applicationId))
  }

  if (authLoading || loading) return <LoadingSpinner />

  const roleOptions = [
    { value: "all", label: "All Roles" },
    ...roles.filter(r => r.status === 'open').map(r => ({ value: r.id, label: r.title }))
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage your incoming talent pipeline
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Role Filter */}
          <div className="w-full sm:w-64">
            <CustomSelect
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
              placeholder="Filter by Role"
            />
          </div>

          {/* Share Link (Only visible when specific role selected) */}
          {selectedRole !== "all" && currentRole && (
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            >
              {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-primary" />}
              {isCopied ? "Copied!" : "Share Link"}
            </Button>
          )}

          {/* Bulk Reject (Only visible when role selected AND has pending) */}
          {canBulkReject && (
            <button
              onClick={handleBulkReject}
              disabled={bulkLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Reject Remaining
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((stage) => {
            const count = applications.filter((app) =>
              (stage.id === "all" ? true : app.current_stage === stage.id) &&
              (selectedRole === "all" || app.role_id === selectedRole)
            ).length

            if (count === 0 && stage.id !== 'all') return null

            return (
              <button
                key={stage.id}
                onClick={() => setStatusFilter(stage.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${statusFilter === stage.id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
              >
                {stage.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black transition-colors ${statusFilter === stage.id
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
                  }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        {filteredApplications.length === 0 ? (
          <EmptyState
            title={statusFilter === "all" ? "No applications found" : `No ${statusFilter} applicants`}
            description={
              selectedRole !== "all"
                ? "There are no applicants matching the selected role and filter."
                : "Applications will appear here once candidates apply."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((application) => (
                <motion.div
                  key={application.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
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
    </div>
  )
}
