"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Briefcase, Building2, ArrowRight, LayoutGrid, List, Sparkles } from "lucide-react"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

interface RoleWithImages {
    id: string
    title: string
    slug: string
    department?: string
    location?: string
    employment_type?: string
    organizations?: {
        name?: string
        logo_url?: string
    }
    role_images?: Array<{ image_url: string }>
}

export default function PublicRolesPage() {
    const [roles, setRoles] = useState<RoleWithImages[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const response = await fetch('/api/roles/public')
                if (!response.ok) throw new Error('Failed to fetch roles')
                const data = await response.json()
                setRoles(data)
            } catch (err) {
                console.error("Failed to load roles:", err)
            } finally {
                setLoading(false)
            }
        }
        loadRoles()
    }, [])

    const filteredRoles = roles.filter(role =>
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.organizations?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground animate-pulse font-medium">Curating top opportunities...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="pb-20 pt-32">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden mb-12">
                        <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 relative z-10">
                            {/* Floating Elements (Desktop Only) */}
                            <div className="hidden lg:block absolute inset-0 pointer-events-none">
                                {/* Top Left */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, x: -50 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className="absolute top-[2%] left-[6%] w-32 h-44 rounded-2xl overflow-hidden border-2 border-border shadow-2xl rotate-[-6deg] z-10"
                                >
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=450&auto=format&fit=crop" className="w-full h-full object-cover" alt="Talent" />
                                    <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 border border-border">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[10px] font-bold">+$120k</span>
                                    </div>
                                </motion.div>

                                {/* Top Right */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, x: 50 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                    className="absolute top-[8%] right-[6%] w-40 h-52 rounded-2xl overflow-hidden border-2 border-border shadow-2xl rotate-[8deg] z-10"
                                >
                                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=450&auto=format&fit=crop" className="w-full h-full object-cover" alt="Talent" />
                                    <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 border border-border">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-bold">Remote</span>
                                    </div>
                                </motion.div>

                                {/* Bottom Left */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                    className="absolute top-[35%] left-[5%] w-48 h-64 rounded-2xl overflow-hidden border-2 border-border shadow-2xl rotate-[4deg] z-20"
                                >
                                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=600&auto=format&fit=crop" className="w-full h-full object-cover" alt="Talent" />
                                    <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 border border-border">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        <span className="text-xs font-black">+$180k</span>
                                    </div>
                                </motion.div>

                                {/* Bottom Right */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 0.8 }}
                                    className="absolute top-[41%] right-[5%] w-36 h-48 rounded-2xl overflow-hidden border-2 border-border shadow-2xl rotate-[-4deg] z-20"
                                >
                                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=450&auto=format&fit=crop" className="w-full h-full object-cover" alt="Talent" />
                                    <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 border border-border">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <span className="text-[10px] font-bold">Top Talent</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Centered Content */}
                            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8"
                                >
                                    <Sparkles size={14} />
                                    Join Our Ecosystem
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tighter leading-[0.9] uppercase"
                                >
                                    Roles powered by <br />
                                    your <span className="text-primary italic">potential™</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg text-muted-foreground font-medium max-w-2xl"
                                >
                                    Discover opportunities that align with your velocity.
                                </motion.p>

                                {/* Stats Row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-8 mt-8 pt-6 border-t border-border/50"
                                >
                                    <div className="text-center group">
                                        <div className="text-xl font-black text-foreground group-hover:text-primary transition-colors">5,000+</div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Positions</div>
                                    </div>
                                    <div className="text-center group">
                                        <div className="text-xl font-black text-foreground group-hover:text-primary transition-colors">4.9/5</div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Success Rate</div>
                                    </div>
                                    <div className="text-center group">
                                        <div className="text-xl font-black text-foreground group-hover:text-primary transition-colors">120+</div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Companies</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div id="roles-list" className="sticky top-24 z-30 mb-12 py-4 bg-background/80 backdrop-blur-xl border-y border-border/50">
                        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by title, organization, or expertise..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-muted/30 border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium"
                                />
                            </div>

                            <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Roles Grid */}
                    <div className="max-w-6xl mx-auto px-4">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                layout
                                className={viewMode === "grid"
                                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
                                    : "flex flex-col gap-3"
                                }
                            >
                                {filteredRoles.map((role, index) => (
                                    <motion.div
                                        layout
                                        key={role.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <Link href={`/apply/${role.slug}`} target="_blank" rel="noopener noreferrer" className="group block h-full">
                                            <div className={`
                                                bg-card border border-border/50 hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full
                                                ${viewMode === "list" ? "md:flex-row items-center p-3" : ""}
                                            `}>
                                                {/* Image Container */}
                                                <div className={`
                                                    relative overflow-hidden bg-muted/20
                                                    ${viewMode === "grid" ? "aspect-[2/1] w-full" : "w-full md:w-32 aspect-square rounded-xl"}
                                                `}>
                                                    {role.role_images?.[0] ? (
                                                        <img
                                                            src={role.role_images[0].image_url}
                                                            alt={role.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                            <Briefcase size={48} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                        <span className="text-white text-xs font-bold uppercase tracking-wider bg-primary/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                                                            Apply Now
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className={`
                                                    flex-1 flex flex-col
                                                    ${viewMode === "grid" ? "p-4" : "px-5 py-3"}
                                                `}>
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        {role.organizations?.logo_url ? (
                                                            <img src={role.organizations.logo_url} alt="Org" className="w-5 h-5 rounded-sm object-contain bg-white p-0.5 border border-border/50" />
                                                        ) : (
                                                            <Building2 className="w-5 h-5 p-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20" />
                                                        )}
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                                            {role.organizations?.name || "Premium Organization"}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-base font-black text-foreground mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                                        {role.title}
                                                    </h3>

                                                    <div className="flex flex-wrap gap-2 mt-auto">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                                            <MapPin size={12} className="text-primary" />
                                                            {role.location || "Remote"}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                                            <Briefcase size={12} className="text-primary" />
                                                            {role.employment_type || "Full-time"}
                                                        </div>
                                                    </div>

                                                    {viewMode === "grid" && (
                                                        <motion.div
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                                                                <ArrowRight size={14} />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {filteredRoles.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center"
                            >
                                <div className="inline-flex p-6 rounded-full bg-muted/30 mb-6">
                                    <Search size={48} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No matching positions found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Try adjusting your search criteria or explore our featured organizations above.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
