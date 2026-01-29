"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"
import {
    getAllTimesheetsAction,
    updateTimesheetStatusAction,
    updateTimesheetsStatusAction
} from "@/features/timesheets/actions"
import { getEmployeesByOrganizationAction } from "@/features/departments/actions"
import type { Timesheet } from "@/features/timesheets/types"
import { Check, X, Clock, User, Filter, Search, AlertCircle, Download, Calendar, Plus, Edit2, Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { toast } from "@/lib/toast"
import { formatDate } from "@/lib/utils"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { CustomDatePicker, type DateRange } from "@/components/ui/CustomDatePicker"
import { CreateTimesheetModal } from "@/features/timesheets/components/CreateTimesheetModal"
import { AdminEditTimesheetModal } from "@/features/timesheets/components/AdminEditTimesheetModal"
import { TimesheetDetailModal } from "@/features/timesheets/components/TimesheetDetailModal"
import { subMonths, subYears, isAfter, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns"

export default function TimesheetsPage() {
    const { user, organization } = useAppStore()
    const [timesheets, setTimesheets] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
    const [employeeFilter, setEmployeeFilter] = useState('all')
    const [dateRange, setDateRange] = useState<DateRange>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        label: "This Month"
    })
    const [searchTerm, setSearchTerm] = useState("")
    const [actionLoading, setActionLoading] = useState<{ id: string; status: 'approved' | 'rejected' } | null>(null)

    // Admin Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null)

    useEffect(() => {
        if (organization) {
            fetchTimesheets()
        }
    }, [organization])

    const fetchTimesheets = async () => {
        setLoading(true)
        try {
            const data = await getAllTimesheetsAction(organization!.id)
            setTimesheets(data as any)

            const emps = await getEmployeesByOrganizationAction(organization!.id)
            setEmployees(emps as any)
        } catch (err) {
            setError("Failed to fetch timesheets")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        setActionLoading({ id, status })
        try {
            await updateTimesheetStatusAction(id, status)
            setTimesheets(timesheets.map(ts => ts.id === id ? { ...ts, status } : ts))
            toast.success(`Timesheet ${status === 'approved' ? 'approved' : 'rejected'}`)
        } catch (err) {
            toast.error("Failed to update status")
        } finally {
            setActionLoading(null)
        }
    }

    const handleBulkAction = async (status: 'approved' | 'rejected') => {
        const pendingIds = filteredTimesheets
            .filter(ts => ts.status === 'pending')
            .map(ts => ts.id)

        if (pendingIds.length === 0) return

        if (!window.confirm(`Are you sure you want to ${status === 'approved' ? 'APPROVE' : 'REJECT'} all ${pendingIds.length} pending timesheets in this view?`)) {
            return
        }

        try {
            await updateTimesheetsStatusAction(pendingIds, status)
            setTimesheets(timesheets.map(ts => pendingIds.includes(ts.id) ? { ...ts, status } : ts))
        } catch (err) {
            setError("Failed to perform bulk action")
        }
    }

    const filteredTimesheets = timesheets.filter(ts => {
        const matchesStatus = filter === 'all' || ts.status === filter
        const matchesEmployee = employeeFilter === 'all' || ts.employeeId === employeeFilter || ts.employees?.id === employeeFilter
        const matchesSearch = ts.employees?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ts.employees?.position?.toLowerCase().includes(searchTerm.toLowerCase())

        let matchesDate = true
        if (ts.clockIn && dateRange) {
            const date = parseISO(ts.clockIn)
            matchesDate = isWithinInterval(date, { start: dateRange.start, end: dateRange.end })
        }

        return matchesStatus && matchesSearch && matchesDate && matchesEmployee
    })

    const handleDownload = () => {
        const headers = ["Employee", "Date", "Clock In", "Clock Out", "Duration", "Status"]
        const rows = filteredTimesheets.map(ts => {
            const clockIn = new Date(ts.clockIn)
            const clockOut = ts.clockOut ? new Date(ts.clockOut) : null
            const duration = clockOut
                ? `${Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60))}h ${Math.floor(((clockOut.getTime() - clockIn.getTime()) / (1000 * 60)) % 60)}m`
                : 'Active'

            return [
                ts.employees?.fullName || "Unknown",
                clockIn.toLocaleDateString(),
                clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                clockOut ? clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--",
                duration,
                ts.status
            ]
        })

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `timesheets_report_${dateRange?.label || 'custom'}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading && timesheets.length === 0) {
        return <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>
    }

    const isFinance = user?.role === 'finance'
    const canApprove = ['owner', 'admin', 'hr', 'manager', 'finance'].includes(user?.role || '')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Timesheet Management</h1>
                    <p className="text-muted-foreground">Review and approve employee clock records</p>
                </div>
                {canApprove && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Create Timesheet</span>
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border">
                {/* Search */}
                <div className="w-full md:w-64 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Date Range Picker */}
                    <CustomDatePicker
                        value={dateRange}
                        onChange={setDateRange}
                    />

                    {/* Employee Select */}
                    <div className="w-48">
                        <CustomSelect
                            value={employeeFilter}
                            onChange={setEmployeeFilter}
                            options={[
                                { value: 'all', label: 'All Employees' },
                                ...employees.map(emp => ({ value: emp.id, label: emp.fullName }))
                            ]}
                            placeholder="All Employees"
                        />
                    </div>

                    {/* Status Select */}
                    <div className="w-40">
                        <CustomSelect
                            value={filter}
                            onChange={(val) => setFilter(val as any)}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                            ]}
                        />
                    </div>

                    {/* Bulk Actions (Only visible when pending items exist in view) */}
                    {filteredTimesheets.some(t => t.status === 'pending') && (
                        <div className="flex bg-muted rounded-lg p-1 animate-in fade-in zoom-in-50 duration-300">
                            <button
                                onClick={() => handleBulkAction('approved')}
                                className="p-2 text-green-500 hover:bg-green-500/10 rounded-md transition-all"
                                title="Approve All Pending"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                onClick={() => handleBulkAction('rejected')}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                title="Reject All Pending"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Download Button (Icon Only) */}
                    <button
                        onClick={handleDownload}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        title="Export CSV"
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clock In</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clock Out</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredTimesheets.length > 0 ? (
                            filteredTimesheets.map((ts) => {
                                const clockIn = new Date(ts.clockIn)
                                const clockOut = ts.clockOut ? new Date(ts.clockOut) : null
                                const duration = clockOut
                                    ? `${Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60))}h ${Math.floor(((clockOut.getTime() - clockIn.getTime()) / (1000 * 60)) % 60)}m`
                                    : 'Active'

                                return (
                                    <tr
                                        key={ts.id}
                                        onClick={() => {
                                            setSelectedTimesheet(ts)
                                            setIsDetailModalOpen(true)
                                        }}
                                        className="hover:bg-muted/10 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {ts.employees?.profileImageUrl ? (
                                                    <img src={ts.employees.profileImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center font-bold text-primary">
                                                        {ts.employees?.fullName?.[0] || 'E'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-foreground">{ts.employees?.fullName || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground">{ts.employees?.position || 'Staff'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{formatDate(ts.clockIn)}</td>
                                        <td className="px-6 py-4 text-sm font-mono">{clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-6 py-4 text-sm font-mono">{clockOut ? clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold ${ts.clockOut ? 'text-muted-foreground' : 'text-green-500 animate-pulse'}`}>
                                                {duration}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current bg-background ${ts.status === 'approved' ? 'text-green-500' :
                                                ts.status === 'rejected' ? 'text-destructive' :
                                                    'text-yellow-500'
                                                }`}>
                                                {ts.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Pending Actions */}
                                                {ts.status === 'pending' && ts.clockOut && canApprove && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (actionLoading) return
                                                                handleStatusUpdate(ts.id, 'approved')
                                                            }}
                                                            disabled={!!actionLoading}
                                                            className={`relative p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/10 cursor-pointer disabled:opacity-50`}
                                                            title="Approve"
                                                        >
                                                            <Check size={16} className={actionLoading?.id === ts.id && actionLoading?.status === 'approved' ? 'opacity-20' : ''} />
                                                            {actionLoading?.id === ts.id && actionLoading?.status === 'approved' && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Loader2 size={14} className="animate-spin text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (actionLoading) return
                                                                handleStatusUpdate(ts.id, 'rejected')
                                                            }}
                                                            disabled={!!actionLoading}
                                                            className={`relative p-2 bg-destructive text-white rounded-lg hover:bg-destructive-600 transition-colors shadow-lg shadow-destructive/10 cursor-pointer disabled:opacity-50`}
                                                            title="Reject"
                                                        >
                                                            <X size={16} className={actionLoading?.id === ts.id && actionLoading?.status === 'rejected' ? 'opacity-20' : ''} />
                                                            {actionLoading?.id === ts.id && actionLoading?.status === 'rejected' && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Loader2 size={14} className="animate-spin text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Edit/Manage Action for Admins */}
                                                {canApprove && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedTimesheet(ts)
                                                            setIsEditModalOpen(true)
                                                        }}
                                                        className="p-2 bg-muted text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                                        title="Edit / Force Clock Out"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                                    No timesheets found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <CreateTimesheetModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTimesheets}
            />

            <AdminEditTimesheetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchTimesheets}
                timesheet={selectedTimesheet}
                employeeName={selectedTimesheet?.employees?.fullName || "Employee"}
            />

            <TimesheetDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                timesheet={selectedTimesheet}
                employees={employees}
            />
        </div>
    )
}
