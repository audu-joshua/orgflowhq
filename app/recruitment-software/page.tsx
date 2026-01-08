import Link from "next/link"
import { Metadata } from "next"
import { Navbar } from "@/components/layout/Navbar"
import { Pricing } from "@/components/sections/Pricing"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
    title: "Recruiting Software | OrgFlow",
    description: "Hire top talent faster with OrgFlow.",
}

export default function RecruitmentSoftwarePage() {
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
                            <span className="text-primary text-sm font-semibold">Hire Better, Faster</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                            Powerful <span className="text-primary">Recruitment</span> for Growth
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                            Hire top talent without the chaos. Simplify everything from job postings to offer letters.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link
                                href="/register"
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                            >
                                Start Hiring Now
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-3 bg-card text-foreground border-2 border-border rounded-xl hover:bg-muted transition-all font-semibold"
                            >
                                Watch Overview
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
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl overflow-hidden border border-primary/10 flex items-center justify-center">
                                <div className="p-8 text-center">
                                    <div className="w-64 h-40 bg-card border border-border rounded-xl shadow-2xl mx-auto flex flex-col items-start p-4">
                                        <div className="w-full h-4 bg-muted rounded mb-2"></div>
                                        <div className="w-3/4 h-3 bg-muted/50 rounded mb-4"></div>
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground italic mt-4">Product Visualization Coming Soon</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transform Your Recruitment Workflow</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Automated Job Postings</h3>
                                        <p className="text-muted-foreground">Publish job openings to your custom career portal and top job boards with a single click.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Collaborative Evaluation</h3>
                                        <p className="text-muted-foreground">Share candidate profiles with hiring managers and get instant feedback through internal notes and ratings.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Offer Management</h3>
                                        <p className="text-muted-foreground">Generate offer letters from templates and track candidate acceptance in real-time.</p>
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
                        <h2 className="text-3xl font-bold mb-4">Recruitment Innovation</h2>
                        <p className="text-muted-foreground">We're building the future of strategic talent acquisition.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">01</div>
                            <h3 className="font-semibold mb-2">AI Resume Screening</h3>
                            <p className="text-sm text-muted-foreground">Intelligently rank candidates based on job requirements to save hours of manual review. <span className="block mt-1 font-medium text-primary/70 italic text-xs">Coming Q1 2026</span></p>
                        </div>
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">02</div>
                            <h3 className="font-semibold mb-2">Interview Scheduling</h3>
                            <p className="text-sm text-muted-foreground">Synchronized calendars for easy interview coordination between candidates and teams. <span className="block mt-1 font-medium text-primary/70 italic text-xs">In Development</span></p>
                        </div>
                        <div className="p-6">
                            <div className="text-primary font-bold text-4xl mb-4">03</div>
                            <h3 className="font-semibold mb-2">External Board Sync</h3>
                            <p className="text-sm text-muted-foreground">Broaden your reach with automated syncing to LinkedIn, Indeed, and more. <span className="block mt-1 font-medium text-primary/70 italic text-xs">Coming Q2 2026</span></p>
                        </div>
                    </div>
                </div>
            </section>

            <Pricing />

            {/* Final CTA */}
            <section className="py-32 bg-primary">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready to Find Your Next Star?</h2>
                    <p className="text-xl text-primary-foreground/80 mb-8">
                        Experience the modern way of hiring with OrgFlow Recruitment.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            href="/register"
                            className="px-8 py-3 bg-primary-foreground text-primary rounded-xl hover:bg-white transition-colors font-bold shadow-xl"
                        >
                            Start Your Free Trial
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
