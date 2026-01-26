"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Clock, User, FileText, CheckCircle2 } from "lucide-react"
import { createTimesheetAction } from "@/features/timesheets/actions"
import { getEmployeesByOrganizationAction } from "@/features/departments/actions"
import { useAppStore } from "@/store/useAppStore"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { toast } from "@/lib/toast"
import type { Employee } from "@/features/departments/types"

interface CreateTimesheetModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateTimesheetModal({ isOpen, onClose, onSuccess }: CreateTimesheetModalProps) {
    const { organization } = useAppStore()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
    const [date, setDate] = useState("")
    const [clockInTime, setClockInTime] = useState("09:00")
    const [clockOutTime, setClockOutTime] = useState("17:00")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (isOpen && organization) {
            loadEmployees()
            // Default to today
            setDate(new Date().toISOString().split('T')[0])
        }
    }, [isOpen, organization])

    const loadEmployees = async () => {
        if (!organization) return
        setLoading(true)
        try {
            const data = await getEmployeesByOrganizationAction(organization.id)
            setEmployees(data as any)
        } catch (error) {
            toast.error("Failed to load employees")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedEmployeeId || !date || !clockInTime || !organization) {
            toast.error("Please fill in all required fields")
            return
        }

        setSubmitting(true)
        try {
            // Construct ISO strings
            const startDateTime = new Date(`${date}T${clockInTime}:00`).toISOString()
            const endDateTime = clockOutTime ? new Date(`${date}T${clockOutTime}:00`).toISOString() : null

            const result = await createTimesheetAction({
                employee_id: selectedEmployeeId,
                organization_id: organization.id,
                clock_in: startDateTime,
                clock_out: endDateTime,
                notes: notes
            })

            if (!result.success) throw new Error(result.error)

            toast.success("Timesheet created successfully")
            onSuccess()
            onClose()

            // Reset form
            setSelectedEmployeeId("")
            setNotes("")
        } catch (error) {
            console.error(error)
            toast.error("Failed to create timesheet")
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    const employeeOptions = employees.map(emp => ({
        value: emp.id,
        label: emp.full_name || emp.email || "Unknown Employee"
    }))

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Create Timesheet</h2>
                        <p className="text-sm text-muted-foreground">Manually log hours for an employee</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Employee</label>
                        <CustomSelect
                            value={selectedEmployeeId}
                            onChange={setSelectedEmployeeId}
                            options={employeeOptions}
                            placeholder="Select Employee..."
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            {/* Empty spacer or shift type? Keeping simple for now */}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Clock In</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-green-500" size={16} />
                                <input
                                    type="time"
                                    value={clockInTime}
                                    onChange={(e) => setClockInTime(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Clock Out</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-red-500" size={16} />
                                <input
                                    type="time"
                                    value={clockOutTime}
                                    onChange={(e) => setClockOutTime(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-destructive">Override Reason (Required)</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-muted-foreground" size={16} />
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Explain why this manual record is being created..."
                                rows={3}
                                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground pt-1">
                            This triggered creation will be logged as an <strong>Admin Override</strong>.
                        </p>
                    </div>              </div>


                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/20 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        {submitting ? "Saving..." : <><CheckCircle2 size={16} /> Save Record</>}
                    </button>
                </div>

            </div>
        </div>
    )
}
