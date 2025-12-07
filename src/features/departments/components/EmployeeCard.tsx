"use client"

import { useState } from "react"
import { Mail, Phone, Trash2 } from "lucide-react"
import { EmployeeModal } from "./EmployeeModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { departmentService } from "../services/departmentService"
import type { Employee } from "../types"

interface EmployeeCardProps {
  employee: Employee
  onDeleted?: () => void
}

export function EmployeeCard({ employee, onDeleted }: EmployeeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getInitial = () => {
    if (employee.full_name) return employee.full_name[0].toUpperCase()
    if (employee.email) return employee.email[0].toUpperCase()
    return "E"
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
        className="group relative aspect-square bg-card rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      >
        {/* Image or Initial */}
        <div className="h-[calc(100%-60px)] overflow-hidden">
          {employee.profile_image_url ? (
            <img
              src={employee.profile_image_url}
              alt={employee.full_name || "Employee"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-5xl">{getInitial()}</span>
            </div>
          )}
        </div>
        
        {/* Name at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm p-3 border-t border-border">
          <h3 className="font-semibold text-foreground truncate text-sm">{employee.full_name || "No name"}</h3>
          {employee.position && (
            <p className="text-muted-foreground truncate text-xs">{employee.position}</p>
          )}
        </div>
        
        {/* Dark overlay on hover with details */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center px-4">
          <h3 className="text-lg font-semibold text-white mb-1 text-center">{employee.full_name || "No name"}</h3>
          {employee.position && (
            <p className="text-white/80 text-sm mb-4 text-center">{employee.position}</p>
          )}
          <div className="space-y-2 text-center">
            {employee.email && (
              <div className="flex items-center justify-center gap-2 text-white">
                <Mail size={12} />
                <span className="text-[10px]">{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center justify-center gap-2 text-white">
                <Phone size={12} />
                <span className="text-[10px]">{employee.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsDeleteModalOpen(true)
          }}
          className="absolute top-2 right-2 text-white hover:bg-white/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm"
          title="Delete employee"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <EmployeeModal employee={employee} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDeleted={onDeleted} />
      
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

