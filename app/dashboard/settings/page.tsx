"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Loader2, Upload, Camera, Building2, Copy, Check, ExternalLink } from "lucide-react"
import type { Organization } from "@/features/organization/types"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChangePasswordModal } from "@/features/auth/components/ChangePasswordModal"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { disconnectGoogleAction } from "@/features/integrations/actions"
import { useSession } from "next-auth/react"

// Component to handle Google Integration status and actions
function GoogleIntegrationControl() {
    const [isConnected, setIsConnected] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Fetch status via a simple API check or similar logic
                // Using an API for status check is cleaner for client components
                const res = await fetch("/api/integrations/status?provider=google")
                const data = await res.json()
                setIsConnected(data.isConnected)
            } catch (e) {
                console.error("Failed to check integration status")
            } finally {
                setLoading(false)
            }
        }
        checkStatus()
    }, [])

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
            <Button variant="outline" onClick={handleDisconnect} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer">
                Disconnect
            </Button>
        )
    }

    return (
        <Button variant="outline" onClick={handleConnect} className="cursor-pointer">
            Connect
        </Button>
    )
}

export default function SettingsPage() {
    const { organization, setOrganization } = useAppStore()
    const { signOut } = useAuth()
    const { data: session } = useSession()

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
            reader.onload = (e) => setLogoPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!organization) return

        setLoading(true)

        try {
            // Note: Cloudinary/Storage logic would go here, then API update
            // For now, we simulate the update using the organizationService which is Mongo-ready
            // But we call a server action or API for actual persistence to avoid direct Mongoose in client

            const updateData: any = {
                name: name.trim(),
                address: address.trim(),
            }

            const response = await fetch(`/api/organizations/${organization.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Update failed")

            setOrganization({ ...organization, ...data })
            toast.success("Settings updated successfully")
            setLogo(null)
            setWelcomeDoc(null)

        } catch (error: any) {
            console.error("Error updating settings:", error)
            toast.error(error.message || "Failed to update settings")
        } finally {
            setLoading(false)
        }
    }

    const handleInitiateDelete = async () => {
        setDeleteLoading(true)
        try {
            const res = await fetch("/api/organizations/close/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            const res = await fetch("/api/organizations/close/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId: organization?.id, pin: deletePin })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success("Organization closed successfully")
            await signOut()
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
                        Update your company's information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
                            <div className="space-y-3">
                                <span className="text-sm font-medium leading-none">Company Logo</span>
                                <div className="relative w-40 h-40 rounded-xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                                    {logoPreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
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
                                    <label htmlFor="logo-upload" className="absolute inset-0 cursor-pointer">
                                        <span className="sr-only">Upload logo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium">Upload New Logo</h3>
                                    <p className="text-sm text-muted-foreground"> Recommended size 400x400px. PNG, JPG, SVG. Max 5MB. </p>
                                </div>
                                <div className="flex flex-col gap-3 max-w-xs">
                                    <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="cursor-pointer" />
                                    {logo && (
                                        <div className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-md flex items-center gap-2">
                                            <Upload className="w-3 h-3" /> Selected: {logo.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label htmlFor="name" className="text-sm font-medium leading-none">Company Name</label>
                            </div>
                            <div className="max-w-md">
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label htmlFor="address" className="text-sm font-medium leading-none">Office Address</label>
                            </div>
                            <div className="max-w-md">
                                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11" />
                            </div>
                        </div>

                        {/* Clock Link Section */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none">Clock Portal Link</label>
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
                                            toast.success("Logo URL copied!");
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
                                        onClick={() => window.open(`${window.location.origin}/org/${organization.slug}/clock`, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/40">
                            <Button
                                type="submit"
                                disabled={loading || !hasChanges}
                                className="min-w-[120px] cursor-pointer"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="mt-8 border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-8">
                    <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium">Password</h3>
                            <p className="text-xs text-muted-foreground">Update your credentials.</p>
                        </div>
                        <Button variant="outline" onClick={() => setIsChangePasswordOpen(true)} className="cursor-pointer font-bold border-2">
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Integrations */}
            <Card className="mt-8 border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-8">
                    <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium">Google Calendar</h3>
                                <p className="text-xs text-muted-foreground">Sync interviews effectively.</p>
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
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-red-950">Close Organization</h3>
                            <p className="text-xs text-red-800/90 max-w-lg font-medium">PERMANENTLY delete everything.</p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setIsDeleteModalOpen(true)
                                setDeleteStep('initial')
                            }}
                            className="font-bold cursor-pointer"
                        >
                            Close Organization
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />

            {/* Deletion Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">{deleteStep === 'initial' ? 'Are you sure?' : 'Verify Code'}</h3>
                        {deleteStep === 'initial' ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">We will send a PIN to your email.</p>
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleInitiateDelete} disabled={deleteLoading}>Get PIN</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Input value={deletePin} onChange={(e) => setDeletePin(e.target.value)} placeholder="6-digit PIN" maxLength={6} className="text-center text-xl" />
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setDeleteStep('initial')}>Back</Button>
                                    <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteLoading || deletePin.length < 6}>Confirm Delete</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
