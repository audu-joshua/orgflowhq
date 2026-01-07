"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Edit3, Share2, MapPin, Briefcase, Users as UsersIcon, Link2, CheckCircle2 } from "lucide-react"
import { roleService } from "../services/roleService"
import { applicationService } from "@/features/applications/services/applicationService"
import { ApplicationCard } from "@/features/applications/components/ApplicationCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { Application } from "@/features/applications/types"
import { Modal } from "@/components/ui/modal"
import { RoleForm } from "./RoleForm"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Role, RoleImage } from "../types"

interface RoleDetailProps {
  roleId: string
}

export function RoleDetail({ roleId }: RoleDetailProps) {
  const router = useRouter()
  const [role, setRole] = useState<(Role & { role_images?: RoleImage[] }) | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [roleData, applicantsData] = await Promise.all([
        roleService.getRoleById(roleId),
        applicationService.getApplicationsByRole(roleId)
      ])
      setRole(roleData)
      setApplications(applicantsData)
    } catch (err) {
      console.error("Error loading role details:", err)
      setError(err instanceof Error ? err.message : "Failed to load role details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!roleId || roleId === "undefined") {
      setError("Role ID is missing or invalid")
      setLoading(false)
      return
    }

    loadData()
  }, [roleId])

  const handleDeleteRole = async () => {
    setIsDeleting(true)
    try {
      await roleService.deleteRole(roleId)
      toast.success("Role deleted successfully")
      router.push("/dashboard/roles")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete role")
      setIsDeleting(false)
    }
  }

  const copyPublicLink = () => {
    if (!role) return
    const link = `${window.location.origin}/apply/${role.slug || role.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!role) return
    const link = `${window.location.origin}/apply/${role.slug || role.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Apply for ${role.title}`,
          text: `Check out this job opening for ${role.title} at our organization.`,
          url: link,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyPublicLink()
        }
      }
    } else {
      copyPublicLink()
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner />
      <p className="text-muted-foreground animate-pulse">Loading role details...</p>
    </div>
  )

  if (error) return <div className="text-center py-12 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive font-medium mx-auto max-w-2xl">{error}</div>

  if (!role) return <div className="text-center py-12 text-muted-foreground">Role not found</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stylistic Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2.5 px-4 py-2 bg-background/50 backdrop-blur-md border border-border rounded-xl hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 group-hover:text-white transition-transform" />
          <span className="font-semibold text-foreground/80 group-hover:text-white transition-colors">Back to Roles</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/roles/${roleId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-bold shadow-sm cursor-pointer"
          >
            <Edit3 size={18} />
            Edit Role
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-destructive/5 text-destructive border border-destructive/10 rounded-xl hover:bg-destructive/10 transition-all font-bold shadow-sm cursor-pointer"
                disabled={isDeleting}
              >
                <Trash2 size={18} />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-border bg-card/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold">Delete this role?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action cannot be undone. All associated data and applications will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="rounded-xl border-border cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive hover:bg-destructive/90 rounded-xl cursor-pointer">
                  Yes, Delete Role
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border p-8 shadow-xl shadow-primary/5 relative overflow-hidden group">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                  {role.status}
                </span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <span>{role.employment_type?.replace('-', ' ')}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="font-medium normal-case">Posted {new Date(role.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight leading-tight">
                {role.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-primary" />
                  <span className="font-medium">{role.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <span className="font-medium">{role.location || "Remote"}</span>
                </div>
              </div>

              {role.description && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    Role Overview
                    <div className="h-px flex-1 bg-border/50" />
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                    {role.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                Latest Applicants
                <span className="flex items-center justify-center min-w-[28px] h-7 px-2 px-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-black shadow-lg shadow-primary/20">
                  {applications.length}
                </span>
              </h2>
            </div>

            {applications.length === 0 ? (
              <div className="bg-card/30 border-2 border-dashed border-border rounded-3xl p-16 text-center shadow-inner">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No applicants yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">Share your job role to start receiving applications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {applications.map((application: Application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Public Link Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-lg shadow-primary/5">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Link2 size={20} className="text-primary" />
              Recruitment Link
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed font-medium">
              Share this link with potential candidates to apply.
            </p>

            <div className="space-y-3">
              <div className="bg-background/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-primary/20 text-xs text-primary font-mono break-all leading-tight">
                {`${window.location.origin}/apply/${role.slug || role.id}`}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={copyPublicLink}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${copied
                    ? "bg-green-500 text-white"
                    : "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20"
                    }`}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Link2 size={16} />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black border border-border rounded-2xl text-sm font-bold hover:bg-accent transition-all shadow-sm cursor-pointer"
                >
                  <Share2 size={16} />
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
    </div>
  )
}
