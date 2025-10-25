import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertProps {
  type?: "info" | "success" | "warning" | "error"
  title?: string
  message: string
  className?: string
}

export function Alert({ type = "info", title, message, className }: AlertProps) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  }

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
  }

  return (
    <div className={cn("border rounded-lg p-4 flex gap-3", styles[type], className)}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div>
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  )
}
