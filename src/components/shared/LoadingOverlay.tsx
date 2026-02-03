import { LoadingSpinner } from "./LoadingSpinner"

interface LoadingOverlayProps {
    message?: string
}

export function LoadingOverlay({ message = "Please wait..." }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card p-12 rounded-[2rem] border border-border shadow-2xl flex flex-col items-center space-y-6 max-w-sm w-full mx-4 transform transition-all duration-500 scale-100 animate-in zoom-in-95">
                <LoadingSpinner size="lg" />
                {message && (
                    <p className="text-foreground font-bold text-center text-lg tracking-tight px-4">{message}</p>
                )}
            </div>
        </div>
    )
}
