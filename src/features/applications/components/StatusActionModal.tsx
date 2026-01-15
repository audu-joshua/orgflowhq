"use client"

import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface StatusActionModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    action: "hired" | "rejected"
    candidateName: string
    loading: boolean
}

export function StatusActionModal({
    isOpen,
    onClose,
    onConfirm,
    action,
    candidateName,
    loading
}: StatusActionModalProps) {
    const isHiring = action === "hired"

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isHiring ? "Confirm Hire" : "Confirm Rejection"}
        >
            <div className="space-y-6 pt-2 pb-2">
                <div className={`p-4 rounded-xl flex items-start gap-4 ${isHiring ? "bg-primary/5 border border-primary/10" : "bg-destructive/5 border border-destructive/10"}`}>
                    <div className={`p-2 rounded-full shrink-0 ${isHiring ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {isHiring ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">
                            {isHiring ? `Hire ${candidateName}?` : `Reject ${candidateName}?`}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isHiring
                                ? "This will mark the candidate as hired and send them a congratulatory invitation email."
                                : "This will mark the candidate as rejected and send them a polite update email regarding their status."}
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-400">
                        <strong>Automatic Communication:</strong> An automated email will be sent immediately after confirmation. This action cannot be easily undone.
                    </p>
                </div>

                <div className="flex gap-3 sticky bottom-0 bg-background pt-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 font-bold"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant={isHiring ? "default" : "destructive"}
                        className="flex-1 font-bold shadow-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            isHiring ? "Confirm & Hire" : "Confirm & Reject"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
