"use client"

import { Toaster } from "sonner"
import { useTheme } from "@/providers/ThemeProvider"

export function ToastProvider() {
    const { theme } = useTheme()

    return (
        <Toaster
            position="top-center"
            richColors
            closeButton
            theme={theme === "dark" ? "dark" : "light"}
        />
    )
}
