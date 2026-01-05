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

export default function SettingsPage() {
    const { organization, setOrganization } = useAppStore()
    const [name, setName] = useState("")
    const [logo, setLogo] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

    // Initial data load
    useEffect(() => {
        if (organization) {
            setName(organization.name || "")
            setLogoPreview(organization.logo_url || null)
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

                console.log("Logo uploaded successfully. URL:", publicUrl)
                logoUrl = publicUrl
            }

            // Prepare update data
            const updateData: any = {
                name: name.trim(),
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

        } catch (error: any) {
            console.error("Error updating settings:", error)
            const errorMessage = error.message || "Failed to update settings"
            toast.error(errorMessage)
        } finally {
            setLoading(false)
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

    const hasChanges = (logo !== null) || (name !== (organization.name || ""))

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

                        {/* Clock Portal Link Section (New) */}
                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start pt-6 border-t border-border/40">
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none">Clock Portal Link</label>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    Share this link with your employees so they can clock in and out.
                                </p>
                            </div>
                            <div className="max-w-md space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-2.5 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                        {`${typeof window !== 'undefined' ? window.location.origin : ''}/org/${organization.slug}/clock`}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 h-10 w-10"
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
                                        className="shrink-0 h-10 w-10 text-primary hover:text-primary"
                                        onClick={() => {
                                            const url = `${window.location.origin}/org/${organization.slug}/clock`;
                                            window.open(url, '_blank');
                                        }}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    Employees will need after their Email and unique Employee ID to login here.
                                </p>
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
                                    setLogo(null)
                                    setLogoPreview(organization.logo_url || null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !hasChanges}
                                className="min-w-[120px]"
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

            {/* Security Section */}
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
                            className="font-bold border-2"
                        >
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    )
}