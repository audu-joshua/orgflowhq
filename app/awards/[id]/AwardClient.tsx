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

                {/* The Certificate */}
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border-8 border-amber-500/5 relative overflow-hidden flex flex-col items-center">

                    {/* Watermark Logo Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none p-12">
                        {org?.logo_url ? (
                            <img src={org.logo_url} className="w-full h-full object-contain grayscale" />
                        ) : (
                            <span className="text-[20rem] font-black">{org?.name?.[0]}</span>
                        )}
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10 w-full">
                        <div className="relative mb-10 sm:mb-14">
                            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-150" />
                            {winner.employee?.profile_image_url ? (
                                <img
                                    src={winner.employee.profile_image_url}
                                    alt={winner.employee.full_name}
                                    className="w-64 h-64 sm:w-[24rem] sm:h-[24rem] rounded-[4rem] sm:rounded-[5rem] object-cover ring-[16px] ring-white shadow-2xl"
                                />
                            ) : (
                                <div className="w-64 h-64 sm:w-[24rem] sm:h-[24rem] bg-amber-500/10 rounded-[4rem] sm:rounded-[5rem] flex items-center justify-center text-amber-500 font-bold text-7xl sm:text-[8rem] ring-[16px] ring-white shadow-2xl">
                                    {winner.employee?.full_name?.[0]}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mb-10 sm:mb-12 w-full">
                            <p className="text-amber-600 font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                                Employee of the Month — {new Date(winner.reveal_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 px-2 leading-tight">{winner.employee?.full_name}</h2>
                        </div>

                        <div className="w-full h-px bg-slate-100 mb-8 sm:mb-10" />

                        {/* Footer Branding */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between w-full px-2 gap-8">
                            <div className="text-center sm:text-left">
                                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 leading-none">Awarded By</p>
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    {org?.logo_url && <img src={org.logo_url} className="h-5 w-5 rounded-md object-contain" />}
                                    <p className="text-sm font-black text-slate-900 leading-none">{org?.name}</p>
                                </div>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 leading-none">Powered By</p>
                                <div className="flex items-center gap-1.5 justify-center sm:justify-end">
                                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                                        <span className="text-[10px] font-black text-white">O</span>
                                    </div>
                                    <span className="text-sm font-black tracking-tighter text-primary leading-none">OrgFlow</span>
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
