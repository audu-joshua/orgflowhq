import { useState } from "react"
import Link from "next/link"
import { Building, Users, Trash2, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { deleteDepartmentAction } from "../actions"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Department } from "../types"

interface DepartmentCardProps {
  department: Department & { employees?: { count: number }[] }
  onDeleted?: (id: string) => void
}

export function DepartmentCard({ department, onDeleted }: DepartmentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const employeeCount = department.employees?.[0]?.count || 0

  const handleDelete = async () => {
    if (employeeCount > 0) {
      toast.error(`Cannot delete "${department.name}" because it has ${employeeCount} assigned employee${employeeCount !== 1 ? "s" : ""}.`)
      return
    }

    setIsDeleting(true)
    try {
      await deleteDepartmentAction(department.id)
      toast.success("Department deleted successfully")
      onDeleted?.(department.id)
    } catch (error) {
      console.error("Failed to delete department:", error)
      toast.error("Failed to delete department. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative group">
      <Link href={`/dashboard/departments/${department.id}`} className="block h-full">
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all cursor-pointer h-full hover:border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{department.name}</h3>
                {department.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{department.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Users size={16} />
              <span>{employeeCount} staff member{employeeCount !== 1 ? "s" : ""}</span>
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">Created {formatDate(department.created_at)}</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
              title="Delete Department"
            >
              <Trash2 size={18} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-border bg-card/95 backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold">Delete Department?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground font-medium">
                Are you sure you want to delete <span className="text-foreground font-bold">"{department.name}"</span>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-xl border-border cursor-pointer font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer min-w-[120px] flex items-center justify-center font-bold"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Yes, Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

