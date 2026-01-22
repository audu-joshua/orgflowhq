"use client"

import { useState } from "react"
import { Mail, Phone, Calendar, User, Trash2, Edit2 } from "lucide-react"
import { EmployeeModal } from "./EmployeeModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { EditEmployeeModal } from "./EditEmployeeModal"
import { departmentService } from "../services/departmentService"
import { formatDate } from "@/lib/utils"
import type { Employee } from "../types"

interface EmployeeCardProps {
  employee: Employee
  onDeleted?: () => void
}

export function EmployeeCard({ employee, onDeleted }: EmployeeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getInitial = () => {
    if (employee.full_name) return employee.full_name[0].toUpperCase()
    if (employee.email) return employee.email[0].toUpperCase()
    return "E"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600 text-white"
      case "invited":
        return "bg-blue-600 text-white"
      case "inactive":
        return "bg-amber-500 text-white"
      case "terminated":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await departmentService.deleteEmployee(employee.id)
      onDeleted?.()
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Failed to delete employee:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-all group relative"
      >
        {/* Top Image Section */}
        <div className="relative h-44 overflow-hidden">
          {employee.profile_image_url ? (
            <img
              src={employee.profile_image_url}
              alt={employee.full_name || "Employee"}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${employee.status === 'inactive' ? 'grayscale' : ''} ${employee.status === 'terminated' ? 'grayscale contrast-125' : ''}`}
            />
          ) : (
            <div className={`w-full h-full bg-primary/10 flex items-center justify-center ${employee.status === 'inactive' ? 'grayscale' : ''} ${employee.status === 'terminated' ? 'bg-destructive/10' : ''}`}>
              <span className={`text-primary font-bold text-5xl ${employee.status === 'terminated' ? 'text-destructive' : ''}`}>{getInitial()}</span>
            </div>
          )}

          {/* Terminated Overlay */}
          {employee.status === 'terminated' && (
            <div className="absolute inset-0 bg-destructive/20 mix-blend-multiply" />
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md shadow-black/30 border-2 border-background/20 ${getStatusColor(employee.status)}`}>
              {employee.status}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-foreground truncate text-base group-hover:text-primary transition-colors">
              {employee.full_name || "No name"}
            </h3>
            {employee.position && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                {employee.position}
              </p>
            )}
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone size={12} className="shrink-0" />
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.hire_date && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <Calendar size={12} className="shrink-0" />
                <span>Hired {formatDate(employee.hire_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Hover Overlay) */}
        <div className="absolute top-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditModalOpen(true)
            }}
            className="p-2 rounded-full bg-background/80 text-foreground hover:text-primary border border-border/50 backdrop-blur-sm shadow-sm transition-colors"
            title="Edit details"
          >
            <Edit2 size={14} />
          </button>
          {employee.system_role !== 'owner' && employee.position?.toLowerCase() !== 'owner' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteModalOpen(true)
              }}
              className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 backdrop-blur-sm shadow-sm transition-colors"
              title="Delete employee"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <EmployeeModal
        employee={employee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeleted={onDeleted}
      />

      <EditEmployeeModal
        employee={employee}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onDeleted!}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        description="Are you sure you want to remove this employee? This action cannot be undone."
      />
    </>
  )
}
