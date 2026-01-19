"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Briefcase, Calendar, Power, PowerOff, Loader2, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { roleService } from "@/features/roles/services/roleService"
import type { Role } from "@/features/roles/types"
import { toast } from "@/lib/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoleCardProps {
  role: Role & { application_count?: number }
  onDeleted?: (roleId: string) => void
}

export function RoleCard({ role: initialRole, onDeleted }: RoleCardProps) {
  const [role, setRole] = useState(initialRole)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Sync state with props for bulk updates
  useEffect(() => {
    setRole(initialRole)
  }, [initialRole])

  const isClosed = role.status === "closed"

  const toggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newStatus = isClosed ? "active" : "closed"
    setIsUpdating(true)

    try {
      const updatedRole = await roleService.updateRoleStatus(role.id, newStatus)
      setRole(updatedRole)
      toast.success(`Role ${newStatus === "active" ? "activated" : "closed"}`, {
        description: `${role.title} is now ${newStatus}.`,
      })
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update role status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await roleService.deleteRole(role.id)
      toast.success("Role deleted successfully", {
        description: `${role.title} has been removed.`,
      })

      if (onDeleted) {
        onDeleted(role.id)
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to delete role:", error)
      toast.error("Failed to delete role")
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      <Link href={`/dashboard/roles/${role.id}`}>
        <div className={`bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all cursor-pointer h-full relative group ${isClosed ? 'opacity-75 grayscale-[0.5]' : ''}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isClosed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.department}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={toggleStatus}
                disabled={isUpdating}
                className={`p-2 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center ${isClosed
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                  }`}
                title={isClosed ? "Activate Role" : "Close Role"}
              >
                {isUpdating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  isClosed ? <PowerOff size={18} /> : <Power size={18} />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowDeleteModal(true)
                }}
                disabled={isDeleting}
                className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center"
                title="Delete Role"
              >
                {isDeleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>


          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>{formatDate(role.created_at)}</span>
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{role.application_count || 0}</span> applications
              </p>
            </div>
          </div>
        </div>
      </Link>

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="rounded-2xl border-border bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Delete this role?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. All associated data and applications will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl border-border cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
