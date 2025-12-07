"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { departmentService } from "../services/departmentService"

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  departmentId: string
  onSuccess: () => void
}

export function AddEmployeeModal({ isOpen, onClose, departmentId, onSuccess }: AddEmployeeModalProps) {
  const { organization } = useAppStore()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    employee_id: "",
    position: "",
    phone: "",
    hire_date: "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!organization) throw new Error("Organization not found")
      
      await departmentService.createEmployee(organization.id, {
        user_id: null,
        department_id: departmentId,
        full_name: formData.full_name || undefined,
        email: formData.email || undefined,
        employee_id: formData.employee_id || undefined,
        position: formData.position || undefined,
        phone: formData.phone || undefined,
        hire_date: formData.hire_date || undefined,
        profile_image_url: imagePreview || undefined,
        status: "active",
      })
      
      onSuccess()
      onClose()
      setFormData({
        full_name: "",
        email: "",
        employee_id: "",
        position: "",
        phone: "",
        hire_date: "",
      })
      setProfileImage(null)
      setImagePreview("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add employee")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Add Employee</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-foreground mb-2">
              Employee ID
            </label>
            <input
              id="employee_id"
              type="text"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="EMP-001"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-foreground mb-2">
              Position
            </label>
            <input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="e.g. Senior Developer, Manager"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label htmlFor="hire_date" className="block text-sm font-medium text-foreground mb-2">
              Hire Date
            </label>
            <input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            />
          </div>

          <div>
            <label htmlFor="profile_image" className="block text-sm font-medium text-foreground mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {(formData.full_name || "E")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

        </form>
        </div>
        
        <div className="p-6 border-t border-border">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

