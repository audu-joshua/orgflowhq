"use client"

import { useState } from "react"
import { Mail, Phone, FileText, Calendar } from "lucide-react"
import { ApplicantDetailsModal } from "./ApplicantDetailsModal"
import { formatDate } from "@/lib/utils"
import type { Application } from "../types"

interface ApplicationCardProps {
  application: Application & { roles?: { title: string } }
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getInitial = () => {
    if (application.candidate_name) return application.candidate_name[0].toUpperCase()
    return "A"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "shortlisted":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "interviewed":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
      case "hired":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-card rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-all"
      >
        {application.passport_photo_url ? (
          <img
            src={application.passport_photo_url}
            alt={application.candidate_name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-6xl">{getInitial()}</span>
          </div>
        )}
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground">{application.candidate_name}</h3>
          <p className="text-sm text-muted-foreground truncate">{application.candidate_email}</p>
          {application.roles?.title && (
            <p className="text-xs text-muted-foreground">Role: {application.roles.title}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
            <span className="text-xs text-muted-foreground">{formatDate(application.created_at)}</span>
          </div>
        </div>
      </div>

      <ApplicantDetailsModal
        application={application}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

