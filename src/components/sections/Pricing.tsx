"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Pricing() {
    const [isAnnual, setIsAnnual] = useState(false)
    const [currency, setCurrency] = useState<"USD" | "NGN">("USD")

    const pricing = {
        free: {
            USD: 0,
            NGN: 0,
        },
        mid: {
            USD: {
                monthly: 25,
                yearly: 20, // 20% discount
            },
            NGN: {
                monthly: 35000,
                yearly: 28000, // 20% discount
            },
        },
        premium: {
            USD: {
                monthly: 1,
                yearly: 0.8,
            },
            NGN: {
                monthly: 800,
                yearly: 640,
            }
        }
    }

    const formatPrice = (amount: number) => {
        if (currency === "USD") return `$${amount}`
        return `₦${amount.toLocaleString()}`
    }

    return (
        <section id="pricing" className="py-32 bg-card">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-xl text-muted-foreground mb-8">Choose the plan that's right for you</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        {/* Currency Toggle */}
                        <div className="bg-muted p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setCurrency("USD")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currency === "USD"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                USD ($)
                            </button>
                            <button
                                onClick={() => setCurrency("NGN")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currency === "NGN"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                NGN (₦)
                            </button>
                        </div>

                        {/* Billing Cycle Toggle */}
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isAnnual ? "bg-primary" : "bg-muted-foreground/30"
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform ${isAnnual ? "translate-x-7" : "translate-x-0"
                                        }`}
                                />
                            </button>
                            <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                                Yearly <span className="text-xs text-primary font-bold ml-1">(Save 20%)</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                    {/* Free Tier */}
                    <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-all relative group h-full flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Free Tier</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold text-foreground">{formatPrice(pricing.free[currency])}</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <p className="text-muted-foreground text-sm">Perfect for individuals and small startups.</p>
                        </div>

                        <div className="flex-grow">
                            <div className="space-y-4 mb-8">
                                <div className="font-semibold text-foreground text-sm uppercase tracking-wider">Features</div>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Up to <strong>5 Active Applicant Roles</strong></span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Basic Applicant Tracking & Submission</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <svg className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>No Employee Profile Creation</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <svg className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>No Time Sheets</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Link
                            href="/register"
                            className="block w-full py-3 text-center bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors font-semibold"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Tier 2 (Mid-Level) */}
                    <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-xl border-2 border-primary relative overflow-hidden transform lg:-translate-y-4 h-full flex flex-col">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg uppercase tracking-wider">
                            Popular
                        </div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-2">Mid-Level</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold">
                                    {formatPrice(isAnnual ? pricing.mid[currency].yearly : pricing.mid[currency].monthly)}
                                </span>
                                <span className="text-primary-foreground/80">/month</span>
                            </div>
                            {isAnnual && (
                                <p className="text-sm bg-primary-foreground/20 inline-block px-2 py-1 rounded mb-2">
                                    Billed {formatPrice(pricing.mid[currency].yearly * 12)} yearly
                                </p>
                            )}
                            <p className="text-primary-foreground/80 text-sm">For growing teams and established businesses.</p>
                        </div>

                        <div className="flex-grow">
                            <div className="space-y-4 mb-8">
                                <div className="font-semibold text-primary-foreground/90 text-sm uppercase tracking-wider">Everything in Free, plus:</div>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm">
                                        <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Support up to <strong>20 Employees</strong></span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>Unlimited</strong> Active Applicant Roles</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Custom Applicant Roles</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Automated Hire Syncing to Employee Profiles</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm">
                                        <svg className="w-5 h-5 text-white shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Basic Time Sheets</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Link
                            href="/register"
                            className="block w-full py-3 text-center bg-background text-primary rounded-xl hover:bg-background/90 transition-colors font-bold"
                        >
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Tier 3 (Premium) */}
                    <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-all relative group h-full flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold text-foreground">
                                    {formatPrice(isAnnual ? pricing.premium[currency].yearly : pricing.premium[currency].monthly)}
                                </span>
                                <span className="text-muted-foreground">/employee/month</span>
                            </div>
                            {isAnnual && (
                                <p className="text-sm bg-primary/10 text-primary inline-block px-2 py-1 rounded mb-2">
                                    {formatPrice(pricing.premium[currency].yearly)} billed per employee
                                </p>
                            )}
                            <p className="text-muted-foreground text-sm">Full power for large organizations (&gt;20 employees).</p>
                        </div>

                        <div className="flex-grow">
                            <div className="space-y-4 mb-8">
                                <div className="font-semibold text-foreground text-sm uppercase tracking-wider">Everything in Mid-Level, plus:</div>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>Unlimited</strong> Employees (&gt;20)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Unlimited Active Applicant Roles</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Full Applicant Tracking Suite</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Detailed Time Sheets & Analytics</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-foreground/80">
                                        <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Complete Employee Management</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Link
                            href="/register"
                            className="block w-full py-3 text-center bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors font-semibold"
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
