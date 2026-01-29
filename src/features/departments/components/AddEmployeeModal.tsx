"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Loader2, Plus } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { getDepartmentsByOrganizationAction, generateNextEmployeeIdAction, createEmployeeAction } from "../actions"
import { toast } from "@/lib/toast"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { CreateDepartmentModal } from "./CreateDepartmentModal"
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
    fullName: "",
    email: "",
    employeeId: "",
    position: "",
    phone: "",
    departmentId: departmentId || "",
    hireDate: new Date().toISOString().split('T')[0],
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isGeneratingId, setIsGeneratingId] = useState(false)
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)

  const fetchDepts = async () => {
    if (!organization) return
    try {
      const depts = await getDepartmentsByOrganizationAction(organization._id)
      setDepartments(depts as any)
      if (depts.length > 0 && !formData.departmentId) {
        setFormData(prev => ({ ...prev, departmentId: depts[0]._id }))
      }
    } catch (err) {
      console.error("Failed to fetch departments", err)
    }
  }

  // Fetch departments if not provided
  useEffect(() => {
    if (isOpen && organization && !departmentId) {
      fetchDepts()
    }
  }, [isOpen, organization, departmentId])

  // Sync prop departmentId
  useEffect(() => {
    if (departmentId) {
      setFormData(prev => ({ ...prev, departmentId: departmentId }))
    }
  }, [departmentId])

  // Autofill Employee ID on open or department change
  useEffect(() => {
    if (isOpen && organization) {
      const fetchNextId = async () => {
        setIsGeneratingId(true)
        try {
          const selectedDept = departments.find(d => d._id === formData.departmentId)
          const nextId = await generateNextEmployeeIdAction(organization._id, organization.name, selectedDept?.name)
          setFormData(prev => ({ ...prev, employeeId: nextId }))
        } catch (err) {
          console.error("Failed to generate ID:", err)
        } finally {
          setIsGeneratingId(false)
        }
      }
      fetchNextId()
    }
  }, [isOpen, organization, formData.departmentId, departments])

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
    setLoading(true)

    try {
      if (!organization) throw new Error("Organization not found")
      if (!formData.departmentId) throw new Error("Please select a department")

      const { uploadFileAction } = await import("@/features/applications/uploadActions")
      let uploadedImageUrl = null

      if (profileImage) {
        const imageFormData = new FormData()
        imageFormData.append("file", profileImage)
        imageFormData.append("folder", "employee_profiles")
        const uploadRes: any = await uploadFileAction(imageFormData)
        if (uploadRes.success) {
          uploadedImageUrl = uploadRes.url
        } else {
          toast.error("Failed to upload profile image")
        }
      }

      const result = await createEmployeeAction(organization._id, {
        userId: null,
        departmentId: formData.departmentId,
        fullName: formData.fullName || "",
        email: formData.email || "",
        employeeId: formData.employeeId || null, // Will be overridden by server-side gen if it was pending? No, we gen it in effect.
        position: formData.position || null,
        phone: formData.phone || null,
        hireDate: formData.hireDate || null,
        profileImageUrl: uploadedImageUrl,
        status: "invited",
        activatedAt: null,
      })

      if (!result.success) throw new Error(result.error)

      toast.success("Employee added successfully")
      onSuccess()
      onClose()
      setFormData({
        fullName: "",
        email: "",
        employeeId: "",
        position: "",
        phone: "",
        departmentId: departmentId || "",
        hireDate: new Date().toISOString().split('T')[0],
      })
      setProfileImage(null)
      setImagePreview("")
    } catch (err: any) {
      if (err.code === "23505" || err.message?.includes("unique_employee_email")) {
        toast.error("An employee with this email already exists in the system.")
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to add employee")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentCreated = async (newDept: Department) => {
    // Refresh departments list
    await fetchDepts()
    // Select the new department
    setFormData(prev => ({ ...prev, departmentId: newDept._id }))
    setIsAddingDepartment(false)
    toast.success(`${newDept.name} department created`)
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
                  {isGeneratingId ? "Generating..." : (formData.employeeId || "PENDING")}
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
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <CustomSelect
                        id="department"
                        value={formData.departmentId}
                        onChange={(value) => setFormData({ ...formData, departmentId: value })}
                        options={departments.map(d => ({ value: d._id, label: d.name }))}
                        placeholder="Select Department"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingDepartment(true)}
                      className="p-3 border border-border rounded-xl bg-background text-primary hover:bg-primary/5 transition-all outline-none"
                      title="Add New Department"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="bloct text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  <label htmlFor="hireDate" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    Hire Date
                  </label>
                  <input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
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
                        {(formData.fullName || "E")[0].toUpperCase()}
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
              className="flex-1 h-[52px] px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Add Personnel"}
            </button>
          </div>
        </div>
      </div>

      <CreateDepartmentModal
        isOpen={isAddingDepartment}
        onClose={() => setIsAddingDepartment(false)}
        onSuccess={handleDepartmentCreated}
      />
    </div>
  )
}
