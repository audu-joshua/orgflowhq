"use client"

import { useState } from "react"
import { X, Mail, Phone, Calendar, Building, User, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { departmentService } from "../services/departmentService"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import type { Employee } from "../types"

interface EmployeeModalProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function EmployeeModal({ employee, isOpen, onClose, onDeleted }: EmployeeModalProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await departmentService.deleteEmployee(employee.id)
      onDeleted?.()
      onClose()
    } catch (error) {
      console.error("Failed to delete employee:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  const getInitial = () => {
    if (employee.full_name) return employee.full_name[0].toUpperCase()
    if (employee.email) return employee.email[0].toUpperCase()
    return "E"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {employee.profile_image_url ? (
              <img
                src={employee.profile_image_url}
                alt={employee.full_name || "Employee"}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-3xl">{getInitial()}</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{employee.full_name || "No name"}</h2>
              {employee.position && (
                <p className="text-muted-foreground">{employee.position}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
              title="Delete employee"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {employee.email && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail size={20} />
              <span className="text-foreground">{employee.email}</span>
            </div>
          )}

          {employee.phone && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone size={20} />
              <span className="text-foreground">{employee.phone}</span>
            </div>
          )}

          {employee.employee_id && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <User size={20} />
              <div>
                <p className="text-xs">Employee ID</p>
                <p className="text-foreground font-medium">{employee.employee_id}</p>
              </div>
            </div>
          )}

          {employee.hire_date && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar size={20} />
              <div>
                <p className="text-xs">Hire Date</p>
                <p className="text-foreground font-medium">{formatDate(employee.hire_date)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-muted-foreground">
            <Building size={20} />
            <div>
              <p className="text-xs">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                employee.status === "active"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : employee.status === "inactive"
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "bg-destructive/10 text-destructive"
              }`}>
                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Employee"
          description="Are you sure you want to remove this employee? This action cannot be undone."
        />
      </div>
    </div>
  )
}

