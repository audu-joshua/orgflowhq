"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { applicationService } from "../services/applicationService"
import { ApplicationTable } from "./ApplicationTable"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Application } from "../types"

export function ApplicationsContent() {
  const router = useRouter()
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<(Application & { roles?: { title: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (authLoading || !organization) return

    const loadApplications = async () => {
      try {
        const data = await applicationService.getApplicationsByOrganization(organization.id)
        setApplications(data)
      } catch (error) {
        console.error("Failed to load applications:", error)
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [organization, authLoading])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Applications</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Applications will appear here once candidates apply for your roles"
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <ApplicationTable applications={filteredApplications} />
        </div>
      )}
    </div>
  )
}
