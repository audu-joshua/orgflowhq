"use client"

import { useState } from "react"
import { Shield, Users, Wallet, User, Check, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"

interface RoleOption {
    value: string | null
    label: string
    description: string
    icon: any
    color: string
}

const ROLE_OPTIONS: RoleOption[] = [
    {
        value: 'manager',
        label: 'Manager',
        description: 'Can manage teams, operations, and general dashboard settings.',
        icon: Shield,
        color: 'text-blue-500'
    },
    {
        value: 'hr',
        label: 'HR Specialist',
        description: 'Expert access to employee records, department management, and hiring.',
        icon: Users,
        color: 'text-purple-500'
    },
    {
        value: 'finance',
        label: 'Finance Manager',
        description: 'Full access to timesheets, payroll reports, and financial oversight.',
        icon: Wallet,
        color: 'text-amber-500'
    },
    {
        value: 'employee',
        label: 'Standard Employee',
        description: 'Basic access for clocking in/out and viewing personal dashboard.',
        icon: User,
        color: 'text-slate-500'
    },
]

interface RolePromotionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (role: string | null) => Promise<void>
    currentRole: string | null
    employeeName: string
}

export function RolePromotionModal({
    isOpen,
    onClose,
    onConfirm,
    currentRole,
    employeeName
}: RolePromotionModalProps) {
    const [selectedRole, setSelectedRole] = useState<string | null>(currentRole)
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm(selectedRole)
            onClose()
        } catch (error) {
            console.error("Promotion failed:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="System Access Promotion"
            maxWidth="max-w-2xl"
        >
            <div className="p-6">
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground font-medium">
                        Select a new system role for <span className="text-foreground font-bold">{employeeName}</span>.
                        This will immediately update their access permissions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ROLE_OPTIONS.map((role) => {
                        const isSelected = selectedRole === role.value
                        const Icon = role.icon

                        return (
                            <button
                                key={role.label}
                                onClick={() => setSelectedRole(role.value)}
                                className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left relative group ${isSelected
                                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                        : 'border-border bg-card hover:border-primary/50'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl bg-background mb-4 transition-transform group-hover:scale-110 ${role.color}`}>
                                    <Icon size={24} />
                                </div>

                                <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                                    {role.label}
                                    {isSelected && <Check size={16} className="text-primary" />}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {role.description}
                                </p>

                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-primary">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check size={12} className="text-primary-foreground stroke-[3px]" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-border rounded-xl text-foreground font-bold hover:bg-muted transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading || selectedRole === currentRole}
                        className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 flex items-center justify-center min-h-[48px]"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            "Confirm Promotion"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
