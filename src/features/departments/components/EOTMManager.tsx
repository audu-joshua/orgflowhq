"use client"

import { useState, useEffect } from "react"
import { Trophy, Calendar, Zap, AlertTriangle, Loader2, Sparkles, Eye } from "lucide-react"
import { eotmService } from "../services/eotmService"
import { useAppStore } from "@/store/useAppStore"
import type { EOTMCompetition } from "../types/eotm"
import { toast } from "@/lib/toast"

export function EOTMManager() {
    const { organization } = useAppStore()
    const [competition, setCompetition] = useState<EOTMCompetition | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    const loadStatus = async () => {
        if (!organization) return
        try {
            const data = await eotmService.getActiveCompetition(organization.id)
            setCompetition(data)
        } catch (error) {
            console.error("Failed to load EOTM status:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStatus()
    }, [organization])

    const handleForceStart = async () => {
        if (!organization) return
        setActionLoading(true)
        try {
            const data = await eotmService.devForceStartVoting(organization.id)
            setCompetition(data)
            toast.success("EOTM Voting Window Forced Open!")
        } catch (error) {
            toast.error("Failed to force start voting")
        } finally {
            setActionLoading(false)
        }
    }

    const handleForceReveal = async () => {
        if (!competition) return
        setActionLoading(true)
        try {
            await eotmService.devForceReveal(competition.id)
            await loadStatus()
            toast.success("EOTM Reveal Phase Forced!")
        } catch (error) {
            toast.error("Failed to force reveal")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return null

    return (
        <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110">
                <Trophy size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                            <Sparkles size={14} />
                            <span>Employee of the Month Hub</span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Recognition & Culture</h2>
                        <p className="text-sm text-muted-foreground max-w-xl font-medium">
                            Every month, your team celebrates excellence. Voting opens automatically on the 24th,
                            and the winner is revealed on the last day.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <div className="px-4 py-3 bg-card border border-border rounded-xl flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${competition?.status === 'VOTING_OPEN' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Cycle</p>
                                <p className="text-sm font-bold text-foreground capitalize">{competition?.status?.replace('_', ' ') || 'Inactive'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Developer Test Shield */}
                <div className="mt-8 pt-6 border-t border-primary/10">
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                        <AlertTriangle size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Developer Test Shield</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleForceStart}
                            disabled={actionLoading || competition?.status === 'VOTING_OPEN'}
                            className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-all text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                            Force Start Voting
                        </button>
                        <button
                            onClick={handleForceReveal}
                            disabled={actionLoading || !competition || competition.status === 'REVEALED'}
                            className="px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                            Force Start Reveal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
