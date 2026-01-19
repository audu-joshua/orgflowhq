"use client"

import { useState, useEffect } from "react"
import { X, Trophy, Download, Share2, Sparkles, Star, Heart, ExternalLink, Loader2 } from "lucide-react"
import type { EOTMWinner } from "../types/eotm"
import { toast } from "@/lib/toast"
import { toPng } from "html-to-image"
import confetti from "canvas-confetti"

interface EOTMRevealOverlayProps {
    isOpen: boolean
    onClose: () => void
    winner: EOTMWinner | null
    organizationName: string
    organizationLogo?: string | null
}

export function EOTMRevealOverlay({
    isOpen,
    onClose,
    winner,
    organizationName,
    organizationLogo
}: EOTMRevealOverlayProps) {
    const [showContent, setShowContent] = useState(false)
    const [isCapturing, setIsCapturing] = useState(false)

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setShowContent(true)
                // Trigger celebratory confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#fbbf24', '#ffffff', '#0fadaa']
                })
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setShowContent(false)
        }
    }, [isOpen])

    if (!isOpen || !winner) return null

    const handleDownloadImage = async () => {
        const node = document.getElementById('award-card')
        if (!node) return
        setIsCapturing(true)
        try {
            const dataUrl = await toPng(node, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                style: {
                    borderRadius: '0'
                }
            })
            const link = document.createElement('a')
            link.download = `EOTM-${winner?.employee?.full_name?.replace(/\s+/g, '-')}.png`
            link.href = dataUrl
            link.click()
            toast.success("Award saved as image!")
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate image")
        } finally {
            setIsCapturing(false)
        }
    }

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/awards/${winner?.id}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Employee of the Month!',
                    text: `Celebrating ${winner?.employee?.full_name} at ${organizationName}`,
                    url: shareUrl,
                })
            } catch (err) {
                console.log('Error sharing', err)
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl)
                toast.success("Award link copied to clipboard!")
            } catch (err) {
                toast.error("Failed to copy link")
            }
        }
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl overflow-y-auto flex justify-center py-20 px-6 transition-all duration-700">

            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 blur-[120px] rounded-full animate-pulse [animation-delay:1s]" />
            </div>

            <div className={`max-w-lg w-full relative h-fit transition-all duration-1000 ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 sm:-right-12 p-4 bg-white text-black hover:bg-amber-500 hover:text-white rounded-full transition-all active:scale-95 z-[210] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    title="Close Reveal"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                {/* Celebration Badge */}
                <div className="text-center space-y-8">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
                        <div className="relative p-6 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-[2.5rem] shadow-2xl rotate-3">
                            <Trophy size={80} className="text-black stroke-[2.5px]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm">Employee of the Month</h4>
                        <h2 className="text-5xl font-black text-white leading-tight">THE REVEAL</h2>
                        <div className="flex items-center justify-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest pt-4">
                            <Star size={12} />
                            <span>Celebrating Excellence at {organizationName}</span>
                            <Star size={12} />
                        </div>
                    </div>

                    {/* Winner Card - Target for capture */}
                    <div id="award-card" className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 pt-3 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 border-[10px] border-amber-500/5 mb-8 w-full flex flex-col items-center aspect-[4/5.1] sm:aspect-auto justify-between">

                        {/* Watermark Logo Background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none p-16">
                            {organizationLogo ? (
                                <img src={organizationLogo} className="w-full h-full object-contain grayscale" />
                            ) : (
                                <span className="text-[15rem] font-black">{organizationName[0]}</span>
                            )}
                        </div>

                        <div className="flex flex-col items-center relative z-10 w-full flex-grow justify-start pt-2 sm:pt-4">
                            {/* Organization Name at Top */}
                            <h4 className="text-slate-900 font-black uppercase tracking-widest text-[10px] sm:text-sm mb-2 sm:mb-8 text-center px-4 leading-tight">
                                {organizationName}
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
                                    Employee of the Month — {new Date(winner.reveal_at || winner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="w-[85%] h-px bg-slate-100 my-3 sm:my-4" />

                        {/* Simplified Logo Footer */}
                        <div className="flex flex-col items-center w-full gap-2 sm:gap-3 relative z-20">
                            <div className="flex flex-row items-center justify-center w-full gap-5 opacity-80 mix-blend-multiply">
                                {/* Organization Logo */}
                                {organizationLogo && (
                                    <img src={organizationLogo} className="h-8 w-auto max-w-[100px] object-contain rounded-lg" />
                                )}

                                {/* Separator Dot */}
                                {organizationLogo && <div className="w-1 h-1 rounded-full bg-slate-300" />}

                                {/* OrgFlow Icon */}
                                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-sm font-black text-white">O</span>
                                </div>
                            </div>

                            {/* Bottom Tip Branding */}
                            <p className="text-[9px] font-bold text-[#14d4d0] tracking-widest lowercase">orgflowhq.com</p>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-black/20"
                        >
                            <Share2 size={18} />
                            <span>Share</span>
                        </button>
                        <button
                            onClick={handleDownloadImage}
                            disabled={isCapturing}
                            className="p-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-xl shadow-black/5 flex items-center justify-center min-w-[64px]"
                        >
                            {isCapturing ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                        </button>
                    </div>

                    <div className="pt-12 pb-20 flex flex-col items-center gap-6">
                        <button
                            onClick={onClose}
                            className="px-12 py-4 bg-primary text-white font-black rounded-full shadow-2xl shadow-primary/40 hover:scale-105 transition-all active:scale-95 text-sm uppercase tracking-widest border-4 border-white/20"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
