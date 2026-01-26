"use client"

import { useState, useEffect } from "react"
import { Loader2, X, Sparkles } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { getDepartmentsByOrganizationAction, updateEmployeeAction } from "../actions"
import { toast } from "@/lib/toast"
import { CustomSelect } from "@/components/ui/CustomSelect"
import type { Employee, Department } from "../types"

interface EditEmployeeModalProps {
    isOpen: boolean
    onClose: () => void
    employee: Employee
    onSuccess: () => void
}

export function EditEmployeeModal({ isOpen, onClose, employee, onSuccess }: EditEmployeeModalProps) {
    const { organization } = useAppStore()
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        employeeId: "",
        position: "",
        phone: "",
        departmentId: "",
        hireDate: "",
        status: "active",
    })
    const [departments, setDepartments] = useState<Department[]>([])
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")
    const [loading, setLoading] = useState(false)

    // Initialize data
    useEffect(() => {
        if (employee && isOpen) {
            setFormData({
                fullName: employee.fullName || "",
                email: employee.email || "",
                employeeId: employee.employeeId || employee.employee_id || "",
                position: employee.position || "",
                phone: employee.phone || "",
                departmentId: employee.departmentId || employee.department_id || "",
                hireDate: employee.hireDate || "",
                status: employee.status || "active",
            })
            setImagePreview(employee.profileImageUrl || "")
        }
    }, [employee, isOpen])

    // Fetch departments
    useEffect(() => {
        if (isOpen && organization) {
            const fetchDepts = async () => {
                try {
                    const depts = await getDepartmentsByOrganizationAction(organization._id)
                    setDepartments(depts as any)
                } catch (err) {
                    console.error("Failed to fetch departments", err)
                }
            }
            fetchDepts()
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
        setLoading(true)

        try {
            if (!organization) throw new Error("Organization not found")

            const { uploadFileAction } = await import("@/features/applications/uploadActions")
            let finalImageUrl = imagePreview

            if (profileImage) {
                const imgData = new FormData()
                imgData.append("file", profileImage)
                imgData.append("folder", "employee_profiles")
                const uploadRes: any = await uploadFileAction(imgData)
                if (uploadRes.success) {
                    finalImageUrl = uploadRes.url
                } else {
                    toast.error("Failed to upload new profile image")
                }
            }

            const result = await updateEmployeeAction(employee._id, {
                departmentId: formData.departmentId,
                fullName: formData.fullName,
                email: formData.email,
                position: formData.position || null,
                phone: formData.phone || null,
                hireDate: formData.hireDate || null,
                status: formData.status as any,
                profileImageUrl: finalImageUrl || null,
            })

            if (!result.success) throw new Error(result.error)

            toast.success("Employee updated successfully")
            onSuccess()
            onClose()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update employee")
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
                        <h2 className="text-xl font-bold text-foreground">Edit Employee</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Update Personnel File</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-5">

                        <div className="p-3 bg-muted/30 rounded-xl border border-border">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Employee ID</p>
                            <p className="font-mono font-bold text-foreground">{formData.employeeId}</p>
                        </div>

                        <div className="space-y-4">

                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                                    Account Status
                                </label>
                                <div
                                    onClick={() => {
                                        if (formData.status === 'invited') {
                                            setFormData({ ...formData, status: 'inactive' });
                                        } else {
                                            setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' });
                                        }
                                    }}
                                    className={`
                                        relative w-full h-12 rounded-xl border p-1 cursor-pointer transition-all duration-300 flex items-center
                                        ${formData.status === 'active' ? 'bg-green-500/10 border-green-500/20' :
                                            formData.status === 'invited' ? 'bg-amber-500/10 border-amber-500/20' :
                                                'bg-destructive/10 border-destructive/20'}
                                    `}
                                >
                                    {formData.status === 'invited' ? (
                                        <div className="flex-1 text-center text-[10px] font-bold text-amber-600 z-10">
                                            Invited (Pending Login)
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`
                                                flex-1 text-center text-xs font-bold transition-all duration-300 z-10
                                                ${formData.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}
                                            `}>
                                                Active
                                            </div>
                                            <div className={`
                                                flex-1 text-center text-xs font-bold transition-all duration-300 z-10
                                                ${formData.status === 'inactive' ? 'text-destructive' : 'text-muted-foreground'}
                                            `}>
                                                Inactive
                                            </div>
                                        </>
                                    )}
                                    <div
                                        className={`
                                            absolute top-1 bottom-1 w-[48%] bg-white rounded-lg shadow-sm border border-border transition-all duration-300 ease-in-out
                                            ${formData.status === 'active' ? 'left-1' :
                                                formData.status === 'invited' ? 'left-1 opacity-0' :
                                                    'left-[51%]'}
                                        `}
                                    />
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-2 px-1">
                                    {formData.status === 'invited'
                                        ? "Waiting for employee's first login. Click to Deactivate."
                                        : formData.status === 'active'
                                            ? "Employee can access the system normally."
                                            : "Employee session will be blocked immediately."}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="department" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                                    Department
                                </label>
                                <CustomSelect
                                    id="department"
                                    value={formData.departmentId}
                                    onChange={(value) => setFormData({ ...formData, departmentId: value })}
                                    options={departments.map(d => ({ value: d._id || d.id, label: d.name }))}
                                    placeholder="Select Department"
                                    required
                                />
                            </div>

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
                            form="edit-employee-form"
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-[52px] bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
