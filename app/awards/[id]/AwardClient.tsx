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
                <div className="bg-white rounded-[4rem] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border-8 border-amber-500/5 relative">

                    {/* Organization Logo */}
                    <div className="flex justify-center mb-10">
                        {org?.logo_url ? (
                            <img src={org.logo_url} alt={org.name} className="max-h-20 object-contain rounded-2xl shadow-sm" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-2xl">O</div>
                                <span className="text-2xl font-black tracking-tighter text-slate-900">{org?.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-12 sm:mb-16">
                            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                            {winner.employee?.profile_image_url ? (
                                <img
                                    src={winner.employee.profile_image_url}
                                    alt={winner.employee.full_name}
                                    className="w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-[4.5rem] sm:rounded-[6rem] object-cover ring-[20px] ring-white shadow-2xl relative z-10"
                                />
                            ) : (
                                <div className="w-72 h-72 sm:w-[28rem] sm:h-[28rem] bg-amber-500/10 rounded-[4.5rem] sm:rounded-[6rem] flex items-center justify-center text-amber-500 font-bold text-8xl sm:text-[10rem] relative z-10 ring-[20px] ring-white shadow-2xl">
                                    {winner.employee?.full_name?.[0]}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mb-10 sm:mb-12 w-full">
                            <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] sm:text-xs">
                                Employee of the Month — {new Date(winner.reveal_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <h2 className="text-4xl sm:text-7xl font-black text-slate-900 px-4 leading-tight">{winner.employee?.full_name}</h2>
                        </div>

                        <div className="w-full h-px bg-slate-100 mb-8 sm:mb-10" />

                        {/* Footer Branding */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between w-full px-4 sm:px-6 gap-8">
                            <div className="text-center sm:text-left">
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 leading-none">Awarded By</p>
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                    {org?.logo_url && <img src={org.logo_url} className="h-5 w-5 rounded-md object-contain" />}
                                    <p className="text-sm font-black text-slate-900 leading-none max-w-[200px] break-words">{org?.name}</p>
                                </div>
                            </div>
                            <div className="text-center sm:text-right border-t sm:border-t-0 pt-6 sm:pt-0 w-full sm:w-auto border-slate-100">
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 leading-none">Powered By</p>
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
