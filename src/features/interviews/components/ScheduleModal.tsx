"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Video, Info } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { scheduleInterviewAction } from "../actions"
import { useAppStore } from "@/store/useAppStore"
import { organizationService } from "@/features/organization/services/organizationService"
import { toast } from "sonner"
import { useEffect } from "react"

interface ScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    applicantId: string
    roleId: string
    candidateName: string
    roleTitle: string
    candidateEmail: string
    onScheduled: () => void
}

export function ScheduleModal({
    isOpen,
    onClose,
    applicantId,
    roleId,
    candidateName,
    roleTitle,
    candidateEmail,
    onScheduled
}: ScheduleModalProps) {
    const { user, organization } = useAppStore()
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<"virtual" | "in_person">("virtual")

    // Default to tomorrow at 10 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultDate = tomorrow.toISOString().split('T')[0]

    const [date, setDate] = useState(defaultDate)
    const [time, setTime] = useState("10:00")
    const [duration, setDuration] = useState(30)
    const [linkOrLocation, setLinkOrLocation] = useState("")
    const [staff, setStaff] = useState<{ id: string, email: string, name: string }[]>([])
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])

    useEffect(() => {
        if (isOpen && organization) {
            loadStaff()
        }
    }, [isOpen, organization])

    const loadStaff = async () => {
        try {
            const data = await organizationService.getOrganizationStaff(organization!.id)
            // Filter out the current user if they are the one scheduling
            setStaff(data.filter((s: any) => s.id !== user?.id))
        } catch (error) {
            console.error("Failed to load staff:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!organization || !user) return

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("organizationId", organization.id)
            formData.append("applicantId", applicantId)
            formData.append("roleId", roleId)
            formData.append("type", type)
            formData.append("date", date)
            formData.append("time", time)
            formData.append("duration", duration.toString())
            if (type === 'virtual') {
                formData.append("link", linkOrLocation)
            } else {
                formData.append("location", linkOrLocation)
            }

            // Email context
            formData.append("candidateName", candidateName)
            formData.append("roleTitle", roleTitle)
            formData.append("candidateEmail", candidateEmail)
            formData.append("performedBy", user.id)

            // Additional Attendees
            selectedAttendees.forEach(email => {
                formData.append("attendeeEmails", email)
            })

            const result = await scheduleInterviewAction(formData)

            if (result.success) {
                toast.success("Interview Scheduled", {
                    description: `Invitation sent to ${candidateName}`
                })
                onScheduled()
                onClose()
            } else {
                console.error("Failed:", result.error)
                toast.error("Scheduling Failed", {
                    description: result.error || "Please try again later."
                })
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule Interview" maxWidth="max-w-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-3 border border-border">
                    <Info size={20} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Scheduling this interview will automatically move <strong>{candidateName}</strong> to the <strong>"Interview Scheduled"</strong> stage and send them an email invitation.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setType("virtual")}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === "virtual" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-border/80 text-muted-foreground"}`}
                    >
                        <Video size={24} />
                        <span className="font-bold">Virtual</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("in_person")}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === "in_person" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-border/80 text-muted-foreground"}`}
                    >
                        <MapPin size={24} />
                        <span className="font-bold">In-Person</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-muted-foreground" />
                            <Input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Time</label>
                        <div className="relative">
                            <Clock size={16} className="absolute left-3 top-3 text-muted-foreground" />
                            <Input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Duration (minutes)</label>
                    <div className="flex items-center gap-2">
                        {[15, 30, 45, 60].map(mins => (
                            <button
                                key={mins}
                                type="button"
                                onClick={() => setDuration(mins)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${duration === mins ? "bg-primary text-white border-primary" : "bg-card border-border hover:bg-muted"}`}
                            >
                                {mins}m
                            </button>
                        ))}
                        <div className="flex-1 relative">
                            <Input
                                type="number"
                                min="5"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                                className="w-full text-center h-10"
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-3 pb-2 border-b border-border/50">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Additional Attendees (Staff)</label>
                    <div className="bg-muted/10 border border-border rounded-xl p-4 max-h-40 overflow-y-auto space-y-2.5">
                        {staff.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No other team members found.</p>
                        ) : (
                            staff.map(member => (
                                <div key={member.id} className="flex items-center gap-3 group">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            id={`staff-${member.id}`}
                                            checked={selectedAttendees.includes(member.email)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAttendees([...selectedAttendees, member.email])
                                                } else {
                                                    setSelectedAttendees(selectedAttendees.filter(e => e !== member.email))
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        />
                                    </div>
                                    <label htmlFor={`staff-${member.id}`} className="text-sm font-medium text-foreground cursor-pointer flex-1 group-hover:text-primary transition-colors">
                                        {member.name} <span className="text-xs text-muted-foreground ml-1">({member.email})</span>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                        {type === "virtual" ? "Meeting Details" : "Office Location / Address"}
                    </label>

                    {type === "virtual" ? (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Google Meet Link Auto-Generation</p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">A Google Meet link will be automatically created and emailed to {candidateName}.</p>
                            </div>
                        </div>
                    ) : (
                        <Input
                            type="text"
                            required
                            placeholder="e.g., 123 Innovation Dr, Suite 100"
                            value={linkOrLocation}
                            onChange={(e) => setLinkOrLocation(e.target.value)}
                            className="h-10"
                        />
                    )}
                </div>

                <div className="flex gap-3 pt-2 mt-6 border-t border-border sticky bottom-0 bg-background pb-2">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer" disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1 font-bold cursor-pointer" disabled={loading}>
                        {loading ? "Scheduling..." : "Confirm & Send"}
                    </Button>
                </div>

            </form>
        </Modal>
    )
}
