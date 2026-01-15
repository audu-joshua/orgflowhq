import { getAllTenants } from "@/features/admin/actions"
import { format } from "date-fns"

export default async function AdminTenantsPage({
    searchParams
}: {
    searchParams: { page?: string }
}) {
    const page = Number(searchParams.page) || 1
    const { data: tenants, count } = await getAllTenants(page)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
                <p className="text-slate-500">Manage all registered organizations.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Organization</th>
                                <th className="px-6 py-4 font-semibold">Slug</th>
                                <th className="px-6 py-4 font-semibold">Users</th>
                                <th className="px-6 py-4 font-semibold">Created At</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tenants?.map((org: any) => (
                                <tr key={org.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            {org.logo_url && (
                                                <img src={org.logo_url} className="h-8 w-8 rounded object-cover bg-slate-100" />
                                            )}
                                            {org.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{org.slug}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {org.users_organizations?.[0]?.count || 0}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {org.created_at ? format(new Date(org.created_at), 'PP') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-medium text-blue-600 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!tenants || tenants.length === 0) && (
                    <div className="p-8 text-center text-slate-500">
                        No tenants found.
                    </div>
                )}
            </div>

            <div className="text-xs text-slate-400 text-center">
                Showing {tenants?.length} of {count} tenants
            </div>
        </div>
    )
}
