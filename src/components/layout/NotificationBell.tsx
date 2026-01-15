"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Calendar, Clock, ChevronRight } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { interviewService } from "@/features/interviews/services/interviewService"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"

export function NotificationBell() {
    const { organization, user } = useAppStore()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const bellRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (!organization || !user) return

        const fetchNotifications = async () => {
            try {
                // For now, notifications are just upcoming interviews
                // In a real app, this might come from a dedicated notifications table
                const interviews = await interviewService.getInterviewsByOrganization(organization.id)

                const upcoming = interviews.filter(i =>
                    new Date(i.scheduled_at) > new Date() && i.status === 'scheduled'
                )

                setNotifications(upcoming)
                setUnreadCount(upcoming.length)
            } catch (error) {
                console.error("Failed to fetch notifications", error)
            }
        }

        fetchNotifications()
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [organization, user])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!user) return null

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-muted transition-all duration-300 cursor-pointer text-foreground"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h3 className="font-bold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {notifications.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setIsOpen(false)
                                                // Ideally mark as read
                                                router.push('/dashboard/interviews')
                                            }}
                                            className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-start gap-4 group"
                                        >
                                            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Calendar size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">
                                                    Interview with {item.applications?.applicant_name || "Candidate"}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {item.roles?.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(item.scheduled_at).toDateString() === new Date().toDateString() ? 'Today' : formatDate(item.scheduled_at)}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-border group-hover:text-primary transition-colors self-center opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-border bg-muted/30">
                            <Link
                                href="/dashboard/interviews"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors w-full py-2"
                            >
                                View All Activity
                                <ChevronRight size={12} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
