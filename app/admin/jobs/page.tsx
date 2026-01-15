import { Briefcase } from "lucide-react"

export default function AdminJobsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Global Jobs & Recruitment</h1>
                <p className="text-slate-500">Overview of all active recruitment campaigns across the platform.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Briefcase size={32} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Jobs Management</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    This section will allow platform admins to monitor recruitment activity, view performance across tenants, and manage global job board integration.
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                    Coming Soon in Phase 2
                </div>
            </div>
        </div>
    )
}
