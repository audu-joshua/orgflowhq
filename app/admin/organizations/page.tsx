import Link from "next/link"
import { getAllTenants, getSystemStats } from "@/features/admin/actions"
import {
    Building2,
    Search,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    CheckCircle2,
    Users
} from "lucide-react"

export default async function OrganizationsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const { page: searchPage } = await searchParams
    const page = Number(searchPage) || 1
    const pageSize = 10

    // Get stats for cards
    const stats = await getSystemStats()

    // Get paginated tenants
    const { data: organizations, count: totalOrgs } = await getAllTenants(page, pageSize)
    const totalPages = Math.ceil((totalOrgs || 0) / pageSize)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Slim Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-5 -mt-2">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Organizations</h1>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search moved to Global Header */}
                </div>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Organizations"
                    value={stats.tenants}
                    icon={Building2}
                    color="emerald"
                />
                <StatCard
                    label="Active Tenants"
                    value={stats.activeTenants}
                    icon={CheckCircle2}
                    color="blue"
                />
                <StatCard
                    label="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    label="Revenue Projection"
                    value={`₦${stats.revenue.toLocaleString()}`}
                    icon={ArrowUpRight}
                    color="emerald"
                />
            </div>

            {/* Organizations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Organization</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Slug</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Users</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Created</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {organizations?.map((org: any) => (
                                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {org.logo_url ? (
                                                <img src={org.logo_url} alt={org.title} className="h-9 w-9 rounded-lg object-cover border border-slate-100" />
                                            ) : (
                                                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                                                    {org.title?.substring(0, 2).toUpperCase() || "OR"}
                                                </div>
                                            )}
                                            <p className="font-medium text-slate-900">{org.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{org.slug}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {(org.users_organizations?.[0]?.count || 0) + (org.employees?.[0]?.count || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(org.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/organizations/${org.slug}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-100 hover:border-slate-300 transition-all"
                                            >
                                                Details
                                            </Link>
                                            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs text-slate-500">
                        Showing <span className="font-medium text-slate-900">{(page - 1) * pageSize + 1}</span> to <span className="font-medium text-slate-900">{Math.min(page * pageSize, totalOrgs || 0)}</span> of <span className="font-medium text-slate-900">{totalOrgs}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/admin/organizations?page=${Math.max(1, page - 1)}`}
                            className={`p-1.5 rounded-lg border border-slate-200 transition-all ${page <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-white hover:shadow-sm'}`}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <Link
                                    key={i}
                                    href={`/admin/organizations?page=${i + 1}`}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${page === i + 1 ? 'bg-emerald-600 text-white' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}
                                >
                                    {i + 1}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href={`/admin/organizations?page=${Math.min(totalPages, page + 1)}`}
                            className={`p-1.5 rounded-lg border border-slate-200 transition-all ${page >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-white hover:shadow-sm'}`}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
    const colorMap: any = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
    }

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all group hover:border-slate-300">
            <div className="flex flex-col gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.emerald}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
            </div>
        </div>
    )
}
