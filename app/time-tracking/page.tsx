import Link from "next/link"
import { Metadata } from "next"
import { Navbar } from "@/components/layout/Navbar"
import { Pricing } from "@/components/sections/Pricing"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
    title: "Time Tracking | OrgFlow",
    description: "Track hours and timesheets with OrgFlow.",
}

export default function TimeTrackingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card pt-32 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <path id="networkPath" d="M 80,150 L 200,150 L 200,280 M 200,150 L 350,120 L 350,250 M 350,250 L 480,280 L 480,420 M 480,280 L 600,250 M 200,280 L 350,350 M 350,350 L 480,420 M 350,350 L 200,450 L 200,600 M 200,600 L 350,650 L 480,620 M 480,620 L 480,780 M 350,650 L 200,750 L 80,800 M 600,250 L 960,200 L 1350,250 M 480,620 L 720,650 L 960,680 L 1200,650 L 1480,620 M 1920,150 L 1750,150 L 1750,280 M 1750,150 L 1600,120 L 1600,250 M 1600,250 L 1480,280 L 1480,420 M 1480,280 L 1350,250 M 1750,280 L 1600,350 M 1600,350 L 1480,420 M 1600,350 L 1750,450 L 1750,600 M 1750,600 L 1600,650 L 1480,620 M 1480,620 L 1480,780 M 1600,650 L 1750,750 L 1850,800" fill="none" />
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>
                        <use href="#networkPath" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" className="text-border/90 dark:text-white/15" />
                        <circle r="4" fill="currentColor" className="text-primary" filter="url(#glow)">
                            <animateMotion dur="45s" repeatCount="indefinite"><mpath href="#networkPath" /></animateMotion>
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                            <span className="text-primary text-sm font-semibold">Every Minute Counts</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                            Effortless <span className="text-primary">Time Tracking</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                            No more manual timesheets. Accurate tracking for employees, easy approvals for managers.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link
                                href="/register"
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                            >
                                Track Time for Free
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-3 bg-card text-foreground border-2 border-border rounded-xl hover:bg-muted transition-all font-semibold"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Prop Section */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 relative">
                            <div className="aspect-square bg-gradient-to-tr from-primary/10 to-primary/5 rounded-3xl border border-primary/10 flex items-center justify-center relative overflow-hidden">
                                <div className="p-8 text-center text-muted-foreground">
                                    <div className="w-32 h-32 rounded-full border-4 border-primary/20 mx-auto mb-4 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full border-4 border-primary/40 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-primary/10"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium italic">Product Visualization Coming Soon</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Accuracy Meets Simplicity</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">One-Click Clock-In</h3>
                                        <p className="text-muted-foreground">Mobile and desktop friendly interface allows team members to start tracking in seconds.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Location Verification</h3>
                                        <p className="text-muted-foreground">Ensure accuracy with optional GPS tagging for remote and field teams during clock-ins.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Instant Timesheet Reports</h3>
                                        <p className="text-muted-foreground">Export clean, accurate reports for payroll or client billing with just a few clicks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="py-24 bg-card/50 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Tracking Roadmap</h2>
                        <p className="text-muted-foreground">Making time tracking smarter and more insightful.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">01</div>
                            <h3 className="font-semibold mb-2">Project Costing</h3>
                            <p className="text-sm text-muted-foreground">Link hours directly to specific projects to see real-time profitability. <span className="block mt-1 font-medium text-primary/70 italic text-xs">Coming Q1 2026</span></p>
                        </div>
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">02</div>
                            <h3 className="font-semibold mb-2">Smart Reminders</h3>
                            <p className="text-sm text-muted-foreground">Automated pings for team members who forget to clock out or submit timesheets. <span className="block mt-1 font-medium text-primary/70 italic text-xs">In Development</span></p>
                        </div>
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">03</div>
                            <h3 className="font-semibold mb-2">Biometric Verification</h3>
                            <p className="text-sm text-muted-foreground">Face recognition and fingerprint support for high-security environments. <span className="block mt-1 font-medium text-primary/70 italic text-xs">Coming Q2 2026</span></p>
                        </div>
                    </div>
                </div>
            </section>

            <Pricing />

            {/* Final CTA */}
            <section className="py-32 bg-primary">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready to Reclaim Your Time?</h2>
                    <p className="text-xl text-primary-foreground/80 mb-8">
                        Simplify your workforce management with OrgFlow Time Tracking.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            href="/register"
                            className="px-8 py-3 bg-primary-foreground text-primary rounded-xl hover:bg-white transition-colors font-bold shadow-xl"
                        >
                            Get Started for Free
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
