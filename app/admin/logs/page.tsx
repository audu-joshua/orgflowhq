import {
    FileText,
    Activity,
    Shield,
    User,
    Search,
    Clock,
    Layout
} from "lucide-react"

export default function AdminLogsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
                    <p className="text-slate-500">Real-time audit trail of all administrative actions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">
                        <Activity className="h-3 w-3" />
                        Live Feed
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <LogSummaryCard label="Total Events" value="12,482" icon={FileText} />
                <LogSummaryCard label="Security Alerts" value="0" icon={Shield} color="emerald" />
                <LogSummaryCard label="Active Admins" value="3" icon={User} />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <Layout className="h-4 w-4 text-slate-400" />
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    <LogItem
                        admin="Joshua Audu"
                        action="Suspended Organization"
                        target="Facebook Inc."
                        time="2 mins ago"
                        type="security"
                    />
                    <LogItem
                        admin="System"
                        action="Background Job Completed"
                        target="Monthly Billing"
                        time="15 mins ago"
                        type="info"
                    />
                    <LogItem
                        admin="Joshua Audu"
                        action="Updated Pricing Plan"
                        target="Enterprise Tier"
                        time="1 hour ago"
                        type="update"
                    />
                    <LogItem
                        admin="Support Bot"
                        action="Flagged Organization"
                        target="Abc Corp"
                        time="3 hours ago"
                        type="alert"
                    />
                </div>
                <div className="p-4 bg-slate-50 text-center">
                    <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Load More Logs</button>
                </div>
            </div>
        </div>
    )
}

function LogSummaryCard({ label, value, icon: Icon, color = "slate" }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-slate-300 transition-all cursor-pointer">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-900'}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    )
}

function LogItem({ admin, action, target, time, type }: any) {
    const typeStyles: any = {
        security: "bg-red-50 text-red-600 border-red-100",
        info: "bg-blue-50 text-blue-600 border-blue-100",
        update: "bg-emerald-50 text-emerald-600 border-emerald-100",
        alert: "bg-amber-50 text-amber-600 border-amber-100"
    }

    return (
        <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`h-2 w-2 rounded-full ${type === 'alert' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                <div>
                    <p className="font-semibold text-slate-900">
                        <span className="text-emerald-600 font-bold">{admin}</span> {action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        Target: <span className="font-medium text-slate-700">{target}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1 font-mono uppercase text-[10px] tracking-tight">
                            <Clock className="h-3 w-3" /> {time}
                        </span>
                    </p>
                </div>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${typeStyles[type] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                {type}
            </div>
        </div>
    )
}
