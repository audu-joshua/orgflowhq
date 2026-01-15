import Link from "next/link"
import { Metadata } from "next"
import { Navbar } from "@/components/layout/Navbar"
import { Pricing } from "@/components/sections/Pricing"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
    title: "HR Software | OrgFlow",
    description: "Manage your team and payroll with OrgFlow.",
}

export default function HRSoftwarePage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-card via-background to-card pt-32 pb-16 relative overflow-hidden">
                {/* Decorative Background Elements (Animated Network) */}
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
                            <span className="text-primary text-sm font-semibold">Scale Your HR Operations</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                            Modern <span className="text-primary">HR Software</span> built for speed
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                            Ditch spreadsheets. Manage your entire workforce and payroll in one central platform.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link
                                href="/register"
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-3 bg-card text-foreground border-2 border-border rounded-xl hover:bg-muted transition-all font-semibold"
                            >
                                View Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Prop Section */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Modern Teams Choose OrgFlow for HR</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Centralized Employee Directory</h3>
                                        <p className="text-muted-foreground">Keep all employee records, documents, and history in one secure, easily accessible place.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Role-Based Permissions</h3>
                                        <p className="text-muted-foreground">Customizable access levels for HR, managers, and employees to ensure data security and privacy.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Automated Workflows</h3>
                                        <p className="text-muted-foreground">Reduce manual tasks with automated onboarding checklists and approval processes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl overflow-hidden border border-primary/10 flex items-center justify-center">
                                <div className="p-8 text-center">
                                    <div className="w-48 h-32 bg-card border border-border rounded-xl shadow-2xl mx-auto mb-4 -rotate-6 transform translate-x-4"></div>
                                    <div className="w-48 h-32 bg-card border border-border rounded-xl shadow-2xl mx-auto -translate-y-12"></div>
                                    <p className="text-sm font-medium text-muted-foreground italic">Product Visualization Coming Soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roadmap Section (Honesty check) */}
            <section className="py-24 bg-card/50 border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">The Future of OrgFlow HR</h2>
                        <p className="text-muted-foreground">We're constantly building tools to help your organization thrive.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">01</div>
                            <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                            <p className="text-sm text-muted-foreground">Deeper insights into workforce performance and retention trends. <span className="block mt-1 font-medium text-primary/70 italic text-xs">Coming Q1 2026</span></p>
                        </div>
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">02</div>
                            <h3 className="font-semibold mb-2">Integration Hub</h3>
                            <p className="text-sm text-muted-foreground">Connect with your favorite payroll and benefit providers seamlessly. <span className="block mt-1 font-medium text-primary/70 italic text-xs">Coming Q2 2026</span></p>
                        </div>
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">03</div>
                            <h3 className="font-semibold mb-2">Mobile First</h3>
                            <p className="text-sm text-muted-foreground">A dedicated mobile experience for employee self-service on the go. <span className="block mt-1 font-medium text-primary/70 italic text-xs">In Development</span></p>
                        </div>
                    </div>
                </div>
            </section>

            <Pricing />

            {/* Final CTA */}
            <section className="py-32 bg-primary">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready to Modernize Your Office?</h2>
                    <p className="text-xl text-primary-foreground/80 mb-8">
                        Join the organizations building a better workplace with OrgFlow.
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
