"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { interviewService } from "../services/interviewService"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, Briefcase, ExternalLink, ChevronLeft, ChevronRight, CheckCircle, Plus } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { disconnectGoogleAction } from "@/features/integrations/actions"

interface InterviewsListProps {
    isGoogleConnected: boolean
}

export function InterviewsList({ isGoogleConnected }: InterviewsListProps) {
    const { organization, user } = useAppStore()
    const [interviews, setInterviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const searchParams = useSearchParams()
    const router = useRouter()
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        if (!organization) return

        const loadInterviews = async () => {
            try {
                const data = await interviewService.getInterviewsByOrganization(organization.id)
                setInterviews(data)
            } catch (error) {
                console.error("Failed to load interviews:", error)
            } finally {
                setLoading(false)
            }
        }

        loadInterviews()
    }, [organization])

    // Handle OAuth Callback Params
    useEffect(() => {
        const success = searchParams.get("success")
        const error = searchParams.get("error")

        if (success === "google_connected") {
            toast.success("Google Calendar Connected", {
                description: "Interviews will now be synced to your primary calendar."
            })
            router.replace("/dashboard/interviews")
        }

        if (error) {
            toast.error("Connection Failed", {
                description: "Failed to connect Google Calendar. Please try again."
            })
            router.replace("/dashboard/interviews")
        }
    }, [searchParams, router])

    if (loading) return <LoadingSpinner />

    // Calendar Logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
    const weeks = []
    let days = []
    let day = startDate

    // Group days into weeks for grid
    // Actually, easier just to map grid-cols-7

    const handleConnectGoogle = () => {
        window.location.href = "/api/auth/google/connect"
    }

    const handleDisconnectGoogle = async () => {
        try {
            const result = await disconnectGoogleAction()
            if (result.success) {
                toast.success("Disconnected Google Calendar")
                router.refresh() // Refresh to update isGoogleConnected prop
            }
        } catch (error) {
            toast.error("Failed to disconnect")
        }
    }

    const handleDelete = async () => {
        if (!selectedInterview) return

        try {
            // Dynamically import action to avoid top-level server action issues in client component if any
            const { deleteInterviewAction } = await import("../actions")
            const result = await deleteInterviewAction(selectedInterview.id)

            if (result.success) {
                toast.success("Interview Deleted")
                setSelectedInterview(null)
                setShowDeleteConfirm(false)
                // Refresh list
                const data = await interviewService.getInterviewsByOrganization(organization!.id)
                setInterviews(data)
            } else {
                toast.error("Failed to delete interview")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting interview")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Interview Schedule</h1>
                    <p className="text-muted-foreground">Manage upcoming interviews and sync with Google.</p>
                </div>

                <div className="flex items-center gap-3">
                    {isGoogleConnected ? (
                        <Button variant="outline" onClick={handleDisconnectGoogle} className="gap-2 shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all cursor-pointer">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-50 grayscale" />
                            Disconnect Calendar
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={handleConnectGoogle} className="gap-2 shadow-sm hover:bg-white hover:text-black transition-all cursor-pointer">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                            Connect Google Calendar
                        </Button>
                    )}
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-card p-4 rounded-t-xl border border-border">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground">
                        {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-background rounded-md transition"><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold hover:bg-background rounded-md transition h-6">Today</button>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-background rounded-md transition"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-card border-x border-b border-border rounded-b-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                        <div key={dayName} className="p-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {dayName}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-[minmax(120px,_1fr)] divide-x divide-y divide-border/50">
                    {calendarDays.map((dayItem, idx) => {
                        const isCurrentMonth = isSameMonth(dayItem, monthStart)
                        const dayInterviews = interviews.filter(i => isSameDay(new Date(i.scheduled_at), dayItem))

                        return (
                            <div
                                key={dayItem.toISOString()}
                                className={`p-2 min-h-[120px] relative transition-colors ${!isCurrentMonth ? 'bg-muted/10 text-muted-foreground' : 'bg-card'} ${isToday(dayItem) ? 'bg-primary/5' : ''}`}
                            >
                                <div className={`text-right mb-2 text-sm font-medium ${isToday(dayItem) ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                    {format(dayItem, "d")}
                                </div>

                                <div className="space-y-1">
                                    {dayInterviews.map(interview => (
                                        <div
                                            key={interview.id}
                                            className="px-2 py-1.5 rounded-md text-xs font-medium border border-l-4 truncate cursor-pointer hover:brightness-95 transition-all shadow-sm group"
                                            style={{
                                                borderColor: interview.status === 'scheduled' ? '#3b82f6' : '#9ca3af',
                                                backgroundColor: interview.status === 'scheduled' ? '#eff6ff' : '#f3f4f6',
                                                color: interview.status === 'scheduled' ? '#1d4ed8' : '#374151'
                                            }}
                                            onClick={() => {
                                                setSelectedInterview(interview)
                                                setShowDeleteConfirm(false)
                                            }}
                                        >
                                            <div className="font-bold flex items-center justify-between">
                                                <span>{format(new Date(interview.scheduled_at), "h:mm a")}</span>
                                                {interview.type === 'virtual' && <Video size={10} />}
                                            </div>
                                            <div className="truncate">{interview.applications?.applicant_name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>


            {/* Event Detail Modal */}
            <Modal isOpen={!!selectedInterview} onClose={() => setSelectedInterview(null)} title="Interview Details">
                {selectedInterview && (
                    <div className="p-6 space-y-6">
                        {showDeleteConfirm ? (
                            <div className="space-y-4 py-4">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-destructive">Delete Interview?</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Are you sure you want to delete this interview with <strong>{selectedInterview.applications?.applicant_name}</strong>?
                                        <br />This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-center pt-2 mt-6 border-t border-border sticky bottom-1 bg-background pb-1">
                                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-[100px] cursor-pointer">Cancel</Button>
                                    <Button variant="destructive" onClick={handleDelete} className="w-[100px] cursor-pointer">Delete</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-4 pb-4 border-b border-border">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                        {selectedInterview.applications?.applicant_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{selectedInterview.applications?.applicant_name}</h3>
                                        <p className="text-muted-foreground">{selectedInterview.roles?.title || "Role Check"}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {format(new Date(selectedInterview.scheduled_at), "EEEE, MMMM d, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {format(new Date(selectedInterview.scheduled_at), "h:mm a")} - {format(new Date(new Date(selectedInterview.scheduled_at).getTime() + selectedInterview.duration * 60000), "h:mm a")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        {selectedInterview.type === 'virtual' ? <Video className="w-4 h-4 text-muted-foreground" /> : <MapPin className="w-4 h-4 text-muted-foreground" />}
                                        <span className="capitalize font-medium">{selectedInterview.type} Interview</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl space-y-2">
                                    <p className="text-xs font-bold uppercase text-muted-foreground">
                                        {selectedInterview.type === 'virtual' ? 'Meeting Link' : 'Location'}
                                    </p>
                                    {selectedInterview.type === 'virtual' && selectedInterview.meeting_link ? (
                                        <a
                                            href={selectedInterview.meeting_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 text-primary font-bold hover:underline break-all"
                                        >
                                            <ExternalLink size={14} />
                                            {selectedInterview.meeting_link}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-medium">{selectedInterview.location || selectedInterview.meeting_link || "Not specified"}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2 mt-6 border-t border-border sticky bottom-1 bg-background pb-1">
                                    <Button variant="destructive" className="flex-1 cursor-pointer" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
                                    <Button variant="outline" className="flex-1 cursor-pointer" onClick={() => setSelectedInterview(null)}>Close</Button>
                                    {selectedInterview.type === 'virtual' && selectedInterview.meeting_link && (
                                        <Button className="flex-1 font-bold cursor-pointer" onClick={() => window.open(selectedInterview.meeting_link, '_blank')}>
                                            Join Meeting
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div >
    )
}
