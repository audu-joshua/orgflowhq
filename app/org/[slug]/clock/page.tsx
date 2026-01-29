"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { getOrganizationBySlugAction } from "@/features/organization/actions"
import {
    clockInAction,
    clockOutAction,
    getEmployeeTimesheetsAction,
    createTimesheetAction
} from "@/features/timesheets/actions"
import {
    uploadEmployeeProfileImageAction,
    ensureEOTMCompetitionInitializedAction,
    getEOTMWinnerAction
} from "@/features/departments/actions"
import { getEmployeeProfileBySlug, getAllUserEmployees } from "@/features/employees/actions"
import { useAppStore } from "@/store/useAppStore"
import { Clock, LogIn, LogOut, History, AlertCircle, Download, Filter, Loader2, Plus } from "lucide-react"
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal"
import { toast } from "@/lib/toast"
import { isSameWeek, isSameMonth, parseISO } from "date-fns"
import { EOTMVoteOverlay } from "@/features/departments/components/EOTMVoteOverlay"
import { EOTMRevealOverlay } from "@/features/departments/components/EOTMRevealOverlay"
import type { EOTMCompetition, EOTMWinner } from "@/features/departments/types/eotm"
import type { Timesheet } from "@/features/timesheets/types"
import { useSession } from "next-auth/react"

export default function ClockPage() {
    const { slug } = useParams() as { slug: string }
    const { data: session, status: sessionStatus } = useSession()
    const { signIn, signOut, refreshProfile } = useAuth()
    const { user, organization, setOrganization, employee, setEmployee } = useAppStore()

    const [email, setEmail] = useState("")
    const [employeeIdField, setEmployeeIdField] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [timesheets, setTimesheets] = useState<Timesheet[]>([])
    const [currentTimesheet, setCurrentTimesheet] = useState<Timesheet | null>(null)
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
    const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all')

    // EOTM State
    const [eotmCompetition, setEotmCompetition] = useState<EOTMCompetition | null>(null)
    const [eotmWinner, setEotmWinner] = useState<EOTMWinner | null>(null)
    const [showVoteOverlay, setShowVoteOverlay] = useState(false)
    const [showRevealOverlay, setShowRevealOverlay] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isClocking, setIsClocking] = useState(false)

    useEffect(() => {
        const initPage = async () => {
            try {
                const org = await getOrganizationBySlugAction(slug)
                setOrganization(org as any) // Type might mismatch slightly, but generally compatible
            } catch (err: any) {
                setError(err.message || "Organization not found")
            }
        }
        initPage()
    }, [slug])

    useEffect(() => {
        if (session?.user && organization) {
            fetchEmployeeData()
        }
    }, [session, organization])

    const fetchEmployeeData = async () => {
        setLoading(true)
        setError("")
        try {
            // Use Server Action instead of Supabase client
            const profile = await getEmployeeProfileBySlug(slug)

            if (profile) {
                setEmployee(profile)

                const records = await getEmployeeTimesheetsAction(profile.id)
                setTimesheets(records as any)

                const active = records.find(r => !r.clockOut)
                setCurrentTimesheet(active || null)
            } else {
                // Check if user has any records at all
                const allEmps = await getAllUserEmployees()
                if (allEmps && allEmps.length > 0) {
                    const firstOrgName = (allEmps[0] as any).organizationId?.name || "another organization"
                    setError(`You are not registered in ${organization?.name}. You appear to be a member of ${firstOrgName}.`)
                } else {
                    setError("No employee profile exists for your account. Please contact HR.")
                }
            }
        } catch (err: any) {
            console.error("Fetch error:", err)
            setError(err.message || "Failed to sync your profile.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!organization || !employee) return

        const checkEOTM = async () => {
            try {
                const competition = await ensureEOTMCompetitionInitializedAction(organization.id)
                setEotmCompetition(competition as any)

                if (competition && competition.status === 'VOTING_OPEN') {
                    // Optimized to use local state check if possible or a dedicated server-side check
                    // For now, keeping it simple as eotmService is Mongo-ready
                    // We'll need a way to check if already voted. 
                    // eotmService.hasVoted(competition.id, employee.id)
                } else if (competition && competition.status === 'REVEALED') {
                    const winner = await getEOTMWinnerAction(competition.id)
                    if (winner) {
                        setEotmWinner(winner as any)
                        // ...
                    }
                }
            } catch (err) {
                console.error("EOTM check failed:", err)
            }
        }
        checkEOTM()
    }, [organization?.id, employee?.id])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            // Primary Login via NextAuth Credentials Provider
            await signIn(email, employeeIdField)
            toast.success("Welcome back!")
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please check your email and Employee ID.")
        } finally {
            setLoading(false)
        }
    }

    const handleClockIn = async () => {
        if (!employee || !organization || !session?.user) return
        setIsClocking(true)
        try {
            const res = await clockInAction(employee._id, organization._id, (session.user as any).id)
            if (!res.success) throw new Error(res.error)

            const record = res.record
            setCurrentTimesheet(record as any)
            setTimesheets([record, ...timesheets] as any)
            toast.success("Clocked in successfully")
        } catch (err) {
            setError("Failed to clock in")
            toast.error("Failed to clock in")
        } finally {
            setIsClocking(false)
        }
    }

    const handleClockOut = async () => {
        if (!currentTimesheet) return
        setIsClocking(true)
        try {
            const res = await clockOutAction(currentTimesheet._id)
            if (!res.success) throw new Error(res.error)
            const updated = res.record
            if (!updated) throw new Error("Failed to retrieve updated record")
            setCurrentTimesheet(null)
            setTimesheets(timesheets.map(t => (t._id === updated._id || t.id === updated.id) ? updated : t) as any)
            toast.success("Clocked out successfully")
        } catch (err) {
            setError("Failed to clock out")
            toast.error("Failed to clock out")
        } finally {
            setIsClocking(false)
        }
    }

    const handleSelfTerminate = async () => {
        if (!organization || !confirm("Are you sure you want to terminate your access...")) return

        setLoading(true)
        try {
            const response = await fetch("/api/employees/self-terminate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId: organization.id })
            })

            if (response.ok) {
                toast.success("Account terminated. You are being signed out.")
                await signOut()
                window.location.href = "/login?error=terminated"
            } else {
                const data = await response.json()
                throw new Error(data.error || "Failed to terminate account")
            }
        } catch (err: any) {
            toast.error(err.message)
            setLoading(false)
        }
    }

    const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !employee) return

        setIsUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            // Note: uploadEmployeeProfileImageAction returns the URL? No, verify return type.
            // checking service: returns string url? No, throws error for now.
            // If it returned, it would be await ... 

            const publicUrl = await uploadEmployeeProfileImageAction(employee._id, formData)
            // type casting unsafe if return is unexpected
            setEmployee({ ...employee, profileImageUrl: publicUrl })
            toast.success("Profile image updated")
        } catch (err: any) {
            console.error("Profile image upload failed:", err)
            toast.error("Failed to update profile image")
        } finally {
            setIsUploadingImage(false)
        }
    }

    // Filter Logic
    const filteredTimesheets = timesheets.filter(ts => {
        const matchesStatus = statusFilter === 'all' || ts.status === statusFilter

        let matchesTime = true
        const date = parseISO(ts.clockIn)
        const now = new Date()

        if (timeFilter === 'week') {
            matchesTime = isSameWeek(date, now)
        } else if (timeFilter === 'month') {
            matchesTime = isSameMonth(date, now)
        }

        return matchesStatus && matchesTime
    })

    const handleDownload = () => {
        const headers = ["Employee Name", "Date", "Clock In", "Clock Out", "Duration (Hrs)", "Status"]
        const rows = filteredTimesheets.map(ts => {
            const start = new Date(ts.clockIn)
            const end = ts.clockOut ? new Date(ts.clockOut) : null
            const duration = end ? ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2) : "Active"

            return [
                employee?.fullName || "Unknown",
                start.toLocaleDateString(),
                start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--",
                duration,
                ts.status
            ]
        })

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `timesheet_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (sessionStatus === "loading" || (!organization && !error)) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
    }

    if (!session) {
        return (
            <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Employee Login</h1>
                    <p className="text-muted-foreground">{organization?.name}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="name@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Employee ID</label>
                        <input
                            type="password"
                            required
                            value={employeeIdField}
                            onChange={(e) => setEmployeeIdField(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="EMP-XXXX"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className="text-xs text-primary hover:underline font-bold"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-4 flex items-center justify-center gap-2 h-14"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn size={20} /> Clock Service Login</>}
                    </button>
                </form>
                <ForgotPasswordModal
                    isOpen={isForgotModalOpen}
                    onClose={() => setIsForgotModalOpen(false)}
                    initialEmail={email}
                />
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="sticky top-4 z-50 p-4 bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg flex items-center justify-between transition-all">
                <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                        {employee?.profileImageUrl || session?.user?.image ? (
                            <img
                                src={employee?.profileImageUrl || (session?.user?.image as string) || ""}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-primary object-cover transition-opacity group-hover:opacity-70"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 transition-opacity group-hover:opacity-70">
                                <span className="text-primary font-bold text-lg">
                                    {(employee?.fullName || session?.user?.name || session?.user?.email)?.[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                        <label
                            htmlFor="profile-upload"
                            className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer rounded-full ${isUploadingImage
                                ? "opacity-100 bg-black/40"
                                : "opacity-0 group-hover:opacity-100 bg-black/20"
                                }`}
                        >
                            {isUploadingImage ? (
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                            ) : (
                                <Plus size={20} className="text-white drop-shadow-md" />
                            )}
                        </label>

                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageChange}
                            disabled={isUploadingImage}
                        />
                    </div>
                    <div className="min-w-0 pr-4">
                        <h2 className="text-md font-bold text-foreground leading-tight truncate">
                            {employee?.fullName || session?.user?.name || session?.user?.email}
                        </h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {employee?.position || (employee?.departmentId?.name ? `${employee.departmentId.name} Team` : "Member")}
                        </p>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        await signOut()
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="md:col-span-1 space-y-6">
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Instructions</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Clock in when you start your shift and clock out when you finish. Your records are automatically submitted for review.
                        </p>
                    </div>

                    <div className="p-6 bg-destructive/5 border border-destructive/10 rounded-2xl">
                        <h3 className="text-xs font-bold text-destructive uppercase tracking-widest mb-2">Danger Zone</h3>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
                            Tired of working here? You can terminate your access to this organization. Access will be revoked immediately.
                        </p>
                        <button
                            onClick={handleSelfTerminate}
                            disabled={loading}
                            className="w-full py-2 text-[10px] font-bold text-destructive border border-destructive/20 rounded-lg hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                        >
                            Resign & Terminate Access
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="p-8 bg-card border border-border rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Clock size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground">Time Control</h3>
                                    <p className="text-muted-foreground">Manage your work session</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Current Time</p>
                                    <p className="text-2xl font-mono font-bold text-primary">{new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>

                            {currentTimesheet ? (
                                <div className="space-y-6">
                                    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white animate-pulse">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-green-600 uppercase tracking-tight">Active Session</p>
                                                <p className="text-lg font-bold text-foreground">Clocked in at {new Date(currentTimesheet.clockIn).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClockOut}
                                        disabled={isClocking}
                                        className="w-full py-6 bg-destructive text-destructive-foreground rounded-2xl font-bold text-xl shadow-lg shadow-destructive/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 h-[84px] cursor-pointer disabled:opacity-80"
                                    >
                                        {isClocking ? (
                                            <><Loader2 className="w-8 h-8 animate-spin" /> Ending session...</>
                                        ) : (
                                            <><LogOut size={24} /> Clock Out Now</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-muted/30 border border-border rounded-2xl">
                                        <p className="text-center text-muted-foreground font-medium italic">No active session. Ready to start?</p>
                                    </div>

                                    <button
                                        onClick={handleClockIn}
                                        disabled={isClocking}
                                        className="w-full py-6 bg-primary text-primary-foreground rounded-2xl font-bold text-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 h-[84px] cursor-pointer disabled:opacity-80"
                                    >
                                        {isClocking ? (
                                            <><Loader2 className="w-8 h-8 animate-spin" /> Starting session...</>
                                        ) : (
                                            <><Clock size={24} /> Clock In Now</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <History size={20} className="text-muted-foreground" />
                                <h3 className="font-bold text-foreground uppercase tracking-widest text-sm">Activity</h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex bg-muted/50 rounded-lg p-1">
                                    <button
                                        onClick={() => setTimeFilter('all')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setTimeFilter('week')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Week
                                    </button>
                                    <button
                                        onClick={() => setTimeFilter('month')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Month
                                    </button>
                                </div>

                                <button
                                    onClick={handleDownload}
                                    title="Download CSV"
                                    className="p-2 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground rounded-lg transition-colors"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {['all', 'approved', 'rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s as any)}
                                    className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${statusFilter === s
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-transparent border-border text-muted-foreground hover:border-primary/50'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            {filteredTimesheets.length > 0 ? (
                                filteredTimesheets.slice(0, 10).map((ts) => (
                                    <div key={ts.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${ts.clockOut ? 'bg-muted-foreground' : 'bg-green-500 animate-pulse'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{new Date(ts.clockIn).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                    {new Date(ts.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {ts.clockOut ? new Date(ts.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-current ${ts.status === 'approved' ? 'text-green-500' :
                                                ts.status === 'rejected' ? 'text-destructive' :
                                                    'text-yellow-500'
                                                }`}>
                                                {ts.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-muted-foreground italic text-sm">No records found for this filter.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-center gap-2 text-sm font-bold animate-in shake duration-500">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {eotmCompetition && employee && (
                <>
                    <EOTMVoteOverlay
                        isOpen={showVoteOverlay}
                        onClose={() => setShowVoteOverlay(false)}
                        competitionId={eotmCompetition.id}
                        voterId={employee._id}
                        voterRole={employee.systemRole || 'employee'}
                        organizationId={organization!._id}
                    />
                    <EOTMRevealOverlay
                        isOpen={showRevealOverlay}
                        onClose={() => setShowRevealOverlay(false)}
                        winner={eotmWinner}
                        organizationName={organization!.name}
                        organizationLogo={organization?.logoUrl}
                    />
                </>
            )}

        </div>
    )
}
