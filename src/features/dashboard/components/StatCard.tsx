import type React from "react"
interface StatCardProps {
  label: string
  value: number
  icon?: React.ReactNode
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
    </div>
  )
}
