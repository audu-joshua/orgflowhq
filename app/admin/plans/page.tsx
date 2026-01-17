import {
    Settings,
    CreditCard,
    Check,
    Plus,
    Filter,
    Layout,
    Shield
} from "lucide-react"

export default function AdminPlansPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Plans & Pricing</h1>
                    <p className="text-slate-500">Manage global subscription tiers and feature limits.</p>
                </div>
                <button className="h-11 px-6 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200">
                    <Plus className="h-4 w-4" />
                    New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard
                    name="Free Tier"
                    price="₦0"
                    users="5 Users"
                    active={true}
                    color="slate"
                />
                <PricingCard
                    name="Professional"
                    price="₦85,000"
                    users="50 Users"
                    active={true}
                    color="emerald"
                    isPopular={true}
                />
                <PricingCard
                    name="Enterprise"
                    price="₦150,000"
                    users="Unlimited"
                    active={true}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Feature Permissions Matrix</h3>
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-slate-400" />
                    </div>
                </div>
                <div className="p-12 text-center text-slate-400">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="font-medium text-lg">Full Grid Management</p>
                    <p className="text-sm">Manage granular feature flags per plan in this interactive grid.</p>
                </div>
            </div>
        </div>
    )
}

function PricingCard({ name, price, users, active, color, isPopular }: any) {
    return (
        <div className={`relative bg-white rounded-3xl border ${isPopular ? 'border-emerald-500' : 'border-slate-200'} p-8 shadow-sm flex flex-col group hover:shadow-xl transition-all cursor-pointer`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{name}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">{price}</span>
                    <span className="text-slate-500 text-sm font-medium">/mo</span>
                </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                    </div>
                    {users}
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                    </div>
                    Full API Access
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Check className="h-3 w-3" />
                    </div>
                    Custom Branding
                </li>
            </ul>

            <button className={`w-full h-11 rounded-2xl text-sm font-bold transition-all ${isPopular ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                Edit Plan
            </button>
        </div>
    )
}
