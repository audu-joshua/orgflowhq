import { getSystemStats } from "@/features/admin/actions"
import { Building2, Users, Briefcase, Activity } from "lucide-react"

export default async function AdminDashboardPage() {
    const stats = await getSystemStats()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
                <p className="text-slate-500">Welcome back, Super Admin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    label="Active Tenants"
                    value={stats.tenants}
                    icon={Building2}
                    color="blue"
                />
                <StatsCard
                    label="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="emerald"
                />
                <StatsCard
                    label="Jobs / Campaigns"
                    value={stats.jobs}
                    icon={Briefcase}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
                </div>
                <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Chart Placeholder (Activity)
                </div>
            </div>
        </div>
    )
}

function StatsCard({
    label,
    value,
    icon: Icon,
    color
}: {
    label: string,
    value: number,
    icon: any, // LucideIcon type
    color: "blue" | "emerald" | "purple"
}) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    )
}
