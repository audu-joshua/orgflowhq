"use client"

import { Badge } from "@/components/ui/badge"

interface Order {
    id: string
    orderNumber: string
    customer: string
    type: string
    status: "paid" | "cancelled" | "refunded" | "pending"
    product: string
    total: string
    date: string
    avatar?: string
}

interface OrdersTableProps {
    orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
    const statusStyles = {
        paid: "bg-emerald-100 text-emerald-800",
        cancelled: "bg-red-100 text-red-800",
        refunded: "bg-orange-100 text-orange-800",
        pending: "bg-slate-100 text-slate-800",
    }

    const statusLabels = {
        paid: "Paid",
        cancelled: "Cancelled",
        refunded: "Refunded",
        pending: "Pending",
    }

    const getAvatarColor = (initials: string) => {
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-emerald-100 text-emerald-600",
            "bg-purple-100 text-purple-600",
            "bg-orange-100 text-orange-600",
            "bg-pink-100 text-pink-600",
        ]
        const index = initials.charCodeAt(0) % colors.length
        return colors[index]
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Order #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    {order.orderNumber}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">
                                    <div className="flex items-center gap-3">
                                        {order.avatar && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${getAvatarColor(order.avatar)}`}>
                                                {order.avatar}
                                            </div>
                                        )}
                                        <span>{order.customer}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">
                                    {order.type}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <Badge className={statusStyles[order.status]}>
                                        {statusLabels[order.status]}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">
                                    {order.product}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    {order.total}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">
                                    {order.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
