"use client"

import { Toaster } from "sonner"
import { useTheme } from "@/providers/ThemeProvider"

export function ToastProvider() {
    const { theme } = useTheme()

    return (
        <Toaster
            position="top-center"
            theme={theme === "dark" ? "dark" : "light"}
            toastOptions={{
                unstyled: true,
                className: "w-full flex justify-center",
            }}
        />
    )
}
