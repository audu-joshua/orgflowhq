"use client"

import { useEffect, useState } from "react"
import { X, Clock, FileText, User, ShieldAlert, Calendar } from "lucide-react"
import { format } from "date-fns"
import type { Timesheet } from "../types"
import type { Employee } from "@/features/departments/types"

interface TimesheetDetailModalProps {
    timesheet: Timesheet | null
    isOpen: boolean
    onClose: () => void
    employees: Employee[] // Pass full list to resolve IDs
}

export function TimesheetDetailModal({ timesheet, isOpen, onClose, employees }: TimesheetDetailModalProps) {
    if (!isOpen || !timesheet) return null

    const employee = employees.find(e => e.id === timesheet.employeeId || e._id === timesheet.employeeId)
    const creator = employees.find(e => e.userId === timesheet.createdBy || e.id === timesheet.createdBy)

    // Format Times
    const clockIn = new Date(timesheet.clockIn)
    const clockOut = timesheet.clockOut ? new Date(timesheet.clockOut) : null

    const duration = clockOut
        ? `${Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60))}h ${Math.floor(((clockOut.getTime() - clockIn.getTime()) / (1000 * 60)) % 60)}m`
        : 'Active Session'

    const wasAdminCreated = timesheet.createdVia === 'admin_override'

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                    <div className="flex items-center gap-3">
                        {employee?.profileImageUrl ? (
                            <img src={employee.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                {employee?.fullName?.[0] || "E"}
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{employee?.fullName || "Unknown Employee"}</h2>
                            <p className="text-sm text-muted-foreground">{employee?.position || "Staff Member"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Timesheet Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${timesheet.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            timesheet.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                            {timesheet.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 rounded-xl border border-border">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar size={14} />
                                <span className="text-xs font-bold uppercase">Date</span>
                            </div>
                            <p className="font-medium">{format(clockIn, "PPP")}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock size={14} />
                                <span className="text-xs font-bold uppercase">Duration</span>
                            </div>
                            <p className="font-medium">{duration}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Clock In</label>
                            <p className="font-mono text-sm">{format(clockIn, "pp")}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Clock Out</label>
                            <p className="font-mono text-sm">{clockOut ? format(clockOut, "pp") : "---"}</p>
                        </div>
                    </div>

                    {/* Audit Trail Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <ShieldAlert size={16} className="text-primary" />
                            Audit Log
                        </h3>

                        <div className="text-sm space-y-3 border-l-2 border-border pl-4">

                            {/* Creation Log */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-border" />
                                <p className="font-medium text-foreground">Record Created</p>
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${wasAdminCreated ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                        {wasAdminCreated ? 'Admin Override' : 'Standard Clock-In'}
                                    </span>
                                    <span className="text-xs">• {format(new Date(timesheet.createdAt || timesheet.clockIn), "PP p")}</span>
                                </div>
                            </div>

                            {/* If Admin Override, Show Details */}
                            {wasAdminCreated && (
                                <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10 mt-2">
                                    <div className="flex items-start gap-2">
                                        <User size={14} className="mt-0.5 text-orange-500" />
                                        <div className="space-y-1">
                                            <p className="text-xs text-orange-600 font-medium">Created by: {creator?.fullName || "Unknown Admin"}</p>
                                            {timesheet.overrideReason && (
                                                <p className="text-xs text-muted-foreground italic">"{timesheet.overrideReason}"</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes (Edit Reason) */}
                            {timesheet.notes && !wasAdminCreated && (
                                <div className="relative pt-2">
                                    <div className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-border" />
                                    <p className="font-medium text-foreground">Notes / Modifications</p>
                                    <p className="text-sm text-muted-foreground mt-1 bg-muted/30 p-2 rounded-lg italic">
                                        "{timesheet.notes}"
                                    </p>
                                </div>
                            )}

                            {/* History Log Section */}
                            {timesheet.history && Array.isArray(timesheet.history) && timesheet.history.length > 0 && (
                                <div className="relative pt-4 mt-4 border-t border-border">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">Modification History</h4>
                                    <div className="space-y-6">
                                        {[...timesheet.history].reverse().map((log: any, index: number) => {
                                            const actor = employees.find(e => e.userId === log.actor_id || e.id === log.actor_id)
                                            const changeTime = new Date(log.timestamp)
                                            return (
                                                <div key={index} className="relative pl-4 border-l-2 border-muted">
                                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-muted-foreground/50" />

                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {actor?.fullName || "Unknown User"}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(changeTime, "PP p")}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1">
                                                            {Object.entries(log.changes || {}).map(([field, newVal]: [string, any]) => (
                                                                <div key={field} className="text-xs bg-muted/40 p-1.5 rounded flex items-center gap-2">
                                                                    <span className="font-mono text-muted-foreground uppercase">{field.replace('_', ' ')}:</span>
                                                                    <span className="font-medium text-foreground truncate max-w-[200px]">
                                                                        {String(newVal)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/20 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-background border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    )
}
