import Link from "next/link"
import { Building, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Department } from "../types"

interface DepartmentCardProps {
  department: Department & { employees?: { count: number }[] }
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const employeeCount = department.employees?.[0]?.count || 0

  return (
    <Link href={`/dashboard/departments/${department.id}`}>
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            <span>{employeeCount} staff member{employeeCount !== 1 ? "s" : ""}</span>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Created {formatDate(department.created_at)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

