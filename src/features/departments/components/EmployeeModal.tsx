"use client"

import { useState } from "react"
import { X, Mail, Phone, Calendar, Building, User, Trash2, Send, ExternalLink, Briefcase, MapPin, Shield, Key, CheckCircle2, UserPlus, Fingerprint, Copy, Check, Info, Edit2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { departmentService } from "../services/departmentService"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { EditEmployeeModal } from "./EditEmployeeModal"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAppStore } from "@/store/useAppStore"
import type { Employee } from "../types"
import { toast } from "sonner"

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

  const [isResetting, setIsResetting] = useState(false)
  const [newCustomPassword, setNewCustomPassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [systemRole, setSystemRole] = useState<string | null>(employee.system_role || null)
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const [showRoleConfirm, setShowRoleConfirm] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedDetails, setCopiedDetails] = useState(false)

  const canManageSecurity = ["owner", "admin"].includes(currentUser?.role || "")
  const isOwner = currentUser?.role === "owner"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await departmentService.deleteEmployee(employee.id)
      onDeleted?.()
      onClose()
    } catch (error) {
      console.error("Failed to delete employee:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${employee.email}?subject=${encodeURIComponent(emailSubject || `Internal Update for ${employee.full_name}`)}&body=${encodeURIComponent(emailBody || 'Hello ' + employee.full_name + ',')}`
    window.location.href = mailtoLink
  }

  const handleResetToDefault = async () => {
    if (!employee.employee_id) {
      toast.error("Employee ID is required for default password reset")
      return
    }

    setIsResetting(true)
    try {
      await departmentService.resetEmployeePassword(employee.id, employee.employee_id)
      toast.success(`Password reset to default (${employee.employee_id})`)
    } catch (error) {
      toast.error("Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  const handleSetCustomPassword = async () => {
    if (!newCustomPassword) return

    setIsResetting(true)
    try {
      await departmentService.updateEmployeePassword(employee.id, newCustomPassword)
      toast.success("Custom password set successfully")
      setNewCustomPassword("")
      setShowPasswordForm(false)
    } catch (error) {
      toast.error("Failed to set custom password")
    } finally {
      setIsResetting(false)
    }
  }

  const handleUpdateRole = async (newRole: string | null) => {
    setIsUpdatingRole(true)
    try {
      await departmentService.updateSystemRole(employee.id, employee.organization_id, newRole)
      setSystemRole(newRole)
      toast.success(newRole ? `Role updated to ${newRole.toUpperCase()}` : "System access removed")
    } catch (error: any) {
      toast.error(error.message || "Failed to update system role")
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const handleCopyId = () => {
    if (!employee.employee_id) return
    navigator.clipboard.writeText(employee.employee_id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
    toast.success("Employee ID copied")
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
    if (employee.full_name) return employee.full_name[0].toUpperCase()
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

            {/* Left Wing: Profile & Quick Info (Column 1-3) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex flex-col items-center p-6 bg-muted/20 border border-border rounded-2xl text-center">
                <div className="relative">
                  {employee.profile_image_url ? (
                    <img
                      src={employee.profile_image_url}
                      alt={employee.full_name || "Employee"}
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
                <h3 className="text-2xl font-bold text-foreground leading-tight px-2">{employee.full_name || "No name"}</h3>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{employee.position || "Staff Member"}</p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current bg-background ${employee.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
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
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{employee.phone}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-muted border border-border text-foreground hover:bg-muted/80 rounded-xl transition-all font-bold text-sm"
              >
                <Send size={16} /> Send Email
              </button>

              {showEmailForm && (
                <div className="border border-border rounded-xl p-4 space-y-4 bg-background animate-in slide-in-from-top-4 duration-300">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={handleSendEmail} className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs">Open Client</button>
                </div>
              )}
            </div>

            {/* Center Wing: Details (Column 4-8) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block border-l-4 border-primary pl-3">Employment Information</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-card border border-border rounded-xl space-y-1 relative group/copy">
                    <div className="flex items-center justify-between text-primary mb-1">
                      <div className="flex items-center gap-2">
                        <Fingerprint size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Employee ID</span>
                      </div>
                      <button
                        onClick={handleCopyId}
                        className="p-1 hover:bg-primary/10 rounded transition-colors"
                        title="Copy ID"
                      >
                        {copiedId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <p className="font-mono text-sm font-bold text-foreground">{employee.employee_id || "NOT-ASSIGNED"}</p>
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
                    <p className="font-bold text-foreground">{employee.hire_date ? formatDate(employee.hire_date) : "N/A"}</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <Briefcase size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">System Role</span>
                    </div>
                    <p className="font-bold text-foreground capitalize">{systemRole || "Employee"}</p>
                  </div>
                </div>
              </div>

              {/* System Roles Promotion - User's Request */}
              {canManageSecurity && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-l-4 border-primary pl-3">System Access Promotion</label>
                  <div className="space-y-3">
                    <p className="text-sm text-foreground font-medium">Select System Role</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <CustomSelect
                          value={systemRole || ""}
                          onChange={(val) => {
                            setPendingRole(val as string)
                            setShowRoleConfirm(true)
                          }}
                          options={roleOptions}
                          placeholder="Select Role..."
                          disabled={isUpdatingRole}
                        />
                      </div>
                      {systemRole && employee.system_role !== 'owner' && employee.position?.toLowerCase() !== 'owner' && (
                        <button
                          onClick={() => {
                            setPendingRole(null)
                            setShowRoleConfirm(true)
                          }}
                          disabled={isUpdatingRole}
                          className="px-3 py-2 text-xs font-bold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Wing: Security & Controls (Column 9-12) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Security Controls */}
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Credentials</label>
                      <button
                        onClick={handleResetToDefault}
                        disabled={isResetting}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted border border-border text-foreground rounded-xl hover:bg-muted/80 transition-all font-semibold text-xs disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2"><Key size={14} /> Reset Default</span>
                        <span className="font-mono opacity-50">{employee.employee_id}</span>
                      </button>
                    </div>

                    {!showPasswordForm ? (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="w-full py-3 text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all font-bold text-xs"
                      >
                        Override Password
                      </button>
                    ) : (
                      <div className="p-4 bg-muted/30 rounded-xl space-y-3 animate-in fade-in zoom-in-95">
                        <input
                          type="password"
                          value={newCustomPassword}
                          onChange={(e) => setNewCustomPassword(e.target.value)}
                          placeholder="New secure password"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSetCustomPassword}
                            disabled={isResetting || !newCustomPassword}
                            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:bg-primary/90"
                          >
                            Set Password
                          </button>
                          <button onClick={() => setShowPasswordForm(false)} className="px-3 py-2 bg-muted rounded-lg font-bold text-xs">Esc</button>
                        </div>
                      </div>
                    )}
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
          description={`Are you sure you want to remove ${employee.full_name}? This will permanently delete their records.`}
        />

        <AlertDialog open={showRoleConfirm} onOpenChange={setShowRoleConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingRole
                  ? `Are you sure you want to promote ${employee.full_name} to ${pendingRole.toUpperCase()}? This will grant them system access.`
                  : `Are you sure you want to revoke system access for ${employee.full_name}? They will only be able to use the Clock Portal.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingRole(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleUpdateRole(pendingRole)
                  setShowRoleConfirm(false)
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirm Update
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
