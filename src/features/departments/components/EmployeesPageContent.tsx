"use client"

import { useEffect, useState } from "react"
import { Users, Building2 } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { departmentService } from "../services/departmentService"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { EmployeeCard } from "./EmployeeCard"
import type { Employee, Department } from "../types"

export function EmployeesPageContent() {
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")

  useEffect(() => {
    if (authLoading || !organization) return

    const loadData = async () => {
      try {
        const [emps, depts] = await Promise.all([
          departmentService.getEmployeesByOrganization(organization.id),
          departmentService.getDepartmentsByOrganization(organization.id),
        ])
        setEmployees(emps)
        setDepartments(depts)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [organization, authLoading])

  const refreshEmployees = async () => {
    if (!organization) return
    try {
      const emps = await departmentService.getEmployeesByOrganization(organization.id)
      setEmployees(emps)
    } catch (error) {
      console.error("Failed to refresh employees:", error)
    }
  }

  const filteredEmployees =
    selectedDepartment === "all"
      ? employees
      : employees.filter((emp) => emp.department_id === selectedDepartment)

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Employees</h1>
          <p className="text-muted-foreground mt-1">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description={
            selectedDepartment === "all"
              ? "Add employees to start building your team directory"
              : "No employees in this department yet"
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onDeleted={refreshEmployees} />
          ))}
        </div>
      )}
    </div>
  )
}

