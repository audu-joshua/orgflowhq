"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { departmentService } from "../services/departmentService"
import { DepartmentCard } from "./DepartmentCard"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { EOTMManager } from "./EOTMManager"
import type { Department } from "../types"

export function DepartmentsContent() {
  const { organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getDepartmentsByOrganization(organization!.id)
      setDepartments(data)
    } catch (error) {
      console.error("Failed to load departments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !organization) return
    loadDepartments()
  }, [organization, authLoading])

  const handleDepartmentCreated = () => {
    loadDepartments()
  }

  const handleDeleted = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id))
    // Silent background refresh to ensure consistency
    loadDepartments()
  }

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={20} />
            Add Departments
          </button>
        </div>

        <EOTMManager />

        {departments.length === 0 ? (
          <EmptyState
            title="No departments yet"
            description="Create your first department to organize your team"
            action={{
              label: "Add Department",
              onClick: () => setIsModalOpen(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDepartmentCreated}
      />
    </>
  )
}

