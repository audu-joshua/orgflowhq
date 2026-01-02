"use client"

import { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { departmentService } from "../services/departmentService"
import { toast } from "sonner"
import { CustomSelect } from "@/components/ui/CustomSelect"
import type { Department } from "../types"

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  departmentId?: string
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
    department_id: departmentId || "",
    hire_date: new Date().toISOString().split('T')[0],
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isGeneratingId, setIsGeneratingId] = useState(false)
  const [error, setError] = useState("")

  // Fetch departments if not provided
  useEffect(() => {
    if (isOpen && organization && !departmentId) {
      const fetchDepts = async () => {
        try {
          const depts = await departmentService.getDepartmentsByOrganization(organization.id)
          setDepartments(depts)
          if (depts.length > 0) {
            setFormData(prev => ({ ...prev, department_id: depts[0].id }))
          }
        } catch (err) {
          console.error("Failed to fetch departments", err)
        }
      }
      fetchDepts()
    }
  }, [isOpen, organization, departmentId])

  // Sync prop departmentId
  useEffect(() => {
    if (departmentId) {
      setFormData(prev => ({ ...prev, department_id: departmentId }))
    }
  }, [departmentId])

  // Autofill Employee ID on open
  useEffect(() => {
    if (isOpen && organization) {
      const fetchNextId = async () => {
        setIsGeneratingId(true)
        try {
          const nextId = await departmentService.generateNextEmployeeId(organization.id, organization.name)
          setFormData(prev => ({ ...prev, employee_id: nextId }))
        } catch (err) {
          console.error("Failed to generate ID:", err)
        } finally {
          setIsGeneratingId(false)
        }
      }
      fetchNextId()
    }
  }, [isOpen, organization])

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
      if (!formData.department_id) throw new Error("Please select a department")

      await departmentService.createEmployee(organization.id, {
        user_id: null,
        department_id: formData.department_id,
        full_name: formData.full_name || "",
        email: formData.email || "",
        employee_id: formData.employee_id || null,
        position: formData.position || null,
        phone: formData.phone || null,
        hire_date: formData.hire_date || null,
        profile_image_url: imagePreview || null,
        status: "active",
      })

      toast.success("Employee added successfully")
      onSuccess()
      onClose()
      setFormData({
        full_name: "",
        email: "",
        employee_id: "",
        position: "",
        phone: "",
        department_id: departmentId || "",
        hire_date: new Date().toISOString().split('T')[0],
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add New Employee</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Personnel Registry</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-5">

            {/* ID Banner - Show off the auto-generation */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-tight">Assigned Personnel ID</p>
                <p className="text-lg font-mono font-bold text-foreground">
                  {isGeneratingId ? "Generating..." : (formData.employee_id || "PENDING")}
                </p>
              </div>
              <Sparkles size={20} className="text-primary opacity-50 animate-pulse" />
            </div>

            <div className="space-y-4">
              {/* Department Selection (If not pre-filled) */}
              {!departmentId && (
                <div>
                  <label htmlFor="department" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    Department <span className="text-destructive">*</span>
                  </label>
                  <CustomSelect
                    id="department"
                    value={formData.department_id}
                    onChange={(value) => setFormData({ ...formData, department_id: value })}
                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                    placeholder="Select Department"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="full_name" className="bloct text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="position" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    Job Position
                  </label>
                  <input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Designer"
                  />
                </div>
                <div>
                  <label htmlFor="hire_date" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    Hire Date
                  </label>
                  <input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile_image" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4 p-3 bg-muted/20 border border-dashed border-border rounded-xl">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-background" />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {(formData.full_name || "E")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-[10px] text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border bg-muted/10">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-[11px] font-bold mb-4 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-foreground font-bold text-sm hover:bg-muted transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              form="add-employee-form"
              type="submit"
              disabled={loading || isGeneratingId}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Add Personnel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
