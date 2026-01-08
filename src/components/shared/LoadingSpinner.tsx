interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[40vh]">
      <div className="flex space-x-2 md:space-x-3">
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary to-primary/50 animate-bounce [animation-delay:-0.3s] shadow-lg shadow-primary/30`} />
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary to-primary/50 animate-bounce [animation-delay:-0.15s] shadow-lg shadow-primary/30`} />
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary to-primary/50 animate-bounce shadow-lg shadow-primary/30`} />
      </div>
    </div>
  )
}
