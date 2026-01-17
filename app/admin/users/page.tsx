import { getAllUsers } from "@/features/admin/actions"
import { format } from "date-fns"

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string, q?: string }>
}) {
    const { page: searchPage, q } = await searchParams
    const page = Number(searchPage) || 1
    const { data: users, count } = await getAllUsers(page, 20, q)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Users</h1>
                    <p className="text-slate-500">Global user registry.</p>
                </div>
                {/* Search moved to Global Header */}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Created At</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            {user.profile_image_url && (
                                                <img src={user.profile_image_url} className="h-8 w-8 rounded-full object-cover bg-slate-100" />
                                            )}
                                            {user.full_name || "Unknown"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {user.role ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                {user.role}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {user.created_at ? format(new Date(user.created_at), 'PP') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-medium text-blue-600 hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!users || users.length === 0) && (
                    <div className="p-8 text-center text-slate-500">
                        No users found.
                    </div>
                )}
            </div>

            <div className="text-xs text-slate-400 text-center">
                Showing {users?.length} of {count} users
            </div>
        </div>
    )
}
