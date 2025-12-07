import Link from "next/link"
import { Briefcase, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Role } from "@/features/roles/types"

interface RoleCardProps {
  role: Role
}

export function RoleCard({ role }: RoleCardProps) {
  return (
    <Link href={`/dashboard/roles/${role.id}`}>
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{role.title}</h3>
              <p className="text-sm text-muted-foreground">{role.department}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>{formatDate(role.created_at)}</span>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{role.application_count || 0}</span> applications
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
