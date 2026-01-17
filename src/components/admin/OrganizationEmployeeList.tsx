"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Users, Briefcase, ChevronRight, User } from "lucide-react"

interface Employee {
    id: string
    full_name: string
    position: string
    profile_image_url: string | null
}

export function OrganizationEmployeeList({
    employees,
    totalCount
}: {
    employees: Employee[]
    totalCount: number
}) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-all text-left"
            >
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCount}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Briefcase className="h-6 w-6" />
                </div>
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Organization Employees"
                maxWidth="max-w-xl"
            >
                <div className="p-4">
                    <div className="space-y-3">
                        {employees.length > 0 ? (
                            employees.map((emp) => (
                                <div
                                    key={emp.id}
                                    className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-slate-200 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-emerald-200 transition-colors">
                                        {emp.profile_image_url ? (
                                            <img src={emp.profile_image_url} alt={emp.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{emp.full_name || "Unknown Name"}</p>
                                        <p className="text-xs text-slate-400 truncate group-hover:text-emerald-500 transition-colors font-medium">{emp.position || "Team Member"}</p>
                                    </div>
                                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-emerald-200 transition-colors">
                                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                <p>No employees found for this organization.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                            Close Directory
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
