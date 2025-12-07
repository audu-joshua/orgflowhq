import type React from "react"
interface StatCardProps {
  label: string
  value: number
  icon?: React.ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
    </div>
  )
}
