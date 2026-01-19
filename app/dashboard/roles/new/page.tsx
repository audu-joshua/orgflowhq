import { CreateRoleForm } from "@/features/roles/components/CreateRoleForm"
import Link from "next/link"
import { ArrowLeft, LayoutDashboard, Briefcase, PlusCircle } from "lucide-react"

export default function CreateRolePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/roles"
          className="group flex items-center gap-2.5 px-4 py-2 bg-background/50 backdrop-blur-md border border-border rounded-xl hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 group-hover:text-white transition-all" />
          <span className="font-semibold text-foreground/80 group-hover:text-white transition-colors">Back</span>
        </Link>

        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
          <span>/</span>
          <Briefcase size={14} />
          <span>Roles</span>
          <span>/</span>
          <PlusCircle size={14} />
          <span className="text-primary font-bold">New Role</span>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-border p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

        <div className="relative mb-8">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Create New Role</h1>
          <p className="text-muted-foreground font-medium">Define a new position and begin your talent search.</p>
        </div>

        <div className="relative">
          <CreateRoleForm />
        </div>
      </div>
    </div>
  )
}
