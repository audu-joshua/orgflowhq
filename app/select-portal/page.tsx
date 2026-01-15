"use client"

import { Building2, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SelectPortalPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradients & Logo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />

                {/* Large Background Logo */}
                <div className="absolute -bottom-20 -left-20 opacity-5 grayscale select-none">
                    <img src="/logo.png" alt="Branding" className="w-[500px] h-auto object-contain" />
                </div>
            </div>

            <div className="max-w-4xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Welcome Back</h1>
                        <p className="text-muted-foreground text-lg">Select your destination to continue</p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Platform Admin Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Link href="/admin" className="group">
                            <div className="h-full bg-card border border-border p-8 rounded-2xl shadow-lg shadow-black/5 hover:border-primary hover:shadow-primary/20 transition-all relative overflow-hidden group-hover:-translate-y-1">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck size={140} />
                                </div>

                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <ShieldCheck size={32} />
                                </div>

                                <h2 className="text-2xl font-bold text-foreground mb-3">Platform Admin</h2>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    Manage global system settings, tenants, user roles, and platform-wide analytics.
                                </p>

                                <div className="flex items-center text-primary font-semibold gap-2 group-hover:gap-4 transition-all">
                                    Enter Admin Portal <ArrowRight size={20} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Organization Dashboard Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link href="/dashboard?portal=org" className="group">
                            <div className="h-full bg-card border border-border p-8 rounded-2xl shadow-lg shadow-black/5 hover:border-blue-500 hover:shadow-blue-500/20 transition-all relative overflow-hidden group-hover:-translate-y-1">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <Building2 size={140} />
                                </div>

                                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Building2 size={32} />
                                </div>

                                <h2 className="text-2xl font-bold text-foreground mb-3">Organization View</h2>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    Access your organization's workspace to manage teams, hiring, and daily operations.
                                </p>

                                <div className="flex items-center text-blue-500 font-semibold gap-2 group-hover:gap-4 transition-all">
                                    Enter Dashboard <ArrowRight size={20} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Logged in as Super Admin
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
