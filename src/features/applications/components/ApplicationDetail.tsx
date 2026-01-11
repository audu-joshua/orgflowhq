"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Mail,
    FileText,
    Phone,
    Send,
    ExternalLink,
    Calendar,
    ZoomIn,
    X,
    User,
    LayoutDashboard,
    Users
} from "lucide-react"
import { applicationService } from "../services/applicationService"
import { DocumentViewerModal } from "./DocumentViewerModal"
import { ScheduleModal } from "@/features/interviews/components/ScheduleModal"
import { APPLICATION_STATUS, STATUS_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/utils"
import type { Application } from "../types"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

interface ApplicationDetailProps {
    applicationId: string
}

export function ApplicationDetail({ applicationId }: ApplicationDetailProps) {
    const router = useRouter()
    const [application, setApplication] = useState<(Application & { roles?: { title: string } }) | null>(null)
    const [status, setStatus] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [updating, setUpdating] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [emailSubject, setEmailSubject] = useState("")
    const [emailBody, setEmailBody] = useState("")
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null)
    const [activeDocTitle, setActiveDocTitle] = useState("")

    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [dropUp, setDropUp] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

    // ... existing status logic ...

    // Auto-scroll dashboard main container to top when document is opened
    // ...

    const handleStageUpdate = async (newStage: string) => {
        // If Interview Scheduled, open modal instead of direct update
        if (newStage === "Interview Scheduled") {
            setIsScheduleModalOpen(true)
            setIsStatusOpen(false)
            return
        }

        setUpdating(true)
        setIsStatusOpen(false)
        try {
            await applicationService.updateApplicationStage(applicationId, newStage)

            // Also update local state status mapping if possible, or reload
            // For now, reload simple
            const updated = await applicationService.getApplicationById(applicationId)
            setApplication(updated)
            setStatus(updated.status)
        } catch (error) {
            console.error("Failed to update stage:", error)
        } finally {
            setUpdating(false)
        }
    }

    // Deprecate direct usage of handleStatusUpdate for UI except for legacy
    // ...

    // Replace handleStatusChange usage with handleStageUpdate in the UI mapping

    // Auto-scroll dashboard main container to top when document is opened
    useEffect(() => {
        if (activeDocUrl) {
            const mainContent = document.querySelector('main')
            if (mainContent) {
                mainContent.scrollTo({ top: 0, behavior: "smooth" })
                // Fallback for immediate jump if smooth is interrupted
                const timer = setTimeout(() => {
                    mainContent.scrollTop = 0
                }, 100)
                return () => clearTimeout(timer)
            }
        }
    }, [activeDocUrl])

    useEffect(() => {
        const loadApplication = async () => {
            try {
                setLoading(true)
                const data = await applicationService.getApplicationById(applicationId)
                setApplication(data)
                setStatus(data.status)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load application")
            } finally {
                setLoading(false)
            }
        }

        if (applicationId) {
            loadApplication()
        }
    }, [applicationId])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isStatusOpen && !(event.target as Element).closest(".status-dropdown")) {
                setIsStatusOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isStatusOpen])

    const handleStatusUpdate = async (newStatus: Application["status"]) => {
        setUpdating(true)
        try {
            await applicationService.updateApplicationStatus(applicationId, newStatus)
            setStatus(newStatus)
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setUpdating(false)
        }
    }

    const handleStatusChange = async (newStatus: Application["status"]) => {
        setIsStatusOpen(false)
        // Check mapping: newStatus is roughly the stage? 
        // We really want to use the stage management logic now.
        // For "Interview Scheduled" -> that's a stage, but here newStatus is likely "interviewed".
        // If the user selects "Interviewed" from dropdown, we assume they mean "Interviewed" stage?
        // Or if we want to trigger the modal, we need "Interview Scheduled" stage.
        // The dropdown currently lists STATUS_LABELS.

        // Map status to Stage roughly
        let stage = STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus

        // If they select "Interviewed" (which is likely just 'interviewed' key), 
        // should we trigger the modal? 
        // The mental model says: "HR moves applicant to: Interview Scheduled".
        // The current dropdown has "Interviewed" (past tense).
        // For MVP, let's treat "Interviewed" selection as "Trigger Scheduling"? 
        // OR better: add "Interview Scheduled" to the dropdown OPTIONS in the UI loop below?

        // Actually, let's just use handleStageUpdate.
        await handleStageUpdate(stage)
    }

    const toggleStatusDropdown = () => {
        if (!isStatusOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const dropdownHeight = 300 // Estimated max height
            setDropUp(spaceBelow < dropdownHeight && rect.top > dropdownHeight)
        }
        setIsStatusOpen(!isStatusOpen)
    }

    const handleSendEmail = () => {
        if (!application) return
        const mailtoLink = `mailto:${application.applicant_email}?subject=${encodeURIComponent(emailSubject || `Update on your application for ${application.roles?.title || 'position'}`)}&body=${encodeURIComponent(emailBody || 'Dear ' + application.applicant_name + ',')}`
        window.location.href = mailtoLink
    }

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>
    if (error || !application) return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border border-border">
            <X size={48} className="text-destructive mb-4" />
            <h2 className="text-2xl font-black text-foreground mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">{error || "Application not found"}</p>
            <button onClick={() => router.back()} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Go Back</button>
        </div>
    )

    const documentSections = [
        { label: "Resume", url: application.resume_url, icon: FileText },
        { label: "Cover Letter", url: application.cover_letter, icon: FileText },
    ].filter(doc => doc.url)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {application && (
                <ScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    applicantId={application.id}
                    roleId={application.role_id}
                    candidateName={application.applicant_name}
                    candidateEmail={application.applicant_email}
                    roleTitle={application.roles?.title || "Role"}
                    onScheduled={async () => {
                        // Refresh application data
                        const updated = await applicationService.getApplicationById(applicationId)
                        setApplication(updated)
                        setStatus(updated.status)
                    }}
                />
            )}
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2.5 px-4 py-2 bg-background/50 backdrop-blur-md border border-border rounded-xl hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 group-hover:text-white transition-all" />
                    <span className="font-semibold text-foreground/80 group-hover:text-white transition-colors">Back</span>
                </button>

                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                    <span>/</span>
                    <Users size={14} />
                    <span>Applications</span>
                    <span>/</span>
                    <span className="text-primary font-bold">Candidate Profile</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Header Card */}
                    <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-border p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div
                                className="relative group cursor-pointer shrink-0"
                                onClick={() => application.applicant_passport && setIsLightboxOpen(true)}
                            >
                                {application.applicant_passport ? (
                                    <div className="w-32 h-32 rounded-[1.5rem] overflow-hidden border-4 border-card shadow-2xl relative">
                                        <img
                                            src={application.applicant_passport}
                                            alt={application.applicant_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn size={24} className="text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border-4 border-dashed border-primary/20">
                                        <span className="text-primary font-black text-4xl">{application.applicant_name?.[0].toUpperCase()}</span>
                                    </div>
                                )}
                                {/* Status Badge Over Image */}
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[9px] font-black px-2 py-1 rounded-full border-2 border-card shadow-lg uppercase tracking-wider">
                                    Active
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left pt-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                                    <h1 className="text-3xl font-black text-foreground tracking-tight leading-tight">{application.applicant_name}</h1>
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mb-6 text-muted-foreground font-semibold text-base">
                                    <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer bg-muted/30 px-3 py-1.5 rounded-xl">
                                        <Mail size={16} className="text-primary" />
                                        {application.applicant_email}
                                    </div>
                                    {application.applicant_phone && (
                                        <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer bg-muted/30 px-3 py-1.5 rounded-xl">
                                            <Phone size={16} className="text-primary" />
                                            {application.applicant_phone}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm text-sm">
                                        <Calendar size={16} />
                                        <span className="font-bold">Applied {formatDate(application.created_at)}</span>
                                    </div>
                                    {application.roles?.title && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive text-white border border-destructive/20 shadow-sm text-sm">
                                            <User size={16} className="text-white fill-white" />
                                            <span className="font-medium">Applied for <span className="text-white font-black uppercase tracking-tight ml-0.5">{application.roles.title}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Content Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Documents Card */}
                        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-lg">
                            <h3 className="text-xl font-black text-foreground tracking-tight mb-6 flex items-center gap-3">
                                <FileText className="text-primary" size={20} />
                                Experience Portfolio
                            </h3>
                            {documentSections.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-muted/20">
                                    <p className="text-muted-foreground font-bold text-sm">No candidate documents attached.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {documentSections.map((doc, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setActiveDocUrl(doc.url ?? null)
                                                setActiveDocTitle(`${application.applicant_name}'s ${doc.label}`)
                                            }}
                                            className="group w-full flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-primary/5 hover:border-primary/40 transition-all text-left shadow-sm cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                                    <doc.icon size={20} />
                                                </div>
                                                <div>
                                                    <span className="block font-black text-foreground text-base tracking-tight">{doc.label}</span>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Review applicant {doc.label.toLowerCase()}</span>
                                                </div>
                                            </div>
                                            <ZoomIn size={16} className="text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Update Card */}
                        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-lg flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight mb-2">Stage Management</h3>
                                <p className="text-sm text-muted-foreground font-medium mb-6">Transition the candidate throughout the recruitment workflow.</p>

                                <div className="space-y-4">
                                    <div className="relative">
                                        {/* Status Dropdown Logic will go here */}
                                        <div className="relative status-dropdown" ref={dropdownRef}>
                                            <button
                                                onClick={toggleStatusDropdown}
                                                className={`w-full flex items-center justify-between px-6 py-3.5 border border-border rounded-xl bg-muted/30 text-foreground font-black text-base hover:border-primary transition-all cursor-pointer shadow-inner ${isStatusOpen ? 'border-primary ring-4 ring-primary/10' : ''}`}
                                            >
                                                {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                                                <ArrowLeft size={16} className={`text-primary transition-transform duration-300 ${isStatusOpen ? 'rotate-90' : '-rotate-90'}`} />
                                            </button>

                                            {/* Custom Dropdown Content */}
                                            <AnimatePresence>
                                                {isStatusOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: dropUp ? 10 : -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: dropUp ? 10 : -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`absolute left-0 right-0 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden ${dropUp ? 'bottom-full mb-3' : 'top-full mt-3'}`}
                                                    >
                                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                            {Object.entries(APPLICATION_STATUS).map(([key, value]) => (
                                                                <button
                                                                    key={value}
                                                                    onClick={() => handleStatusChange(value as Application["status"])}
                                                                    className={`w-full text-left px-5 py-3 text-sm font-bold hover:bg-primary hover:text-white transition-all border-b border-border/40 last:border-none ${status === value ? 'bg-primary/10 text-primary' : ''}`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span>
                                                                            {value === APPLICATION_STATUS.INTERVIEW_SCHEDULED
                                                                                ? "Schedule Interview"
                                                                                : STATUS_LABELS[value]}
                                                                        </span>
                                                                        {status === value && <div className="w-2 h-2 bg-primary rounded-full" />}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-3 bg-primary/5 rounded-xl border border-primary/10 text-center">
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">Current Status: {status.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Composition Form Overlay */}
            <AnimatePresence>
                {showEmailForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-card border border-border rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                            <div className="p-8 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Mail size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground tracking-tight leading-tight">Draft Recruitment Message</h3>
                                </div>
                                <button
                                    onClick={() => setShowEmailForm(false)}
                                    className="p-2.5 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 ml-1">Message Subject</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Subject line..."
                                        className="w-full px-6 py-4 border-2 border-border rounded-2xl bg-muted/30 text-foreground font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 ml-1">Your Professional Message</label>
                                    <textarea
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Write your message here..."
                                        rows={8}
                                        className="w-full px-6 py-4 border-2 border-border rounded-2xl bg-muted/30 text-foreground font-medium resize-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleSendEmail}
                                        className="flex-1 py-5 bg-primary text-white rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all font-black text-xl shadow-xl shadow-primary/20 cursor-pointer"
                                    >
                                        Launch Email Client
                                    </button>
                                    <button
                                        onClick={() => setShowEmailForm(false)}
                                        className="px-8 py-5 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all cursor-pointer"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox for Passport Photo */}
            {isLightboxOpen && application.applicant_passport && (
                <div
                    className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-xl"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute -top-6 -right-6 z-10 p-4 bg-white text-black rounded-full shadow-2xl border border-border hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X size={28} />
                        </button>
                        <img
                            src={application.applicant_passport}
                            alt={application.applicant_name}
                            className="max-w-full max-h-[85vh] rounded-[3rem] shadow-2xl border-8 border-white/5"
                        />
                    </div>
                </div>
            )}

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={!!activeDocUrl}
                url={activeDocUrl}
                title={activeDocTitle}
                onClose={() => setActiveDocUrl(null)}
                applicantEmail={application.applicant_email}
            />
        </div>
    )
}
