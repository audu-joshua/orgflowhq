"use client"

import { useState, useEffect } from "react"
import { X, Clock, FileText, CheckCircle2, Lock } from "lucide-react"
import { timesheetService } from "@/features/timesheets/services/timesheetService"
import { toast } from "sonner"
import type { Timesheet } from "@/features/timesheets/services/timesheetService"
import { format } from "date-fns"

interface AdminEditTimesheetModalProps {
    timesheet: Timesheet | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    employeeName: string
}

export function AdminEditTimesheetModal({ timesheet, isOpen, onClose, onSuccess, employeeName }: AdminEditTimesheetModalProps) {
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [clockOutTime, setClockOutTime] = useState("")
    const [notes, setNotes] = useState("")

    useEffect(() => {
        if (isOpen && timesheet) {
            // Extract time from ISO string for input[type="time"]
            if (timesheet.clock_out) {
                const dateObj = new Date(timesheet.clock_out)
                const hours = dateObj.getHours().toString().padStart(2, '0')
                const minutes = dateObj.getMinutes().toString().padStart(2, '0')
                setClockOutTime(`${hours}:${minutes}`)
            } else {
                setClockOutTime("")
            }
            setNotes(timesheet.notes || "")
        }
    }, [isOpen, timesheet])

    const handleSubmit = async () => {
        if (!timesheet) return

        setSubmitting(true)
        try {
            let endDateTime = null

            if (clockOutTime) {
                // We need to combine the original date from clock_in (or clock_out if exists) with the new time
                // However, clock_out might be next day? For simplicity, let's assume same day as clock_in 
                // OR preserve the date part of the existing clock_out if it exists.
                // If clock_out was null, we assume same day as clock_in.

                const baseDate = new Date(timesheet.clock_in)
                const [hours, minutes] = clockOutTime.split(':').map(Number)

                // Create new date object based on clock_in date
                const newClockOut = new Date(baseDate)
                newClockOut.setHours(hours, minutes, 0, 0)

                // Handle overnight shifts? 
                // If new time is earlier than clock_in, maybe it's next day? 
                // Use a simple heuristic: if clockOut < clockIn, add 1 day.
                if (newClockOut < new Date(timesheet.clock_in)) {
                    newClockOut.setDate(newClockOut.getDate() + 1)
                }

                endDateTime = newClockOut.toISOString()
            }

            await timesheetService.adminUpdateTimesheet(timesheet.id, {
                clock_out: endDateTime || undefined, // undefined means don't update if null, but here we probably want to set it?
                // Actually if user clears it, maybe we should set to null? But adminUpdateTimesheet expects string | undefined. 
                // Let's assume we are setting a value. If they clear it, it effectively "reopens" the shift? 
                // Let's force a value for now as the main use case is "Clocking Out" or "Fixing Time".
                notes: notes
            })

            toast.success("Timesheet updated successfully")
            onSuccess()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update timesheet")
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen || !timesheet) return null

    const clockInDisplay = format(new Date(timesheet.clock_in), "p")
    const dateDisplay = format(new Date(timesheet.clock_in), "PPP")

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Edit Timesheet</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-primary">{employeeName}</span>
                            <span className="text-xs text-muted-foreground">• {dateDisplay}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    <div className="p-4 bg-muted/40 rounded-lg border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-full text-green-500">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground">Clock In</p>
                                <p className="text-lg font-bold text-foreground">{clockInDisplay}</p>
                            </div>
                        </div>
                        <Lock size={16} className="text-muted-foreground/50" />
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
                        <p className="text-[10px] text-muted-foreground pt-1">
                            Modifying this will close the shift at the specified time.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Reason for Edit</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-muted-foreground" size={16} />
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Reason for modification..."
                                rows={3}
                                className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                </div>

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
                        {submitting ? "Saving..." : <><CheckCircle2 size={16} /> Update Record</>}
                    </button>
                </div>

            </div>
        </div>
    )
}
