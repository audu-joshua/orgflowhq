"use client"

import { toast as sonnerToast } from "sonner"
import { GlobalToast } from "@/components/shared/GlobalToast"

export const toast = {
    success: (message: string, options?: { title?: string; description?: string; duration?: number }) => {
        return sonnerToast.custom((t) => (
            <GlobalToast
                t={t}
                type="success"
                title={options?.title || "Success!"}
                message={options?.description || message}
            />
        ), {
            duration: options?.duration || 4000
        })
    },
    error: (message: string, options?: { title?: string; description?: string; duration?: number }) => {
        return sonnerToast.custom((t) => (
            <GlobalToast
                t={t}
                type="error"
                title={options?.title || "Error!"}
                message={options?.description || message}
            />
        ), {
            duration: options?.duration || 5000
        })
    },
    warning: (message: string, options?: { title?: string; description?: string; duration?: number }) => {
        return sonnerToast.custom((t) => (
            <GlobalToast
                t={t}
                type="warning"
                title={options?.title || "Warning!"}
                message={options?.description || message}
            />
        ), {
            duration: options?.duration || 5000
        })
    },
    info: (message: string, options?: { title?: string; description?: string; duration?: number }) => {
        return sonnerToast.custom((t) => (
            <GlobalToast
                t={t}
                type="info"
                title={options?.title || "Note!"}
                message={options?.description || message}
            />
        ), {
            duration: options?.duration || 4000
        })
    },
    // Keep compatibility with standard sonner calls if needed
    dismiss: (t?: string | number) => sonnerToast.dismiss(t),
}
