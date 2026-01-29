"use client"

import { useState } from "react"
import { Trash2, Mail, Phone, Calendar } from "lucide-react"
import { deleteEmployeeAction } from "../actions"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils"
import type { Employee } from "../types"

interface EmployeeListProps {
  employees: Employee[]
  departmentId: string
  onRefresh: () => void
}

export function EmployeeList({ employees, departmentId, onRefresh }: EmployeeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (employeeId: string) => {
    if (!confirm("Are you sure you want to remove this employee?")) return

    setDeletingId(employeeId)
    try {
      await deleteEmployeeAction(employeeId)
      onRefresh()
    } catch (error) {
      console.error("Failed to delete employee:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        title="No staff members"
        description="Add employees to this department to manage your team"
      />
    )
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <div
          key={employee._id}
          className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            {employee.profileImageUrl ? (
              <img
                src={employee.profileImageUrl}
                alt={employee.fullName || "Employee"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {(employee.fullName || employee.email || "E")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {employee.fullName}
              </h3>
              {employee.position && (
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-2">
                {employee.email && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail size={14} />
                    <span>{employee.email}</span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone size={14} />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.hireDate ? (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <button
                      onClick={() => { }}
                      className="cursor-default"
                    >
                      <Calendar size={14} />
                    </button>
                    <span>{formatDate(employee.hireDate)}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <button
              onClick={() => handleDelete(employee._id)}
              disabled={deletingId === employee._id}
              className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {deletingId === employee._id ? (
                <LoadingSpinner />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

