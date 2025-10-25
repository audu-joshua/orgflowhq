"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { roleService } from "../services/roleService"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import type { Role, RoleImage } from "../types"

interface RoleDetailProps {
  roleId: string
}

export function RoleDetail({ roleId }: RoleDetailProps) {
  const router = useRouter()
  const [role, setRole] = useState<Role & { role_images?: RoleImage[] }>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

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
    if (!confirm("Are you sure you want to delete this role?")) return

    try {
      await roleService.deleteRole(roleId)
      router.push("/dashboard/roles")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role")
    }
  }

  const copyPublicLink = () => {
    const link = `${window.location.origin}/apply/${roleId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <LoadingSpinner />

  if (!role) return <div className="text-center py-8 text-gray-600">Role not found</div>

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{role.title}</h1>
            <p className="text-gray-600 mt-1">{role.department}</p>
          </div>
          <button
            onClick={handleDeleteRole}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
            Delete
          </button>
        </div>

        {role.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{role.description}</p>
          </div>
        )}

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Public Application Link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm text-gray-900 break-all">
              {`${window.location.origin}/apply/${roleId}`}
            </code>
            <button
              onClick={copyPublicLink}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
