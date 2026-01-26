"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { createDepartmentAction } from "../actions"
import { Modal } from "@/components/ui/modal"
import type { Department } from "../types"

interface CreateDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (department: Department) => void
}

export function CreateDepartmentModal({ isOpen, onClose, onSuccess }: CreateDepartmentModalProps) {
  const { organization } = useAppStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError("")
    setLoading(true)

    try {
      if (!organization) throw new Error("Organization not found")
      const result = await createDepartmentAction(organization._id, { name, description })
      if (!result.success) throw new Error(result.error)
      onSuccess?.(result.department as any)
      onClose()
      setName("")
      setDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create department")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Department"
      maxWidth="max-w-md"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-foreground/80 ml-1">
                Department Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border bg-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                placeholder="e.g. Engineering, Marketing"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-foreground/80 ml-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-border bg-input text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none font-medium"
                placeholder="Brief description of the department's role..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-xl text-sm font-bold animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-foreground font-bold hover:bg-muted transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 flex items-center justify-center min-h-[44px]"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Create Department"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

