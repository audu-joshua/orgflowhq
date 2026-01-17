import {
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Users,
    TrendingUp,
    BarChart3
} from "lucide-react"

export default function AdminRevenuePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue & Financials</h1>
                <p className="text-slate-500">Global subscription and revenue analytics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Monthly Recurring Revenue"
                    value="₦4,250,000"
                    change="+12.5%"
                    isUp={true}
                    icon={DollarSign}
                />
                <StatCard
                    label="Yearly Revenue"
                    value="₦51,000,000"
                    change="+8.2%"
                    isUp={true}
                    icon={TrendingUp}
                />
                <StatCard
                    label="Active Subscriptions"
                    value="128"
                    change="-2.4%"
                    isUp={false}
                    icon={Users}
                />
                <StatCard
                    label="Churn Rate"
                    value="1.2%"
                    change="-0.5%"
                    isUp={true}
                    icon={BarChart3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-slate-400">
                    <BarChart3 className="h-16 w-16 mb-4 opacity-10" />
                    <p className="font-medium text-lg">Revenue Growth Chart</p>
                    <p className="text-sm">Real-time financial charts will appear here.</p>
                </div>
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                    <h3 className="font-bold text-lg mb-6">Recent Transactions</h3>
                    <div className="space-y-6 text-sm text-slate-400">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <p className="font-bold text-white">Google Nigeria Ltd</p>
                            <p className="text-xs">₦150,000 • Enterprise Plan</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <p className="font-bold text-white">Stack Overflow</p>
                            <p className="text-xs">₦85,000 • Pro Plan</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                            <p className="font-bold text-white">Meta Services</p>
                            <p className="text-xs">₦150,000 • Enterprise Plan</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, change, isUp, icon: Icon }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change}
                </span>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    )
}
