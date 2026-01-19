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
                    <div id="award-card" className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-slate-900 border-[10px] border-amber-500/5 mb-8 w-full flex flex-col items-center aspect-[4/5] sm:aspect-auto justify-center">

                        {/* Watermark Logo Background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none p-16">
                            {organizationLogo ? (
                                <img src={organizationLogo} className="w-full h-full object-contain grayscale" />
                            ) : (
                                <span className="text-[15rem] font-black">{organizationName[0]}</span>
                            )}
                        </div>

                        <div className="flex flex-col items-center relative z-10 w-full space-y-4 sm:space-y-6">
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

                            <div className="space-y-1 sm:space-y-2 text-center">
                                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">{winner.employee?.full_name}</h3>
                                <p className="text-amber-600 font-black uppercase tracking-[0.3em] text-[9px] sm:text-[10px]">
                                    Employee of the Month — {new Date(winner.reveal_at || winner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            <div className="w-[80%] h-px bg-slate-100" />

                            <div className="flex flex-row items-center justify-between w-full px-2 gap-4">
                                <div className="text-left">
                                    <p className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1.5 leading-none">Awarded By</p>
                                    <div className="flex items-center gap-2">
                                        {organizationLogo && <img src={organizationLogo} className="h-4 w-4 rounded-sm object-contain" />}
                                        <p className="text-[10px] sm:text-xs font-black text-slate-900 leading-none">{organizationName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1.5 leading-none">Powered By</p>
                                    <div className="flex items-center gap-1.5 justify-end">
                                        <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                                            <span className="text-[8px] font-black text-white">O</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-black tracking-tighter text-primary leading-none">OrgFlow</span>
                                    </div>
                                </div>
                            </div>
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
