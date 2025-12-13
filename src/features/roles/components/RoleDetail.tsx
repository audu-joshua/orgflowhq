"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { roleService } from "../services/roleService"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadRole = async () => {
      try {
        const data = await roleService.getRoleById(roleId)
        setRole(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load role")
      } finally {
        setLoading(false)
      }
    }

    loadRole()
  }, [roleId])

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      await roleService.deleteRoleImage(imageId, imageUrl)
      setRole((prev) =>
        prev
          ? {
            ...prev,
            role_images: prev.role_images?.filter((img) => img.id !== imageId),
          }
          : null,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image")
    }
  }

  const handleDeleteRole = async () => {
    setIsDeleting(true)
    try {
      await roleService.deleteRole(roleId)
      router.push("/dashboard/roles")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role")
      setIsDeleting(false)
    }
  }

  const copyPublicLink = () => {
    if (!role) return
    const link = `${window.location.origin}/apply/${role.slug || role.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <LoadingSpinner />

  if (!role) return <div className="text-center py-8 text-muted-foreground">Role not found</div>

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary hover:text-primary/90 font-medium"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{role.title}</h1>
            <p className="text-muted-foreground mt-1">{role.department}</p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                <Trash2 size={20} />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the role
                  and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {role.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{role.description}</p>
          </div>
        )}

        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Public Application Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background px-3 py-2 rounded border border-input text-sm text-foreground break-all">
              {`${window.location.origin}/apply/${role.slug || role.id}`}
            </code>
            <button
              onClick={copyPublicLink}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${copied
                ? "bg-secondary text-secondary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
