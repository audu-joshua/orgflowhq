"use client"

import { useState } from "react"
import { Mail, Phone, FileText, Calendar, User } from "lucide-react"
import { ApplicantDetailsModal } from "./ApplicantDetailsModal"
import { formatDate } from "@/lib/utils"
import type { Application } from "../types"

interface ApplicationCardProps {
  application: Application & { roles?: { title: string } }
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getInitial = () => {
    if (application.applicant_name) return application.applicant_name[0].toUpperCase()
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
        className="bg-card rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
      >
        <div className="relative h-44">
          {application.applicant_passport ? (
            <img
              src={application.applicant_passport}
              alt={application.applicant_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-5xl">{getInitial()}</span>
            </div>
          )}
          <div className="absolute top-3 right-3 text-right">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-foreground truncate">{application.applicant_name}</h3>
            {application.roles?.title && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                {application.roles.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail size={12} />
              <span className="truncate">{application.applicant_email}</span>
            </div>
            {application.applicant_phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} />
                <span>{application.applicant_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <Calendar size={12} />
              <span>Applied {formatDate(application.created_at)}</span>
            </div>
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
