"use client"

import { useState, useEffect } from "react"
import { X, Search, User, Trophy, Check, Send, Loader2 } from "lucide-react"
import { eotmService } from "../services/eotmService"
import { departmentService } from "../services/departmentService"
import { organizationService } from "@/features/organization/services/organizationService"
import { toast } from "@/lib/toast"

interface EOTMVoteOverlayProps {
    isOpen: boolean
    onClose: () => void
    competitionId: string
    voterId: string
    voterRole: string
    organizationId: string
}

export function EOTMVoteOverlay({
    isOpen,
    onClose,
    competitionId,
    voterId,
    voterRole,
    organizationId
}: EOTMVoteOverlayProps) {
    const [employees, setEmployees] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedNominee, setSelectedNominee] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        const fetchEmployees = async () => {
            try {
                const data = await departmentService.getEmployeesByOrganization(organizationId)

                // Filter: 1. Not self, 2. Not owner, 3. Is active
                const filtered = data.filter((emp: any) =>
                    emp.id !== voterId &&
                    emp.system_role !== 'owner' &&
                    emp.status === 'active'
                )

                setEmployees(filtered)
            } catch (error) {
                console.error("Failed to load employees for voting:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEmployees()
    }, [isOpen, organizationId, voterId])

    const handleVote = async () => {
        if (!selectedNominee) return
        setSubmitting(true)
        try {
            await eotmService.castVote(competitionId, voterId, selectedNominee, voterRole)
            toast.success("Your vote has been counted!")
            onClose()
        } catch (error: any) {
            toast.error(error.message || "Failed to cast vote")
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    const filteredEmployees = employees.filter(e =>
        e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.position?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col pt-12 pb-8">

                {/* Header */}
                <div className="text-center mb-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 p-3 hover:bg-muted rounded-full text-muted-foreground transition-all active:scale-95"
                    >
                        <X size={24} />
                    </button>

                    <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary mb-4">
                        <Trophy size={40} className="animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Vote for Excellence</h2>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Who stood out this month? Your vote shapes our culture.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search colleagues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-card border-2 border-border rounded-2xl focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-medium"
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : filteredEmployees.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredEmployees.map((emp) => {
                                const isSelected = selectedNominee === emp.id
                                return (
                                    <button
                                        key={emp.id}
                                        onClick={() => setSelectedNominee(emp.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${isSelected
                                            ? 'border-primary bg-primary/10 ring-4 ring-primary/5'
                                            : 'border-border bg-card'
                                            }`}
                                    >
                                        {emp.profile_image_url ? (
                                            <img src={emp.profile_image_url} alt={emp.full_name} className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold">
                                                {emp.full_name?.[0]}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground truncate">{emp.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{emp.position}</p>
                                        </div>
                                        {isSelected && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><Check size={12} strokeWidth={4} /></div>}
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground italic font-medium">No colleagues found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                    <button
                        onClick={handleVote}
                        disabled={!selectedNominee || submitting}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {submitting ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> Cast Weighted Vote</>}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-muted-foreground hover:text-foreground font-bold transition-colors text-sm"
                    >
                        Decide Later
                    </button>
                </div>
            </div>
        </div>
    )
}
