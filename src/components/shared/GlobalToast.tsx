"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, X, CloudOff, AlertTriangle, Info } from "lucide-react"
import { toast as sonnerToast } from "sonner"

interface GlobalToastProps {
    t: string | number
    type: "success" | "error" | "warning" | "info"
    title: string
    message: string
}

export function GlobalToast({ t, type, title, message }: GlobalToastProps) {
    const isSuccess = type === "success"

    // Vibrate/Shake animation variants
    const containerVariants = {
        initial: { y: -100, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20
            }
        },
        shake: {
            x: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.4, delay: 0.5 }
        },
        exit: {
            y: -20,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate={["animate", "shake"]}
            exit="exit"
            className="flex w-full max-w-[400px] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
        >
            {/* Left Column - Status Bar */}
            <div
                className={`w-[48px] flex items-center justify-center shrink-0 ${type === "success"
                    ? "bg-gradient-to-b from-[#10b981] to-[#059669]" // Success Teal
                    : type === "error"
                        ? "bg-gradient-to-b from-[#ef4444] to-[#dc2626]" // Error Red/Coral
                        : type === "warning"
                            ? "bg-gradient-to-b from-amber-400 to-amber-600" // Warning Amber
                            : "bg-gradient-to-b from-blue-400 to-blue-600" // Info Blue
                    }`}
            >
                <div className="text-white">
                    {type === "success" && <Check className="w-5 h-5 stroke-[3px]" />}
                    {type === "error" && <CloudOff className="w-5 h-5 stroke-[2px]" />}
                    {type === "warning" && <AlertTriangle className="w-5 h-5 stroke-[3px]" />}
                    {type === "info" && <Info className="w-5 h-5 stroke-[3px]" />}
                </div>
            </div>

            {/* Right Column - Content */}
            <div className="flex-1 p-3 pr-10 relative">
                <h3 className="font-bold text-base text-foreground mb-0.5">
                    {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-snug">
                    {message}
                </p>

                {/* Close Button */}
                <button
                    onClick={() => sonnerToast.dismiss(t)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    )
}
