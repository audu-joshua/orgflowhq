"use client"

import { useState } from "react"
import { X, Mail, Phone, Calendar, Building, User, Trash2, Send, ExternalLink, Briefcase, MapPin, Shield, CheckCircle2, UserPlus, Fingerprint, Copy, Check, Info, Edit2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { deleteEmployeeAction, updateSystemRoleAction } from "../actions"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { EditEmployeeModal } from "./EditEmployeeModal"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAppStore } from "@/store/useAppStore"
import { RolePromotionModal } from "./RolePromotionModal"
import type { Employee } from "../types"
import { toast } from "@/lib/toast"

interface EmployeeModalProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
  onDeleted?: () => void
}

export function EmployeeModal({ employee, isOpen, onClose, onDeleted }: EmployeeModalProps) {
  const { user: currentUser } = useAppStore()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")

  const [systemRole, setSystemRole] = useState<string | null>(employee.system_role || null)
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [copiedDetails, setCopiedDetails] = useState(false)

  const canManageSecurity = ["owner", "admin"].includes(currentUser?.role || "")
  const isOwner = currentUser?.role === "owner"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEmployeeAction(employee._id)
      onDeleted?.()
      onClose()
    } catch (error) {
      console.error("Failed to delete employee:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${employee.email}?subject=${encodeURIComponent(emailSubject || `Internal Update for ${employee.fullName}`)}&body=${encodeURIComponent(emailBody || 'Hello ' + employee.fullName + ',')}`
    window.location.href = mailtoLink
  }

  const handleUpdateRole = async (newRole: string | null) => {
    setIsUpdatingRole(true)
    try {
      const result = await updateSystemRoleAction(employee._id, employee.organizationId || employee.organization_id || "", newRole)
      if (!result.success) throw new Error(result.error)
      setSystemRole(newRole)
      toast.success(newRole ? `Role updated to ${newRole.toUpperCase()}` : "System access removed")
    } catch (error: any) {
      toast.error(error.message || "Failed to update system role")
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const handleCopyLoginDetails = () => {
    const details = `Portal Login\nEmail: ${employee.email}\nPassword: ${employee.employee_id || 'Contact HR'}`
    navigator.clipboard.writeText(details)
    setCopiedDetails(true)
    setTimeout(() => setCopiedDetails(false), 2000)
    toast.success("Login details copied to clipboard")
  }

  if (!isOpen) return null

  const getInitial = () => {
    if (employee.fullName) return employee.fullName[0].toUpperCase()
    if (employee.email) return employee.email[0].toUpperCase()
    return "E"
  }

  const roleOptions = [
    { value: 'manager', label: 'Manager', description: 'Team & Operations management' },
    { value: 'hr', label: 'HR', description: 'Employee & Department management' },
    { value: 'finance', label: 'Finance Manager', description: 'Timesheets & Payroll access' },
    { value: 'employee', label: 'Employee', description: 'Standard clock-in access' },
  ]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header Section */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Employee Workspace</h2>
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Profile & Permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-bold text-sm mr-2"
            >
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </button>
            {employee.system_role !== 'owner' && employee.position?.toLowerCase() !== 'owner' && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                title="Delete Employee"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Wing: Profile & Quick Info */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col items-center p-6 bg-muted/20 border border-border rounded-2xl text-center">
                <div className="relative">
                  {employee.profileImageUrl ? (
                    <img
                      src={employee.profileImageUrl}
                      alt={employee.fullName || "Employee"}
                      className={`w-32 h-32 rounded-2xl object-cover border-4 border-background shadow-lg mb-4 ${employee.status === 'inactive' ? 'grayscale' : ''} ${employee.status === 'terminated' ? 'grayscale contrast-125' : ''}`}
                    />
                  ) : (
                    <div className={`w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center border-4 border-dashed border-primary/20 mb-4 ${employee.status === 'inactive' ? 'grayscale' : ''} ${employee.status === 'terminated' ? '!bg-destructive/10 !border-destructive/20' : ''}`}>
                      <span className={`text-primary font-bold text-4xl ${employee.status === 'terminated' ? '!text-destructive' : ''}`}>{getInitial()}</span>
                    </div>
                  )}
                  {employee.status === 'terminated' && (
                    <div className="absolute inset-0 w-32 h-32 rounded-2xl bg-destructive/20 mix-blend-multiply pointer-events-none" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-foreground leading-tight px-2">{employee.fullName || "No name"}</h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{employee.position || "Staff Member"}</p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current bg-background ${employee.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {employee.status}
                  </span>
                  {systemRole && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground">
                      {systemRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted/10 border border-border/50 rounded-xl space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border pb-2">Direct Contact</label>
                {employee.email && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Phone size={16} className="text-foreground" />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.location.href = `mailto:${employee.email}`}
                className="w-full h-[52px] flex items-center justify-center gap-2 px-5 py-3 bg-muted border border-border text-foreground hover:bg-muted/80 rounded-xl transition-all font-bold text-sm cursor-pointer"
              >
                <Mail size={16} /> Send Email
              </button>
            </div>

            {/* Center Wing: Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block border-l-4 border-primary pl-3">Employment Information</label>
                <div className="p-4 bg-card border border-border rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Fingerprint size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Employee ID</span>
                  </div>
                  <p className="font-mono font-bold text-foreground">{employee.employee_id || "NOT ASSIGNED"}</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Briefcase size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Current Role</span>
                  </div>
                  <p className="font-bold text-foreground">{employee.position || "Worker"}</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Join Date</span>
                  </div>
                  <p className="font-bold text-foreground">{employee.hireDate ? formatDate(employee.hireDate) : "N/A"}</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl space-y-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Shield size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">System Role</span>
                  </div>
                  <p className="font-bold text-foreground capitalize">{systemRole || "Employee"}</p>
                </div>
              </div>

              {canManageSecurity && (
                <div className="p-4 bg-muted/10 border border-border/50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Access Status</label>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter ${systemRole ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {systemRole ? 'Active Access' : 'No Dashboard Access'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${systemRole ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground capitalize">{systemRole || "Employee"}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Designated System Role</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPromotionModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-bold text-xs shadow-sm active:scale-95 cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Promote Staff</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Wing: Security & Controls */}
            <div className="lg:col-span-4 space-y-6">
              {canManageSecurity && (
                <div className="p-6 bg-card border border-border rounded-2xl space-y-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2 text-primary">
                    <div className="flex items-center gap-2">
                      <Shield size={20} />
                      <h3 className="font-bold text-foreground uppercase tracking-widest text-sm">Security Hub</h3>
                    </div>
                    <button
                      onClick={handleCopyLoginDetails}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
                      title="Copy Login Details"
                    >
                      {copiedDetails ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>Copy Details</span>
                    </button>
                  </div>

                  <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-foreground">Secure Authentication</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        Employee uses <span className="text-foreground font-semibold">{employee.email}</span> to access the Clock Portal and delegated Dashboards.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Alert */}
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden group">
                <h4 className="font-bold text-primary text-xs mb-2 uppercase tracking-tight">Audit Note</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Any change to system roles or passwords will be logged. The employee will receive a notification of these updates.
                </p>
                <Fingerprint className="absolute -bottom-4 -right-4 text-primary/10 group-hover:scale-110 transition-transform" size={100} />
              </div>
            </div>

          </div>
        </div>

        <EditEmployeeModal
          employee={employee}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={onDeleted!}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Employee"
          description={`Are you sure you want to remove ${employee.fullName}? This will permanently delete their records.`}
        />

        <RolePromotionModal
          isOpen={showPromotionModal}
          onClose={() => setShowPromotionModal(false)}
          onConfirm={handleUpdateRole}
          currentRole={systemRole}
          employeeName={employee.fullName || employee.email || "Employee"}
        />
      </div>
    </div>
  )
}
