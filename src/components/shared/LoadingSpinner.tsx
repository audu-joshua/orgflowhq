export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full min-h-[60vh]">
      <div className="flex space-x-3">
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-primary/50 animate-bounce [animation-delay:-0.3s] shadow-lg shadow-primary/30" />
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-primary/50 animate-bounce [animation-delay:-0.15s] shadow-lg shadow-primary/30" />
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-primary/50 animate-bounce shadow-lg shadow-primary/30" />
      </div>
    </div>
  )
}
