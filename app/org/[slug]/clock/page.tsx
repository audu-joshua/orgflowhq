"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { authService } from "@/features/auth/services/authService"
import { organizationService } from "@/features/organization/services/organizationService"
import { timesheetService, Timesheet } from "@/features/timesheets/services/timesheetService"
import { departmentService } from "@/features/departments/services/departmentService"
import { useAppStore } from "@/store/useAppStore"
import { Clock, LogIn, LogOut, History, AlertCircle, Download, Filter, Loader2, Plus } from "lucide-react"
import { ForgotPasswordModal } from "@/features/auth/components/ForgotPasswordModal"
import { toast } from "@/lib/toast"
import { isSameWeek, isSameMonth, parseISO } from "date-fns"
import { eotmService } from "@/features/departments/services/eotmService"
import { EOTMVoteOverlay } from "@/features/departments/components/EOTMVoteOverlay"
import { EOTMRevealOverlay } from "@/features/departments/components/EOTMRevealOverlay"
import type { EOTMCompetition, EOTMWinner } from "@/features/departments/types/eotm"

export default function ClockPage() {
    const { slug } = useParams() as { slug: string }
    const { signIn, signOut, refreshProfile, loading: authLoading } = useAuth()
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

    useEffect(() => {
        const initPage = async () => {
            try {
                const org = await organizationService.getOrganizationBySlug(slug)
                setOrganization(org)
            } catch (err) {
                setError("Organization not found")
            }
        }
        initPage()
    }, [slug])

    useEffect(() => {
        if (user && organization) {
            fetchEmployeeData()
        }
    }, [user, organization])

    const fetchEmployeeData = async () => {
        setLoading(true)
        setError("")
        try {
            const { getSupabaseClient } = await import("@/lib/supabaseClient")
            const supabase = getSupabaseClient()

            // FETCH: Get all employee records for this user across all organizations
            // This mirrors the Profile Modal logic which successfully finds the record
            const { data: allEmployees, error: empError } = await supabase
                .from("employees")
                .select(`
                    *,
                    organizations(*),
                    departments(name)
                `)
                .eq("user_id", user!.id)

            if (empError) {
                console.error("Employee lookup error:", empError)
                throw empError
            }

            // FIND: Locate the record matching the current organization
            // We search by ID first, then fallback to slug matching
            let currentEmployee = allEmployees?.find((emp: any) =>
                emp.organization_id === organization?.id ||
                emp.organizations?.slug === slug
            )

            // AUTO-RESOLVE: If no match found for current slug, but user has exactly ONE membership
            // we follow that membership to be helpful (fixes "wrong slug" issues)
            if (!currentEmployee && allEmployees && allEmployees.length === 1) {
                console.log("[fetchEmployeeData] Context mismatch but following single membership...")
                currentEmployee = allEmployees[0]
            }

            // SENIOR REFINEMENT: If still no record, check for unlinked records by email
            if (!currentEmployee && user?.email) {
                console.log("[fetchEmployeeData] Checking for unlinked record by email:", user.email)
                const { data: employeeByEmail, error: emailLookupError } = await supabase
                    .from("employees")
                    .select("*, organizations(*), departments(name)")
                    .eq("email", user.email)
                    .eq("organization_id", organization?.id)
                    .is("user_id", null)
                    .maybeSingle()

                if (emailLookupError) console.error("[fetchEmployeeData] Email lookup error:", emailLookupError)

                if (employeeByEmail) {
                    console.log("[fetchEmployeeData] Found unlinked record, linking now...")
                    const { error: linkError } = await supabase
                        .from("employees")
                        .update({ user_id: user.id })
                        .eq("id", employeeByEmail.id)

                    if (!linkError) {
                        toast.success("Accounts linked successfully.")
                        await refreshProfile(user.id, employeeByEmail.organization_id)
                        // Sync to global store
                        setEmployee({ ...employeeByEmail, user_id: user.id })
                        return
                    } else {
                        console.error("[fetchEmployeeData] Link error:", linkError)
                    }
                }
            }

            if (currentEmployee) {
                setEmployee(currentEmployee)

                // If organization ID in store differs from the record's org, sync it
                // This handles cases where the initial slug resolution picked the "wrong" organization
                if (organization?.id !== currentEmployee.organization_id) {
                    console.log("[fetchEmployeeData] Syncing organization ID mismatch...")
                    setOrganization(currentEmployee.organizations)
                }

                const records = await timesheetService.getEmployeeTimesheets(currentEmployee.id)
                setTimesheets(records)

                // Check for active (not clocked out) timesheet
                const active = records.find(r => !r.clock_out)
                setCurrentTimesheet(active || null)
            } else if (allEmployees && allEmployees.length > 0) {
                // User is an employee, but not in THIS organization
                const firstOrg = allEmployees[0].organizations?.name || "another organization"
                setError(`You are not registered in ${organization?.name || "this organization"}. You appear to be a member of ${firstOrg}.`)
            } else {
                setError("No employee profile exists for your account. Please contact HR.")
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
                const competition = await eotmService.ensureCompetitionInitialized(organization.id)
                setEotmCompetition(competition)

                if (competition.status === 'VOTING_OPEN') {
                    const { getSupabaseClient } = await import("@/lib/supabaseClient")
                    const supabase = getSupabaseClient()
                    const { data } = await supabase
                        .from('eotm_votes')
                        .select('id')
                        .eq('competition_id', competition.id)
                        .eq('voter_id', employee.id)
                        .maybeSingle()

                    if (!data) setShowVoteOverlay(true)
                } else if (competition.status === 'REVEALED') {
                    const winner = await eotmService.getWinner(competition.id)
                    if (winner) {
                        setEotmWinner(winner)
                        setShowRevealOverlay(true)
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
            console.log("Attempting sign-in for:", email)
            try {
                // 0. Pre-login access validation
                const access = await authService.validateAccessStatus(email)
                if (!access.allowed) {
                    setError(access.error || "Access Denied")
                    setLoading(false)
                    return
                }

                // Primary Login: Email + Employee ID (as password)
                await signIn(email, employeeIdField)
                console.log("Login successful.")
                toast.success("Welcome back!")
            } catch (signInErr: any) {
                console.log("Login failed:", signInErr.message)

                if (signInErr.message?.includes("Email not confirmed")) {
                    setError("Your email address has not been confirmed. Please check your inbox.")
                    return
                }

                if (signInErr.message?.includes("Invalid login credentials")) {
                    setError("Invalid email or Employee ID. Please try again.")
                } else {
                    throw signInErr
                }
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please check your email and Employee ID.")
        } finally {
            setLoading(false)
        }
    }

    const handleClockIn = async () => {
        if (!employee || !organization) return
        setLoading(true)
        try {
            const record = await timesheetService.clockIn(employee.id, organization.id)
            setCurrentTimesheet(record)
            setTimesheets([record, ...timesheets])
        } catch (err) {
            setError("Failed to clock in")
        } finally {
            setLoading(false)
        }
    }

    const handleClockOut = async () => {
        if (!currentTimesheet) return
        setLoading(true)
        try {
            const updated = await timesheetService.clockOut(currentTimesheet.id)
            setCurrentTimesheet(null)
            setTimesheets(timesheets.map(t => t.id === updated.id ? updated : t))
        } catch (err) {
            setError("Failed to clock out")
        } finally {
            setLoading(false)
        }
    }

    const handleSelfTerminate = async () => {
        if (!organization || !confirm("Are you sure you want to terminate your access to this organization? This action cannot be undone and you will be signed out immediately.")) return

        setLoading(true)
        try {
            const { getSupabaseClient } = await import("@/lib/supabaseClient")
            const { data: { session } } = await getSupabaseClient().auth.getSession()
            const response = await fetch("/api/employees/self-terminate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
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
            const publicUrl = await departmentService.uploadEmployeeProfileImage(employee.id, file)
            // Update both local and global state (they are now the same)
            setEmployee({ ...employee, profile_image_url: publicUrl })
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
        const date = parseISO(ts.clock_in)
        const now = new Date()

        if (timeFilter === 'week') {
            matchesTime = isSameWeek(date, now)
        } else if (timeFilter === 'month') {
            matchesTime = isSameMonth(date, now)
        }

        return matchesStatus && matchesTime
    })

    // CSV Download
    const handleDownload = () => {
        const headers = ["Employee Name", "Date", "Clock In", "Clock Out", "Duration (Hrs)", "Status"]
        const rows = filteredTimesheets.map(ts => {
            const start = new Date(ts.clock_in)
            const end = ts.clock_out ? new Date(ts.clock_out) : null
            const duration = end ? ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2) : "Active"

            return [
                employee?.full_name || "Unknown",
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

    if (authLoading || (!organization && !error)) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
    }

    if (!user) {
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
            {/* STICKY Header */}
            <div className="sticky top-4 z-50 p-4 bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg flex items-center justify-between transition-all">
                <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                        {employee?.profile_image_url || user?.profile_image_url ? (
                            <img
                                src={employee?.profile_image_url || user?.profile_image_url}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-primary object-cover transition-opacity group-hover:opacity-70"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 transition-opacity group-hover:opacity-70">
                                <span className="text-primary font-bold text-lg">
                                    {(employee?.full_name || user?.full_name || user?.email)?.[0].toUpperCase()}
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
                            <span className="sm:hidden">
                                {(employee?.full_name || user?.full_name || user?.email || "").split(" ")[0]}
                            </span>
                            <span className="hidden sm:inline">
                                {employee?.full_name || user?.full_name || user?.email}
                            </span>
                        </h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {employee?.position || (employee?.departments?.name ? `${employee.departments.name} Team` : "Member")}
                        </p>
                    </div>
                </div>

                <button
                    onClick={async () => {
                        await signOut()
                        window.location.reload()
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {/* Info Card (Moved Instructions here) */}
                <div className="md:col-span-1 space-y-6">
                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Instructions</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Clock in when you start your shift and clock out when you finish. Your records are automatically submitted for review.
                        </p>
                    </div>

                    {/* Danger Zone */}
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

                {/* Action Card */}
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
                                                <p className="text-lg font-bold text-foreground">Clocked in at {new Date(currentTimesheet.clock_in).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClockOut}
                                        disabled={loading}
                                        className="w-full py-6 bg-destructive text-destructive-foreground rounded-2xl font-bold text-xl shadow-lg shadow-destructive/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 h-[84px]"
                                    >
                                        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><LogOut size={24} /> Clock Out Now</>}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-muted/30 border border-border rounded-2xl">
                                        <p className="text-center text-muted-foreground font-medium italic">No active session. Ready to start?</p>
                                    </div>

                                    <button
                                        onClick={handleClockIn}
                                        disabled={loading}
                                        className="w-full py-6 bg-primary text-primary-foreground rounded-2xl font-bold text-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 h-[84px]"
                                    >
                                        {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Clock size={24} /> Clock In Now</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Card */}
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

                        {/* Status Filter Toggles */}
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
                                            <div className={`w-2 h-2 rounded-full ${ts.clock_out ? 'bg-muted-foreground' : 'bg-green-500 animate-pulse'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{new Date(ts.clock_in).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                                    {new Date(ts.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {ts.clock_out ? new Date(ts.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
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
                        voterId={employee.id}
                        voterRole={employee.system_role || 'employee'}
                        organizationId={organization!.id}
                    />
                    <EOTMRevealOverlay
                        isOpen={showRevealOverlay}
                        onClose={() => setShowRevealOverlay(false)}
                        winner={eotmWinner}
                        organizationName={organization!.name}
                        organizationLogo={organization?.logo_url}
                    />
                </>
            )}

        </div>
    )
}
