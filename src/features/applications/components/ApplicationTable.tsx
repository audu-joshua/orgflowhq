"use client"

import { useState } from "react"
import { Trash2, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { applicationService } from "../services/applicationService"
import { APPLICATION_STATUS, STATUS_LABELS } from "@/lib/constants"
import type { Application } from "../types"

interface ApplicationTableProps {
  applications: (Application & { roles?: { title: string } })[]
  onApplicationDeleted?: (applicationId: string) => void
}

export function ApplicationTable({ applications, onApplicationDeleted }: ApplicationTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusChange = async (applicationId: string, newStatus: Application["status"]) => {
    setUpdating(applicationId)
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus)
      // Trigger parent refresh
      window.location.reload()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      await applicationService.deleteApplication(applicationId)
      onApplicationDeleted?.(applicationId)
      window.location.reload()
    } catch (error) {
      console.error("Failed to delete application:", error)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Candidate</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applied</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{app.candidate_name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{app.candidate_email}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{app.roles?.title || "Unknown"}</td>
              <td className="px-6 py-4">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as Application["status"])}
                  disabled={updating === app.id}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(app.created_at)}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  {app.resume_url && (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download size={18} />
                    </a>
                  )}
                  <button onClick={() => handleDelete(app.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
