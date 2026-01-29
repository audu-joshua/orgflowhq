import {
    Building2,
    Users,
    Briefcase,
    Calendar,
    MapPin,
    Mail,
    ExternalLink,
    Settings,
    ShieldCheck,
    ArrowLeft,
    ChevronRight,
    CreditCard,
    Layout,
    Copy,
    Link as LinkIcon
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { OrganizationEmployeeList } from "@/components/admin/OrganizationEmployeeList"
import { connectToDatabase } from "@/lib/mongodb"
import { Organization, User } from "@/models/User"
import { Employee, JobRole, Subscription } from "@/models/Business"
import mongoose from "mongoose"

export default async function OrganizationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    await connectToDatabase()

    // Get organization details
    const org: any = await Organization.findOne({ slug })

    if (!org) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <Building2 className="h-10 w-10 text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Organization Not Found</h2>
                <p className="max-w-xs text-center text-slate-500 mb-8">
                    We couldn't find an organization with the slug <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">"{slug}"</span>.
                </p>
                <Link
                    href="/admin/organizations"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Registry
                </Link>
            </div>
        )
    }

    const orgId = org._id

    // Fetch Relations
    const membersCount = await User.countDocuments({ "memberships.organizationId": orgId })
    const employees = await Employee.find({ organizationId: orgId }).select("fullName position profileImageUrl")
    const roles = await JobRole.find({ organizationId: orgId }).select("title status createdAt slug")
    const subscriptions = await Subscription.find({ organizationId: orgId }).populate("planId")

    const currentSubscription = subscriptions?.[0] || null
    const jobOpenings = roles || []
    const clockUrl = `orgflowhq.com/org/${slug}/clock`

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Premium Breadcrumb Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
                    <Link href="/admin" className="hover:text-emerald-600 transition-colors">Admin</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href="/admin/organizations" className="hover:text-emerald-600 transition-colors">Organizations</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-slate-900">{org.name}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner overflow-hidden border border-emerald-50">
                            {org.logoUrl ? (
                                <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{org.name}</h1>
                            <div className="flex items-center gap-4 mt-1 text-slate-500">
                                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full group cursor-pointer hover:bg-slate-200 transition-colors">
                                    <span className="text-sm font-medium text-slate-700">{clockUrl}</span>
                                    <div className="flex items-center gap-1.5 border-l border-slate-300 pl-2">
                                        <button className="p-1 hover:text-emerald-600 transition-colors" title="Copy link">
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                        <a href={`/org/${slug}/clock`} target="_blank" className="p-1 hover:text-emerald-600 transition-colors" title="Open link">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="h-10 px-4 flex items-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all shadow-sm">
                            <Settings className="h-4 w-4" />
                            Org Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox
                    label="Registered Users"
                    value={membersCount}
                    icon={Users}
                    color="blue"
                />

                {/* Clickable Employee List */}
                <OrganizationEmployeeList
                    employees={employees.map(e => ({
                        id: e._id.toString(),
                        full_name: e.fullName,
                        position: e.position,
                        profile_image_url: e.profileImageUrl
                    }))}
                    totalCount={employees.length}
                />

                <StatBox
                    label="Job Openings"
                    value={jobOpenings.length}
                    icon={Layout}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Organization Profile */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            Organization Profile
                        </h3>
                        {org.description ? (
                            <p className="text-slate-600 leading-relaxed mb-8">{org.description}</p>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm italic mb-8">
                                No description provided for this organization.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DetailItem icon={LinkIcon} label="Website" value={org.website} />
                            <DetailItem icon={Mail} label="Contact Email" value={org.contactEmail} />
                            <DetailItem icon={MapPin} label="Office Location" value={org.address} />
                            <DetailItem icon={Calendar} label="Member Since" value={format(new Date(org.createdAt), 'MMMM yyyy')} />
                        </div>
                    </div>

                    {/* Job Openings / Roles */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">Active Job Openings</h3>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                {jobOpenings.length} Roles
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {jobOpenings.length > 0 ? (
                                jobOpenings.map((role: any) => (
                                    <div key={role._id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-slate-900">{role.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Created {format(new Date(role.createdAt), 'MMM d, yyyy')}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${role.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                {role.status}
                                            </span>
                                            <button className="p-1 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Layout className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 text-sm">No active job openings found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* Subscription & Plan */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                <CreditCard className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="font-semibold">Subscription</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Current Plan</p>
                                <p className="text-xl font-bold text-white">
                                    {currentSubscription?.planId?.name || "Free Forever"}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-slate-400">Status</span>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md font-bold text-[10px] uppercase">
                                        {currentSubscription?.status || "Active"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-slate-400">User Limit</span>
                                    <span className="text-white font-medium">
                                        {currentSubscription?.planId?.limits?.roles || "Limited"}
                                    </span>
                                </div>
                            </div>

                            <button className="w-full h-11 bg-white text-slate-900 rounded-2xl text-sm font-bold mt-4 hover:bg-emerald-400 transition-colors shadow-lg">
                                Manage Billing
                            </button>
                        </div>
                    </div>

                    {/* Administrative Control */}
                    <div className="bg-white rounded-3xl border border-red-100 p-8 shadow-sm">
                        <h3 className="text-red-900 font-semibold mb-4 text-sm">Administrative Control</h3>
                        <p className="text-[11px] text-red-500 mb-6 leading-relaxed">
                            Deleting this organization will permanently remove all associated data including users, employees, and campaigns.
                        </p>
                        <button className="w-full h-10 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">
                            Suspend Organization
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: "blue" | "emerald" | "purple" }) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600"
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all cursor-pointer">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${colorStyles[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    )
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value || "Not configured"}</p>
            </div>
        </div>
    )
}
