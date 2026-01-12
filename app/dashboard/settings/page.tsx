"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { Loader2, Upload, Camera, Building2, Copy, Check, ExternalLink } from "lucide-react"
import type { Organization } from "@/features/organization/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordModal } from "@/features/auth/components/ChangePasswordModal"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { disconnectGoogleAction } from "@/features/integrations/actions"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

// Client component for the button (Inline for simplicity, or move to separate file)
function GoogleIntegrationControl() {
    const [isConnected, setIsConnected] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch status client-side or check user metadata if stored there
        //For simplicity, just check the API route or similar. 
        // Or better yet, we can't easily use server component logic here without refactoring the whole page to server.
        // So we will fetch via a client-side wrapper around a server action that merely checks status? 
        // Actually, let's just use a simple fetch to an API route for status, OR just rely on prop drilling if this was a server page (it's not).
        // Let's create a quick check func.
        checkStatus()
    }, [])

    const checkStatus = async () => {
        try {
            // We can reuse the same table check but from client side using the standard client
            const supabase = getSupabaseClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('user_integrations')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('provider', 'google')
                    .single()
                setIsConnected(!!data)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDisconnect = async () => {
        setLoading(true)
        try {
            await disconnectGoogleAction()
            toast.success("Disconnected Google Calendar")
            setIsConnected(false)
        } catch (e) {
            toast.error("Failed to disconnect")
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = () => {
        window.location.href = "/api/auth/google/connect"
    }

    if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />

    if (isConnected) {
        return (
            <Button variant="outline" onClick={handleDisconnect} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                Disconnect
            </Button>
        )
    }

    return (
        <Button variant="outline" onClick={handleConnect}>
            Connect
        </Button>
    )
}

export default function SettingsPage() {
    const { organization, setOrganization } = useAppStore()
    const { signOut } = useAuth()

    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [logo, setLogo] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [welcomeDoc, setWelcomeDoc] = useState<File | null>(null)
    const [welcomeDocUrl, setWelcomeDocUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

    // Deletion Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteStep, setDeleteStep] = useState<'initial' | 'verify'>('initial')
    const [deletePin, setDeletePin] = useState("")
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Initial data load
    useEffect(() => {
        if (organization) {
            setName(organization.name || "")
            setAddress(organization.address || "")
            setLogoPreview(organization.logo_url || null)
            setWelcomeDocUrl(organization.welcome_doc_url || null)
        }
    }, [organization])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Please upload PNG, JPEG, JPG, WebP, or SVG.")
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.warning("File size exceeds 5MB limit.")
                return
            }

            setLogo(file)

            const reader = new FileReader()
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!organization) {
            toast.error("No organization found")
            return
        }

        setLoading(true)

        try {
            const supabase = getSupabaseClient()

            // Get current user to verify permissions
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) {
                throw new Error("You must be logged in to update settings")
            }

            let logoUrl = organization.logo_url

            // Upload logo if changed
            if (logo) {
                const fileExt = logo.name.split('.').pop()
                const fileName = `${organization.id}/logo-${Date.now()}.${fileExt}`

                console.log("Uploading logo to:", fileName)

                const { error: uploadError } = await supabase.storage
                    .from("organization_logo")
                    .upload(fileName, logo, {
                        upsert: true,
                        cacheControl: '3600'
                    })

                if (uploadError) {
                    console.error("Logo upload error:", uploadError)
                    throw new Error(`Failed to upload logo: ${uploadError.message}`)
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("organization_logo")
                    .getPublicUrl(fileName)

                logoUrl = publicUrl
            }

            let finalWelcomeDocUrl = welcomeDocUrl

            // Upload Welcome Doc if changed
            if (welcomeDoc) {
                const fileExt = welcomeDoc.name.split('.').pop()
                const fileName = `${organization.id}/welcome-doc-${Date.now()}.${fileExt}`

                console.log("Uploading welcome doc to:", fileName)

                const { error: uploadError } = await supabase.storage
                    .from("organization_docs")
                    .upload(fileName, welcomeDoc, {
                        upsert: true,
                        cacheControl: '3600'
                    })

                if (uploadError) {
                    console.error("Welcome doc upload error:", uploadError)
                    throw new Error(`Failed to upload welcome document: ${uploadError.message}`)
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("organization_docs")
                    .getPublicUrl(fileName)

                finalWelcomeDocUrl = publicUrl
            }

            // Prepare update data
            const updateData: any = {
                name: name.trim(),
                address: address.trim(),
                welcome_doc_url: finalWelcomeDocUrl,
                updated_at: new Date().toISOString()
            }

            // Only include logo_url if it was updated
            if (logoUrl !== organization.logo_url) {
                updateData.logo_url = logoUrl
            }

            // Remove undefined/null values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined || updateData[key] === null) {
                    delete updateData[key]
                }
            })

            console.log("Updating organization with:", updateData)

            // Update organization via service to handle slug logic
            const { organizationService } = await import("@/features/organization/services/organizationService")
            const data = await organizationService.updateOrganization(organization.id, updateData)

            // Update local state
            setOrganization({
                ...organization,
                ...updateData,
                ...data
            } as Organization)

            toast.success("Organization settings updated successfully")
            setLogo(null)
            setWelcomeDoc(null)

        } catch (error: any) {
            console.error("Error updating settings:", error)
            const errorMessage = error.message || "Failed to update settings"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleInitiateDelete = async () => {
        setDeleteLoading(true)
        try {
            const { getSupabaseClient } = await import("@/lib/supabaseClient")
            const supabase = getSupabaseClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) throw new Error("Unauthorized")

            const res = await fetch("/api/organizations/close/initiate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ organizationId: organization?.id })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success("Verification PIN sent to your email")
            setDeleteStep('verify')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleConfirmDelete = async () => {
        setDeleteLoading(true)
        try {
            const { getSupabaseClient } = await import("@/lib/supabaseClient")
            const supabase = getSupabaseClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) throw new Error("Unauthorized")

            const res = await fetch("/api/organizations/close/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ organizationId: organization?.id, pin: deletePin })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success("Organization closed successfully")

            // Force sign out
            await signOut()
            window.location.href = "/login"

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setDeleteLoading(false)
        }
    }

    if (!organization) {
        return (
            <div className="container max-w-4xl py-10 px-4">
                <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading organization...</span>
                </div>
            </div>
        )
    }

    const hasChanges = (logo !== null) ||
        (name !== (organization.name || "")) ||
        (address !== (organization.address || "")) ||
        (welcomeDoc !== null)

    return (
        <div className="container max-w-4xl py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your organization's profile and branding settings.</p>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-8">
                    <CardTitle>Organization Profile</CardTitle>
                    <CardDescription>
                        Update your company's information. This will be visible on your team's sidebar and public application pages.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Logo Upload Section */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
                            <div className="space-y-3">
                                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Company Logo</span>
                                <div className="relative w-40 h-40 rounded-xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                                    {logoPreview ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-contain p-2"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-white/90" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                            <Building2 className="w-10 h-10 mb-2 opacity-50" />
                                            <span className="text-xs font-medium">No Logo</span>
                                        </div>
                                    )}

                                    <label
                                        htmlFor="logo-upload"
                                        className="absolute inset-0 cursor-pointer"
                                    >
                                        <span className="sr-only">Upload logo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Upload New Logo</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Recommended size 400x400px. Supports PNG, JPG, SVG. Max 5MB.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 max-w-xs">
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                                        onChange={handleLogoChange}
                                        className="cursor-pointer file:cursor-pointer file:text-primary file:font-medium"
                                    />
                                    {logo && (
                                        <div className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-md flex items-center gap-2">
                                            <Upload className="w-3 h-3" />
                                            Selected: {logo.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Name Input Section */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label htmlFor="name" className="text-sm font-medium leading-none">Company Name</label>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    This is the public name of your organization.
                                </p>
                            </div>
                            <div className="max-w-md">
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter company name"
                                    className="h-11"
                                    minLength={2}
                                    maxLength={50}
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label htmlFor="address" className="text-sm font-medium leading-none">Office Address</label>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Your organization address will be contained in the mail. You can always change this from the settings page.
                                </p>
                            </div>
                            <div className="max-w-md">
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="e.g., 123 Innovation Dr, Suite 100"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Clock Portal Link Section (Restored) */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none">Clock Portal Link</label>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Share this link with your employees so they can clock in and out.
                                </p>
                            </div>
                            <div className="max-w-md space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-2.5 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                                        {`${typeof window !== 'undefined' ? window.location.origin : ''}/org/${organization.slug}/clock`}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 h-10 w-10 cursor-pointer"
                                        onClick={() => {
                                            const url = `${window.location.origin}/org/${organization.slug}/clock`;
                                            navigator.clipboard.writeText(url);
                                            setIsCopied(true);
                                            toast.success("Login URL copied to clipboard!");
                                            setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                    >
                                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 h-10 w-10 text-primary hover:text-primary cursor-pointer"
                                        onClick={() => {
                                            const url = `${window.location.origin}/org/${organization.slug}/clock`;
                                            window.open(url, '_blank');
                                        }}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Company Welcome Document Section */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label htmlFor="welcome-doc" className="text-sm font-medium leading-none">Welcome Document</label>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Upload a handbook or welcome doc to be sent to hired candidates.
                                </p>
                            </div>
                            <div className="max-w-md space-y-4">
                                <Input
                                    id="welcome-doc"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) setWelcomeDoc(file)
                                    }}
                                    className="cursor-pointer file:cursor-pointer"
                                />
                                {(welcomeDoc || welcomeDocUrl) && (
                                    <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                                        <Copy className="w-3 h-3" />
                                        <span className="truncate">
                                            {welcomeDoc ? welcomeDoc.name : "Current Welcome Document Uploaded"}
                                        </span>
                                        {welcomeDocUrl && (
                                            <a
                                                href={welcomeDocUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-auto text-primary hover:underline font-bold"
                                            >
                                                View
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/40">
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={!hasChanges}
                                onClick={() => {
                                    setName(organization.name || "")
                                    setAddress(organization.address || "")
                                    setLogo(null)
                                    setLogoPreview(organization.logo_url || null)
                                    setWelcomeDoc(null)
                                    setWelcomeDocUrl(organization.welcome_doc_url || null)
                                }}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !hasChanges}
                                className="min-w-[120px] cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="mt-8 border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-8">
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                        Manage your account security and authentication credentials.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Password</h3>
                            <p className="text-xs text-muted-foreground">Change your account password to keep your account secure.</p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setIsChangePasswordOpen(true)}
                            className="font-bold border-2 cursor-pointer"
                        >
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Integrations Settings */}
            <Card className="mt-8 border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-8">
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>
                        Manage external services connected to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg border shadow-sm">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Google Calendar</h3>
                                <p className="text-xs text-muted-foreground">Sync interviews and auto-generate Meet links.</p>
                            </div>
                        </div>
                        <GoogleIntegrationControl />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="mt-8 border-red-300 shadow-sm bg-red-50/50">
                <CardHeader className="border-b border-red-200 bg-red-100/30 pb-8">
                    <CardTitle className="text-red-900">Danger Zone</CardTitle>
                    <CardDescription className="text-red-800">
                        Destructive actions that cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-red-950">Close Organization</h3>
                            <p className="text-xs text-red-800/90 max-w-lg font-medium">
                                PERMANENTLY delete this organization and all related data (employees, timesheets, settings).
                                This action is verified via email and cannot be reversed.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsDeleteModalOpen(true)
                                setDeleteStep('initial')
                                setDeletePin("")
                            }}
                            className="font-bold shadow-sm cursor-pointer bg-red-700 hover:bg-red-800 text-white border border-red-800"
                        >
                            Close Organization
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />

            {/* Deletion Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">

                        <div className="px-6 py-6 border-b border-border/50 bg-muted/20">
                            <h3 className="text-lg font-bold text-foreground">
                                {deleteStep === 'initial' ? 'Close Organization?' : 'Verify Deletion'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {deleteStep === 'initial'
                                    ? "This action is extremely destructive."
                                    : "Enter the PIN sent to your email."}
                            </p>
                        </div>

                        <div className="p-6">
                            {deleteStep === 'initial' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 text-sm leading-relaxed">
                                        <p className="font-bold mb-2">Warning: Irreversible Action</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>All <strong>Employees</strong> will be deleted.</li>
                                            <li>All <strong>Timesheets</strong> and records will be lost.</li>
                                            <li>Your organization data cannot be recovered.</li>
                                        </ul>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        To proceed, we will send a 6-digit confirmation PIN to your registered email address.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirmation PIN</label>
                                        <Input
                                            value={deletePin}
                                            onChange={(e) => setDeletePin(e.target.value)}
                                            placeholder="Enter 6-digit PIN"
                                            className="text-center text-2xl tracking-[0.5em] font-mono"
                                            maxLength={6}
                                        />
                                        <p className="text-xs text-muted-foreground text-center">
                                            Check your inbox for the code.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-muted/20 border-t border-border/50 flex justify-end gap-3">
                            <Button
                                variant="ghost"
                                disabled={deleteLoading}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>

                            {deleteStep === 'initial' ? (
                                <Button
                                    variant="destructive"
                                    onClick={handleInitiateDelete}
                                    disabled={deleteLoading}
                                    className="cursor-pointer"
                                >
                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Send Verification PIN
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmDelete}
                                    disabled={deleteLoading || deletePin.length < 6}
                                    className="cursor-pointer"
                                >
                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Confirm & Close Organization
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
