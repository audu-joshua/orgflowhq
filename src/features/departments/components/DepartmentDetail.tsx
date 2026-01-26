"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { getDepartmentByIdAction, getEmployeesByDepartmentAction, deleteDepartmentAction } from "../actions"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { AddEmployeeModal } from "./AddEmployeeModal"
import { EmployeeList } from "./EmployeeList"
import type { Department, Employee } from "../types"

interface DepartmentDetailProps {
  departmentId: string
}

export function DepartmentDetail({ departmentId }: DepartmentDetailProps) {
  const router = useRouter()
  const [department, setDepartment] = useState<Department | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const dept = await getDepartmentByIdAction(departmentId)
        setDepartment(dept as any)
        const emps = await getEmployeesByDepartmentAction(departmentId)
        setEmployees(emps as any)
      } catch (error) {
        console.error("Failed to load department:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [departmentId])

  const handleDeleteDepartment = async () => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      await deleteDepartmentAction(departmentId)
      router.push("/dashboard/departments")
    } catch (error) {
      console.error("Failed to delete department:", error)
    }
  }

  const handleRefresh = async () => {
    try {
      const emps = await getEmployeesByDepartmentAction(departmentId)
      setEmployees(emps as any)
    } catch (error) {
      console.error("Failed to refresh employees:", error)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!department) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Department not found
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{department.name}</h1>
              {department.description && (
                <p className="text-muted-foreground mt-2">{department.description}</p>
              )}
            </div>
            <button
              onClick={handleDeleteDepartment}
              className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Staff Members</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Employee
            </button>
          </div>

          <EmployeeList employees={employees} departmentId={departmentId} onRefresh={handleRefresh} />
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departmentId={department._id}
        onSuccess={handleRefresh}
      />
    </>
  )
}

