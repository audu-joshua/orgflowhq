"use client"

import { useParams, useRouter } from "next/navigation"
import { RoleForm } from "@/features/roles/components/RoleForm"
import { roleService } from "@/features/roles/services/roleService"
import { useState, useEffect } from "react"
import type { Role, RoleImage } from "@/features/roles/types"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ArrowLeft, LayoutDashboard, Briefcase, Settings } from "lucide-react"

export default function EditRolePage() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const [role, setRole] = useState<(Role & { role_images?: RoleImage[] }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadRole = async () => {
            if (!id) return
            try {
                setLoading(true)
                const data = await roleService.getRoleById(id)
                setRole(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load role")
            } finally {
                setLoading(false)
            }
        }

        loadRole()
    }, [id])

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>

    if (error || !role || !id) return (
        <div className="container mx-auto py-12 px-4 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">{error || "Role not found"}</p>
            <button onClick={() => router.back()} className="px-6 py-2 bg-primary text-white rounded-xl">Go Back</button>
        </div>
    )

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2.5 px-4 py-2 bg-background/50 backdrop-blur-md border border-border rounded-xl hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 group-hover:text-white transition-all" />
                    <span className="font-semibold text-foreground/80 group-hover:text-white transition-colors">Back</span>
                </button>

                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                    <span>/</span>
                    <Briefcase size={14} />
                    <span>Roles</span>
                    <span>/</span>
                    <Settings size={14} />
                    <span className="text-primary font-bold">Edit Role</span>
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative mb-10">
                    <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Refine Job Role</h1>
                    <p className="text-muted-foreground font-medium">Update the details, requirements, and media for <span className="text-primary font-bold">{role.title}</span>.</p>
                </div>

                <div className="relative">
                    <RoleForm
                        mode="edit"
                        initialData={role}
                        onSuccess={() => router.push(`/dashboard/roles/${id}`)}
                        onCancel={() => router.back()}
                    />
                </div>
            </div>
        </div>
    )
}
