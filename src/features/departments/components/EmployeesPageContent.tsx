"use client"

import { useEffect, useState } from "react"
import { Users, Building2, Plus } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { getEmployeesByOrganizationAction, getDepartmentsByOrganizationAction } from "../actions"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { EmployeeCard } from "./EmployeeCard"
import { AddEmployeeModal } from "./AddEmployeeModal"
import type { Employee, Department } from "../types"

export function EmployeesPageContent() {
  const { user, organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (authLoading || !organization) return

    const loadData = async () => {
      try {
        const [emps, depts] = await Promise.all([
          getEmployeesByOrganizationAction(organization.id),
          getDepartmentsByOrganizationAction(organization.id),
        ])
        // Filter out Owner if not logged in as Owner
        const filtered = user?.role === 'owner'
          ? emps
          : emps.filter((emp: Employee) => emp.system_role !== 'owner' && emp.position?.toLowerCase() !== 'owner')
        setEmployees(filtered)
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
      const emps = await getEmployeesByOrganizationAction(organization.id)
      // Filter out Owner if not logged in as Owner
      const filtered = user?.role === 'owner'
        ? emps
        : emps.filter((emp: Employee) => emp.system_role !== 'owner' && emp.position?.toLowerCase() !== 'owner')
      setEmployees(filtered)
    } catch (error) {
      console.error("Failed to refresh employees:", error)
    }
  }

  const handleAddSuccess = () => {
    refreshEmployees()
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDepartment === "all" || emp.department_id === selectedDepartment
    const matchesStatus = selectedStatus === "all" || emp.status === selectedStatus
    return matchesDept && matchesStatus
  })

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Team Directory</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your organization's workforce and departments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
            <span className="text-primary font-bold">{filteredEmployees.length}</span>
            <span className="text-primary/70 text-sm ml-2 uppercase tracking-wide font-semibold">
              Results Found
            </span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border text-muted-foreground mr-2">
          <Building2 size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
        </div>

        {/* Departments Dropdown */}
        <div className="w-[200px]">
          <CustomSelect
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={[
              { value: "all", label: "All Departments" },
              ...departments.map(d => ({ value: d.id, label: d.name }))
            ]}
            placeholder="Select Department"
          />
        </div>

        <div className="w-px h-6 bg-border mx-1 hidden md:block" />

        {/* Status */}
        <div className="flex flex-wrap gap-2">
          {["all", "active", "inactive", "terminated"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border uppercase tracking-tight ${selectedStatus === status
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Try adjusting your filters to find who you're looking for."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} onDeleted={refreshEmployees} />
          ))}
        </div>
      )}

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}
