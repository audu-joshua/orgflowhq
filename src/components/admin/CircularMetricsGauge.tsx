"use client"

interface CircularMetricsGaugeProps {
    amount: string | number
    label: string
    orders: number
    percentage?: number
    color?: "emerald" | "blue" | "purple"
}

export function CircularMetricsGauge({
    amount,
    label,
    orders,
    percentage = 85,
    color = "emerald"
}: CircularMetricsGaugeProps) {
    const colorClasses = {
        emerald: "text-emerald-500",
        blue: "text-blue-500",
        purple: "text-purple-500",
    }

    const circumference = 2 * Math.PI * 45
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={colorClasses[color]}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-2xl font-bold ${colorClasses[color]}`}>
                        {amount}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 text-center">
                        {orders} orders
                    </div>
                </div>
            </div>

            {/* Label */}
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 mt-1">{percentage}% Complete</p>
            </div>
        </div>
    )
}
