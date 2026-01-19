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

                <div id="award-card" className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border-8 border-amber-500/5 relative overflow-hidden flex flex-col items-center w-full max-w-[600px] aspect-[4/5] sm:aspect-auto justify-center">

                    {/* Watermark Logo Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none p-16">
                        {org?.logo_url ? (
                            <img src={org.logo_url} className="w-full h-full object-contain grayscale" />
                        ) : (
                            <span className="text-[15rem] font-black">{org?.name?.[0]}</span>
                        )}
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10 w-full space-y-4 sm:space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-125" />
                            {winner.employee?.profile_image_url ? (
                                <img
                                    src={winner.employee.profile_image_url}
                                    alt={winner.employee.full_name}
                                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-[3rem] sm:rounded-[4rem] object-cover ring-[12px] ring-white shadow-2xl"
                                />
                            ) : (
                                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-amber-500/10 rounded-[3rem] sm:rounded-[4rem] flex items-center justify-center text-amber-500 font-bold text-6xl sm:text-8xl ring-[12px] ring-white shadow-2xl">
                                    {winner.employee?.full_name?.[0]}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                            <p className="text-amber-600 font-black uppercase tracking-[0.3em] text-[9px] sm:text-[10px]">
                                Employee of the Month — {new Date(winner.reveal_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 px-2 leading-tight">{winner.employee?.full_name}</h2>
                        </div>

                        <div className="w-[80%] h-px bg-slate-100" />

                        <div className="flex flex-row items-center justify-between w-full px-4 sm:px-6 gap-4">
                            <div className="flex flex-col items-start text-left">
                                <p className="text-[7px] sm:text-[8px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 leading-none">Awarded By</p>
                                <div className="flex items-center gap-2">
                                    {org?.logo_url && <img src={org.logo_url} className="h-5 w-5 sm:h-6 sm:w-6 rounded-md object-contain" />}
                                    <p className="text-[10px] sm:text-xs font-black text-slate-900 leading-none">{org?.name}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end text-right">
                                <p className="text-[7px] sm:text-[8px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 leading-none">Powered By</p>
                                <div className="flex items-center gap-1.5 justify-end">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-md flex items-center justify-center">
                                        <span className="text-[10px] font-black text-white">O</span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-black tracking-tighter text-primary leading-none">OrgFlow</span>
                                </div>
                            </div>
                        </div>
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
