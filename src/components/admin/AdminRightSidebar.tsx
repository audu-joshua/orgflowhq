"use client"

import { CircularMetricsGauge } from "./CircularMetricsGauge"

interface RightSidebarProps {
    mainGaugeAmount?: string | number
    mainGaugeOrders?: number
}

export function AdminRightSidebar({ mainGaugeAmount = "$2.2m", mainGaugeOrders = 242 }: RightSidebarProps) {
    return (
        <div className="w-80 space-y-6">
            {/* Main Receipt of Goods Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-center text-sm font-semibold text-slate-900 mb-4">
                    RECEIPT OF GOODS
                </h3>
                <CircularMetricsGauge
                    amount={mainGaugeAmount}
                    label="Receipt of Goods"
                    orders={mainGaugeOrders}
                    percentage={85}
                    color="emerald"
                />
            </div>

            {/* Orders Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Orders Status
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm text-slate-700">Paid</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "89%" }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">89%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm text-slate-700">Cancelled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: "8%" }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">8%</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-sm text-slate-700">Refunded</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "3%" }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">3%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Overview
                </h3>
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Total Revenue</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">$45.2M</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Avg Order Value</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">$1,845</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Success Rate</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">97.2%</p>
                    </div>
                </div>
            </div>

            {/* Top Sellers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Top Sellers
                </h3>
                <div className="space-y-3">
                    {[
                        { name: "Sarah Johnson", sales: "$12.5M", growth: "+12%" },
                        { name: "Michael Chen", sales: "$9.8M", growth: "+8%" },
                        { name: "Emma Williams", sales: "$8.3M", growth: "+15%" },
                    ].map((seller, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {seller.name}
                                    </p>
                                    <p className="text-xs text-slate-500">{seller.sales}</p>
                                </div>
                            </div>
                            <div className="ml-2 text-right">
                                <p className="text-xs font-semibold text-emerald-600">
                                    {seller.growth}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
