"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Organization } from "@/features/organization/types"
import { organizationService } from "@/features/organization/services/organizationService"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function BillingPage() {
    const { organization } = useAppStore()
    const [subscription, setSubscription] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [processingPlan, setProcessingPlan] = useState<string | null>(null)
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

    useEffect(() => {
        if (organization?.id) {
            // Check for transaction verification
            const query = new URLSearchParams(window.location.search)
            const reference = query.get('reference') || query.get('trxref')

            if (reference) {
                verifyPayment(reference, organization.id)
            } else {
                loadSubscription()
            }
        }
    }, [organization?.id])

    const verifyPayment = async (reference: string, orgId: string) => {
        setProcessingPlan('verifying')
        try {
            const res = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference, organizationId: orgId })
            })
            const data = await res.json()
            if (data.status) {
                toast.success("Payment successful! Subscription active.")
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname)
                loadSubscription()
            } else {
                toast.error("Payment verification failed")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error verifying payment")
        } finally {
            setProcessingPlan(null)
        }
    }

    const loadSubscription = async () => {
        try {
            const sub = await organizationService.getOrganizationSubscription(organization!.id)
            setSubscription(sub)
        } catch (error) {
            console.error("Failed to load subscription", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribe = async (planSlug: string) => {
        setProcessingPlan(planSlug)
        try {
            const { data: { session } } = await (await import("@/lib/supabaseClient")).getSupabaseClient().auth.getSession()
            if (!session?.user?.email) throw new Error("User email not found")

            // Call API to initialize transaction
            const res = await fetch("/api/payment/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: organization!.id,
                    planSlug,
                    email: session.user.email,
                    callbackUrl: `${window.location.origin}/dashboard/billing` // Return here after payment
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Payment initialization failed")

            // Redirect to Paystack
            if (data.data?.authorization_url) {
                window.location.href = data.data.authorization_url
            } else {
                toast.success("Subscription updated (Free tier)")
                loadSubscription() // Reload if instant update
            }

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setProcessingPlan(null)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
    }

    const currentPlanSlug = subscription?.plan?.slug || 'free'
    const isAnnual = billingInterval === 'yearly'

    // Pricing Config (Mirroring Pricing.tsx logic but reusable here)
    const plans = [
        {
            name: "Free Tier",
            slug: "free",
            price: 0,
            description: "Perfect for individuals and small startups.",
            features: ["Up to 5 Active Applicant Roles", "Basic Applicant Tracking", "No Employee Profiles"]
        },
        {
            name: "Mid-Level",
            slug: isAnnual ? "mid-yearly" : "mid-monthly",
            price: isAnnual ? 380000 : 35000,
            intervalLabel: isAnnual ? "/year" : "/month",
            description: "For growing teams and established businesses.",
            features: ["Up to 20 Employees", "Unlimited Applicant Roles", "Automated Hire Syncing", "Basic Time Sheets"]
        },
        {
            name: "Premium",
            slug: isAnnual ? "premium-yearly" : "premium-monthly",
            price: isAnnual ? 8000 : 800,
            intervalLabel: isAnnual ? "/employee/year" : "/employee/month",
            description: "Full power for large organizations (>20 employees).",
            features: ["Unlimited Employees", "Full ATS Suite", "Detailed Analytics", "Complete Management"]
        }
    ]

    const formatPrice = (amount: number) => {
        return `₦${amount.toLocaleString()}`
    }

    return (
        <div className="container max-w-6xl py-10 px-4">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing & Plans</h1>
                    <p className="text-muted-foreground mt-2">Manage your subscription and payment methods.</p>
                </div>
                {/* Billing Toggle */}
                <div className="flex items-center gap-3 bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setBillingInterval('monthly')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!isAnnual ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingInterval('yearly')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isAnnual ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                    >
                        Yearly <span className="text-xs text-green-600 ml-1">-20%</span>
                    </button>
                </div>
            </div>

            {subscription && subscription.status === 'active' && (
                <Card className="mb-8 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Current Plan: <span className="text-primary">{subscription.plan?.name || "Free Tier"}</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                        </CardTitle>
                        <CardDescription>
                            Your plan renews on {new Date(subscription.current_period_end).toLocaleDateString()}.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrent = currentPlanSlug === plan.slug || (plan.slug === 'free' && !subscription)
                    return (
                        <Card key={plan.slug} className={`flex flex-col ${isCurrent ? 'border-primary shadow-md' : 'border-border'}`}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    {plan.name}
                                    {isCurrent && <Badge>Current</Badge>}
                                </CardTitle>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                                    <span className="text-muted-foreground text-sm">{plan.intervalLabel || "/month"}</span>
                                </div>
                                <CardDescription className="mt-2">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full"
                                    variant={isCurrent ? "outline" : "default"}
                                    disabled={isCurrent || !!processingPlan}
                                    onClick={() => handleSubscribe(plan.slug)}
                                >
                                    {processingPlan === plan.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCurrent ? "Current Plan" : (plan.price === 0 ? "Downgrade" : "Upgrade"))}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
