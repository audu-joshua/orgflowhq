"use client"

import { Trophy, Sparkles, Star, Heart, ArrowRight, ExternalLink } from "lucide-react"
import type { EOTMWinner } from "@/features/departments/types/eotm"

interface AwardClientProps {
    winner: EOTMWinner
    org: any
}

export default function AwardClient({ winner, org }: AwardClientProps) {
    return (
        <div className="min-h-screen bg-[#FDFCF9] flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

            <main className="max-w-xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Intro */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex p-4 bg-amber-500 text-white rounded-3xl shadow-xl rotate-3 mb-2">
                        <Trophy size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Wall of Fame</h1>
                    <p className="text-slate-500 font-medium">Celebrating exceptional talent at {org?.name}</p>
                </div>

                <div id="award-card" className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 pt-3 sm:p-10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border-8 border-amber-500/5 relative overflow-hidden flex flex-col items-center w-full max-w-[600px] aspect-[4/5.1] sm:aspect-auto justify-between">

                    {/* Watermark Logo Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none p-16">
                        {org?.logo_url ? (
                            <img src={org.logo_url} className="w-full h-full object-contain grayscale" />
                        ) : (
                            <span className="text-[15rem] font-black">{org?.name?.[0]}</span>
                        )}
                    </div>

                    <div className="flex flex-col items-center relative z-10 w-full flex-grow justify-start pt-2 sm:pt-4">
                        {/* Organization Name at Top */}
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-[10px] sm:text-sm mb-2 sm:mb-8 text-center px-4 leading-tight">
                            {org?.name}
                        </h4>

                        <div className="relative mb-3 sm:mb-6">
                            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-125" />
                            {winner.employee?.profile_image_url ? (
                                <img
                                    src={winner.employee.profile_image_url}
                                    alt={winner.employee.full_name}
                                    className="w-32 h-32 sm:w-56 sm:h-56 rounded-[2rem] sm:rounded-[3.5rem] object-cover ring-[8px] ring-white shadow-2xl"
                                />
                            ) : (
                                <div className="w-32 h-32 sm:w-56 sm:h-56 bg-amber-500/10 rounded-[2rem] sm:rounded-[3.5rem] flex items-center justify-center text-amber-500 font-bold text-5xl sm:text-7xl ring-[8px] ring-white shadow-2xl">
                                    {winner.employee?.full_name?.[0]}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 sm:space-y-2 text-center w-full px-4">
                            <h3 className="text-lg sm:text-3xl font-black text-slate-900 leading-tight line-clamp-2">{winner.employee?.full_name}</h3>
                            <p className="text-amber-600 font-black uppercase tracking-[0.25em] text-[7px] sm:text-[9px]">
                                Employee of the Month — {new Date(winner.reveal_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="w-[85%] h-px bg-slate-100 my-3 sm:my-4" />

                    {/* Simplified Logo Footer */}
                    <div className="flex flex-col items-center w-full gap-2 sm:gap-3 relative z-20">
                        <div className="flex flex-row items-center justify-center w-full gap-5 opacity-80 mix-blend-multiply">
                            {/* Organization Logo */}
                            {org?.logo_url && (
                                <img src={org.logo_url} className="h-8 w-auto max-w-[100px] object-contain rounded-lg" />
                            )}

                            {/* Separator Dot */}
                            {org?.logo_url && <div className="w-1 h-1 rounded-full bg-slate-300" />}

                            {/* OrgFlow Icon */}
                            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-sm font-black text-white">O</span>
                            </div>
                        </div>

                        {/* Bottom Tip Branding */}
                        <p className="text-[9px] font-bold text-[#14d4d0] tracking-widest lowercase">orgflowhq.com</p>
                    </div>
                </div>

                {/* Call to Action (Ad) */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 p-2 pl-6 bg-white rounded-full shadow-lg border border-slate-100 group hover:border-primary/30 transition-all cursor-pointer" onClick={() => window.open('https://orgflowhq.com', '_blank')}>
                        <span className="text-sm font-bold text-slate-600">Want to build a high-performance culture like {org?.name}?</span>
                        <div className="bg-primary text-white p-3 rounded-full group-hover:px-6 transition-all flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 hidden group-hover:block transition-all">Get Started</span>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-20 py-10 opacity-30 text-center font-bold text-xs uppercase tracking-widest text-slate-400">
                &copy; {new Date().getFullYear()} OrgFlow Technology. All Rights Reserved.
            </footer>
        </div>
    )
}
