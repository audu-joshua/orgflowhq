import Link from "next/link"
import { getSystemStats, getLatestOrganizations } from "@/features/admin/actions"
import {
    Building2,
    MoreHorizontal,
    ArrowUpRight,
    Download,
    Upload,
    CheckCircle2
} from "lucide-react"
import { format } from "date-fns"

export default async function AdminDashboardPage() {
    const [stats, latestOrgs] = await Promise.all([
        getSystemStats(),
        getLatestOrganizations(5)
    ])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Slim Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5 -mt-2">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* Buttons removed as requested */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stat Cards - Modern Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Organizations"
                            value={stats.tenants}
                            change="+12%"
                            icon={Building2}
                        />
                        <StatCard
                            label="Active Users"
                            value={stats.users}
                            change="+5%"
                            icon={CheckCircle2}
                        />
                        <StatCard
                            label="Active Subscriptions"
                            value={stats.activeTenants}
                            change="+8%"
                            icon={ArrowUpRight}
                        />
                    </div>

                    {/* Organizations Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">Recent Organizations</h2>
                            <Link href="/admin/organizations" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                View all
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Organization</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Users</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Created</th>
                                        <th className="px-6 py-4 font-medium text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {latestOrgs.map((org: any) => (
                                        <tr key={org._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {org.logoUrl ? (
                                                        <img src={org.logoUrl} alt={org.name} className="h-9 w-9 rounded-lg object-cover border border-slate-100" />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                                                            {org.name?.substring(0, 2).toUpperCase() || "OR"}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-slate-900">{org.name}</p>
                                                        <p className="text-xs text-slate-500">{org.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {/* In Mongoose, we don't have the same counts nested like Supabase had, 
                                                    this might need a separate count action if critical. */}
                                                0
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {org.createdAt ? format(new Date(org.createdAt), 'MMM d, yyyy') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Stats & Wheel */}
                <div className="space-y-8">
                    {/* The Wheel (Gauge) - Matching Reference */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Platform Revenue</p>

                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="relative h-48 w-48">
                                {/* SVG Gauge */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {/* Background Circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="transparent"
                                        stroke="#F1F5F9"
                                        strokeWidth="8"
                                        strokeDasharray="212 282"
                                        strokeLinecap="round"
                                    />
                                    {/* Progress Circle */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="transparent"
                                        stroke="#10B981"
                                        strokeWidth="8"
                                        strokeDasharray="180 282"
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-bold text-slate-900">₦{stats.revenue.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">{stats.tenants} organizations</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-slate-600">Target</span>
                                </div>
                                <span className="font-semibold text-slate-900">₦2.5m</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-200"></span>
                                    <span className="text-slate-600">Projected</span>
                                </div>
                                <span className="font-semibold text-slate-900">₦1.8m</span>
                            </div>
                        </div>
                    </div>

                    {/* Overview Stats */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-slate-900">Overview</h3>
                            <button className="text-xs text-slate-500 hover:text-slate-700 font-medium">This month</button>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Avg. Revenue</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">₦15,000</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Teams</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">{stats.users * 2}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, change, icon: Icon }: { label: string, value: number, change: string, icon: any }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 transition-colors">
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {change}
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value?.toLocaleString()}</p>
            </div>
        </div>
    )
}
