"use client"

import { Modal } from "./modal"
import { Button } from "./button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive" | "warning"
    loading?: boolean
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "destructive",
    loading = false
}: ConfirmationModalProps) {
    const getVariantColors = () => {
        switch (variant) {
            case "destructive":
                return "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-200"
            case "warning":
                return "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200"
            default:
                return "bg-primary/10 text-primary border-primary/20"
        }
    }

    const getButtonVariant = () => {
        switch (variant) {
            case "destructive":
                return "destructive"
            default:
                return "default"
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
        >
            <div className="p-6 space-y-6">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${getVariantColors()}`}>
                    <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 font-bold"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant={getButtonVariant() as any}
                        className="flex-1 font-bold shadow-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
