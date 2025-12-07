"use client"

import { useState } from "react"
import { X, Mail, FileText, Phone, Send } from "lucide-react"
import { applicationService } from "../services/applicationService"
import { APPLICATION_STATUS, STATUS_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { Application } from "../types"

interface ApplicantDetailsModalProps {
  application: Application & { roles?: { title: string } }
  isOpen: boolean
  onClose: () => void
}

export function ApplicantDetailsModal({ application, isOpen, onClose }: ApplicantDetailsModalProps) {
  const [status, setStatus] = useState(application.status)
  const [updating, setUpdating] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  if (!isOpen) return null

  const handleStatusUpdate = async (newStatus: Application["status"]) => {
    setUpdating(true)
    try {
      await applicationService.updateApplicationStatus(application.id, newStatus)
      setStatus(newStatus)
      window.location.reload()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${application.candidate_email}?subject=${encodeURIComponent(emailSubject || `Update on your application for ${application.roles?.title || 'position'}`)}&body=${encodeURIComponent(emailBody || 'Dear ' + application.candidate_name + ',')}`
    window.location.href = mailtoLink
  }

  const getStatusColor = (stat: string) => {
    switch (stat) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {application.passport_photo_url ? (
                <img
                  src={application.passport_photo_url}
                  alt={application.candidate_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-3xl">{application.candidate_name[0].toUpperCase()}</span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{application.candidate_name}</h2>
                <p className="text-muted-foreground">{application.candidate_email}</p>
                {application.roles?.title && (
                  <p className="text-sm text-muted-foreground mt-1">Applied for: {application.roles.title}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Update Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusUpdate(e.target.value as Application["status"])}
              disabled={updating}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            >
              {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileText size={16} />
                Cover Letter
              </label>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            </div>
          )}

          {/* Resume and Email Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {application.resume_url && (
              <a
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <FileText size={20} className="text-primary" />
                <span className="text-foreground font-medium">View Resume</span>
              </a>
            )}
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="flex items-center gap-3 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Send size={20} className="text-primary" />
              <span className="text-foreground font-medium">Send Email</span>
            </button>
          </div>

          {/* Email Form */}
          {showEmailForm && (
            <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground"
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email message..."
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground resize-none"
              />
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Open Email Client
              </button>
            </div>
          )}

          {/* Application Date */}
          <div className="text-sm text-muted-foreground">
            Applied on {formatDate(application.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}

