"use client"

import { useState } from "react"
import { X, Mail, FileText, Phone, Send, ExternalLink, Download, User, Calendar, ZoomIn } from "lucide-react"
import { applicationService } from "../services/applicationService"
import { DocumentViewerModal } from "./DocumentViewerModal"
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null)
  const [activeDocTitle, setActiveDocTitle] = useState("")

  if (!isOpen) return null

  const handleStatusUpdate = async (newStatus: Application["status"]) => {
    setUpdating(true)
    try {
      await applicationService.updateApplicationStatus(application.id, newStatus)
      setStatus(newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${application.applicant_email}?subject=${encodeURIComponent(emailSubject || `Update on your application for ${application.roles?.title || 'position'}`)}&body=${encodeURIComponent(emailBody || 'Dear ' + application.applicant_name + ',')}`
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

  const documentSections = [
    { label: "Resume", url: application.resume_url, icon: FileText },
    { label: "Cover Letter", url: application.cover_letter, icon: FileText },
  ].filter(doc => doc.url)

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-start justify-between bg-muted/30">
            <div className="flex items-center gap-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => application.applicant_passport && setIsLightboxOpen(true)}
              >
                {application.applicant_passport ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border shadow-sm">
                    <img
                      src={application.applicant_passport}
                      alt={application.applicant_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider">View</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20">
                    <span className="text-primary font-bold text-3xl">{application.applicant_name?.[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-1">{application.applicant_name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail size={14} />{application.applicant_email}</span>
                  {application.applicant_phone && (
                    <span className="flex items-center gap-1.5"><Phone size={14} />{application.applicant_phone}</span>
                  )}
                  <span className="flex items-center gap-1.5"><Calendar size={14} />{formatDate(application.created_at)}</span>
                </div>
                {application.roles?.title && (
                  <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase tracking-wider">
                    {application.roles.title}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Actions and Status */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Application Status</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => handleStatusUpdate(e.target.value as Application["status"])}
                      disabled={updating}
                      className="w-full pl-4 pr-10 py-3 border border-border rounded-xl bg-background text-foreground font-medium focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all disabled:opacity-50"
                    >
                      {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                        <option key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <Download size={16} className="rotate-180" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Quick Actions</label>
                  <button
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl transition-all font-semibold"
                  >
                    <span className="flex items-center gap-2"><Send size={18} /> Send Message</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Right Column - Documents */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Applicant Documents</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documentSections.map((doc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveDocUrl(doc.url ?? null)
                          setActiveDocTitle(`${application.applicant_name}'s ${doc.label}`)
                        }}
                        className="group flex flex-col p-4 border border-border rounded-xl bg-muted/20 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-background rounded-lg border border-border group-hover:text-primary transition-colors">
                            <doc.icon size={20} />
                          </div>
                          <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-bold text-foreground">{doc.label}</span>
                        <span className="text-[10px] text-muted-foreground uppercase mt-1">Click to view in-app</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Form */}
                {showEmailForm && (
                  <div className="border border-border rounded-xl p-6 space-y-4 bg-muted/10 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-foreground">Message Candidate</h3>
                      <button onClick={() => setShowEmailForm(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject line..."
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your message here..."
                      rows={5}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      onClick={handleSendEmail}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20"
                    >
                      Open Email Client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for Passport Photo */}
      {isLightboxOpen && application.applicant_passport && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-full max-h-full animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-4 -right-4 z-10 p-2 bg-card text-foreground rounded-full shadow-xl border border-border hover:scale-110 transition-transform"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X size={20} />
            </button>
            <img
              src={application.applicant_passport}
              alt={application.applicant_name}
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-2 border-border"
            />
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!activeDocUrl}
        url={activeDocUrl}
        title={activeDocTitle}
        onClose={() => setActiveDocUrl(null)}
        applicantEmail={application.applicant_email}
      />
    </>
  )
}
