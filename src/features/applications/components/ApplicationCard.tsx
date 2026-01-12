"use client"

import { useRouter } from "next/navigation"
import { Mail, Phone, Calendar, Check, X, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Application } from "../types"
import { useState } from "react"
import { StatusActionModal } from "./StatusActionModal"
import { updateApplicationStatusAction, deleteApplicationAction } from "../actions"
import { toast } from "sonner"
import { useAppStore } from "@/store/useAppStore"
import { ConfirmationModal } from "@/components/ui/ConfirmationModal"

interface ApplicationCardProps {
  application: Application & { roles?: { title: string } }
  onStatusUpdate?: (applicationId: string, newStage: string) => void
  onDelete?: (applicationId: string) => void
}

export function ApplicationCard({ application, onStatusUpdate, onDelete }: ApplicationCardProps) {
  const router = useRouter()
  const { organization } = useAppStore()
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [actionType, setActionType] = useState<"hired" | "rejected">("hired")
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const getInitial = () => {
    if (application.applicant_name) return application.applicant_name[0].toUpperCase()
    return "A"
  }

  const getStatusColor = (stage: string) => {
    const s = (stage || "New").toLowerCase()
    // Using deep solid colors with backdrop blur for a premium look
    if (s.includes("new")) return "bg-blue-600 text-white border-blue-400/30 shadow-blue-500/20"
    if (s.includes("shortlist")) return "bg-indigo-600 text-white border-indigo-400/30 shadow-indigo-500/20"
    if (s.includes("scheduled")) return "bg-amber-600 text-white border-amber-400/30 shadow-amber-500/20"
    if (s.includes("completed") || s.includes("interviewed")) return "bg-teal-600 text-white border-teal-400/30 shadow-teal-500/20"
    if (s.includes("hire")) return "bg-emerald-600 text-white border-emerald-400/30 shadow-emerald-500/20"
    if (s.includes("reject")) return "bg-rose-600 text-white border-rose-400/30 shadow-rose-500/20"
    return "bg-slate-700 text-white border-slate-500/30 shadow-slate-500/20"
  }

  const handleStatusChange = async () => {
    if (!organization) return
    setStatusLoading(true)
    try {
      const result = await updateApplicationStatusAction(
        application.id,
        actionType === "hired" ? "Hired" : "Rejected",
        organization.id
      )
      if (result.success) {
        toast.success(`${application.applicant_name} marked as ${actionType === "hired" ? "Hired" : "Rejected"}`)
        if (onStatusUpdate) {
          onStatusUpdate(application.id, actionType === "hired" ? "Hired" : "Rejected")
        }
        setShowStatusModal(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(application.id)
    }
    setShowDeleteModal(false)

    try {
      const result = await deleteApplicationAction(application.id)
      if (result.success) {
        toast.success("Applicant deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete applicant")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong during deletion")
      router.refresh()
    }
  }

  const currentStage = application.current_stage || application.status || "New"

  return (
    <div
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        {application.applicant_passport ? (
          <img
            src={application.applicant_passport}
            alt={application.applicant_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <span className="text-primary font-bold text-5xl group-hover:scale-110 transition-transform duration-500">{getInitial()}</span>
          </div>
        )}

        {/* Status Badge in corner */}
        <div className="absolute top-3 right-3 z-20 scale-90 origin-top-right transition-transform group-hover:scale-75">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg border backdrop-blur-md ${getStatusColor(currentStage)}`}>
            {currentStage}
          </span>
        </div>

        {/* Delete Button - Fixed Top Left */}
        <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteModal(true)
            }}
            disabled={deleteLoading}
            className="p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-md shadow-lg backdrop-blur-sm transition-all cursor-pointer disabled:opacity-50"
            title="Delete Applicant"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Global Cover Overlay - Enhanced Blur and Darken */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 group-hover:backdrop-blur-[2px] transition-all duration-300 z-10" />

        {/* Quick Action Overlay - Centralized and Enlarged */}
        {!currentStage.includes("Hired") && !currentStage.includes("Rejected") && (
          <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none group-hover:pointer-events-auto">
            {/* For touch devices where hover isn't available, we can also show these or handle via separate UI, 
                but centering and making them big is a major improvement for tap targets */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActionType("hired")
                setShowStatusModal(true)
              }}
              className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-90 transition-all duration-300 translate-y-4 group-hover:translate-y-0 cursor-pointer"
              title="Accept Candidate"
            >
              <Check size={28} strokeWidth={3} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setActionType("rejected")
                setShowStatusModal(true)
              }}
              className="w-14 h-14 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-2xl hover:bg-rose-600 hover:text-white hover:scale-110 active:scale-90 transition-all duration-300 translate-y-4 group-hover:translate-y-0 cursor-pointer"
              title="Reject Candidate"
            >
              <X size={28} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Support for devices with NO HOVER (Tablets/Phones) */}
        {!currentStage.includes("Hired") && !currentStage.includes("Rejected") && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3 lg:hidden z-20">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex gap-3 border border-border/50 shadow-sm font-black text-[10px] uppercase text-slate-500 tracking-tighter">
              Tap to Manage
            </div>
          </div>
        )}
      </div>

      <div
        onClick={() => router.push(`/dashboard/applications/${application.id}`)}
        className="p-4 space-y-3 cursor-pointer flex-1"
      >
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
            <Calendar size={12} />
            <span>Applied {formatDate(application.created_at)}</span>
          </div>
        </div>
      </div>

      <StatusActionModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusChange}
        action={actionType}
        candidateName={application.applicant_name}
        loading={statusLoading}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Applicant"
        description={`Are you sure you want to delete ${application.applicant_name}? This action will permanently remove their application record and cannot be undone.`}
        confirmText="Yes, Delete Applicant"
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  )
}
