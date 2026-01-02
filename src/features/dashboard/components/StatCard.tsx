import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatCardProps {
  label: string
  value: number
  icon?: any
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "solid" | "subtle" | "outline" | "ghost"
  index?: number
}

export function StatCard({ label, value, icon: Icon, trend, variant = "subtle", index = 0 }: StatCardProps) {

  // Dynamic delay for stagger animation
  const animationDelay = `${index * 100}ms`

  const getVariantStyles = () => {
    switch (variant) {
      case "solid":
        return {
          card: "bg-primary text-primary-foreground border-primary",
          icon: "bg-primary-foreground/20 text-primary-foreground",
          text: "text-primary-foreground/80",
          value: "text-primary-foreground",
          trend: "bg-primary-foreground/20 text-primary-foreground"
        }
      case "outline":
        return {
          card: "bg-card border-2 border-primary/20 hover:border-primary/50",
          icon: "bg-primary/10 text-primary",
          text: "text-muted-foreground",
          value: "text-foreground",
          trend: trend?.positive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
        }
      case "ghost":
        return {
          card: "bg-transparent border-0 shadow-none",
          icon: "bg-primary/10 text-primary",
          text: "text-muted-foreground",
          value: "text-foreground",
          trend: trend?.positive ? 'text-primary' : 'text-destructive'
        }
      case "subtle":
      default:
        return {
          card: "bg-card border-border hover:border-primary/50 relative overflow-hidden",
          icon: "bg-primary/10 text-primary",
          text: "text-muted-foreground",
          value: "text-foreground",
          trend: trend?.positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div
      className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards ${styles.card}`}
      style={{ animationDelay }}
    >
      <div className="flex justify-between items-start z-10 relative">
        <div className="space-y-4">
          <div className={`p-3 rounded-lg w-fit transition-colors duration-300 ${styles.icon}`}>
            {Icon && <Icon size={24} />}
          </div>
          <div>
            <p className={`text-sm font-medium ${styles.text}`}>{label}</p>
            <h3 className={`text-2xl font-bold mt-1 tracking-tight ${styles.value}`}>{value}</h3>
          </div>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${styles.trend}`}>
            {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Decorative Gradient Blob (Only for subtle variant to keep it clean but branded) */}
      {variant === 'subtle' && (
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-2xl group-hover:scale-110 transition-transform duration-500" />
      )}
    </div>
  )
}
