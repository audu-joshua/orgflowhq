"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Share2, Download, Mail, ExternalLink, FileText, Loader2 } from "lucide-react"
import { toast } from "@/lib/toast"

interface DocumentViewerModalProps {
    url: string | null
    title: string
    isOpen: boolean
    onClose: () => void
    applicantEmail?: string
}

export function DocumentViewerModal({ url, title, isOpen, onClose, applicantEmail }: DocumentViewerModalProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0
        }
    }, [isOpen, url])

    if (!isOpen || !url) return null

    // Improved detection to handle Cloudinary URLs which might not end exactly in .extension
    const isImage = /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url) || url.includes('image/upload')
    const isPdf = /\.pdf(\?.*)?$/i.test(url) || url.includes('/pdf/')
    const isDoc = /\.(doc|docx|rtf)(\?.*)?$/i.test(url) || url.includes('/raw/')

    // Check if URL is publicly accessible (to avoid "File not found" for localhost)
    const isPublicUrl = !url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('::1')

    // Google Docs Viewer for PDFs (more reliable for public storage)
    // Office apps viewer for .doc/.docx
    // For localhost, we MUST use direct links or native iframes
    let viewerUrl = url
    if (isPdf && isPublicUrl) {
        viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
    } else if (isDoc && isPublicUrl) {
        viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Document link copied", {
                description: "The link is now in your clipboard.",
            })
        } catch (err) {
            console.error("Error sharing:", err)
            toast.error("Failed to copy link")
        }
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = url
        link.download = title
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleMail = () => {
        const subject = encodeURIComponent(`Document: ${title}`)
        const body = encodeURIComponent(`You can view the document here: ${url}`)
        window.location.href = `mailto:${applicantEmail || ""}?subject=${subject}&body=${body}`
    }

    return (
        <AnimatePresence>
            {isOpen && url && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] bg-background/98 backdrop-blur-xl flex flex-col p-1 md:p-2"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* Top Navbar - Slimmer */}
                        <div className="flex items-center justify-between mb-1 bg-card/80 p-2 md:p-3 rounded-xl border border-border shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-foreground font-bold truncate max-w-[150px] md:max-w-md">{title}</h2>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.open(url, "_blank")}
                                    className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all order-1"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={18} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all order-2"
                                    title="Copy document link"
                                >
                                    <Share2 size={18} />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all order-3"
                                    title="Download document"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={handleMail}
                                    className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all order-4"
                                    title="Email document link"
                                >
                                    <Mail size={18} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-full hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-all order-5 ml-2"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative bg-muted/10 rounded-2xl border border-border shadow-inner">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20">
                                    <Loader2 size={40} className="text-primary animate-spin" />
                                </div>
                            )}

                            {error && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                    <X size={48} className="mb-4 text-destructive" />
                                    <p className="text-lg font-medium">Failed to load document in-app.</p>
                                    <button
                                        onClick={() => window.open(url, "_blank")}
                                        className="mt-4 flex items-center gap-2 px-6 py-3 bg-primary rounded-xl text-primary-foreground font-bold hover:bg-primary/90 transition-all"
                                    >
                                        Open in New Tab <ExternalLink size={16} />
                                    </button>
                                </div>
                            )}
                            <div
                                ref={scrollContainerRef}
                                className="w-full h-full overflow-auto custom-scrollbar flex items-center justify-center p-0 md:p-2"
                            >
                                {isImage ? (
                                    <motion.img
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        src={url}
                                        alt={title}
                                        className="max-w-full h-auto rounded-lg shadow-2xl border-2 border-border"
                                        onLoad={() => setLoading(false)}
                                        onError={() => { setLoading(false); setError(true); }}
                                    />
                                ) : isPdf || (isDoc && isPublicUrl) ? (
                                    <iframe
                                        src={viewerUrl}
                                        className="w-full h-full border-none rounded-lg bg-white dark:bg-slate-900"
                                        onLoad={() => setLoading(false)}
                                        onError={() => { setLoading(false); setError(true); }}
                                    />
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground bg-card/30 rounded-2xl border-2 border-dashed border-border max-w-md mx-auto">
                                        <FileText size={48} className="mx-auto mb-4 text-primary/40" />
                                        <h3 className="text-lg font-bold text-foreground mb-2">Preview Not Available</h3>
                                        <p className="text-sm mb-6">
                                            {isDoc && !isPublicUrl
                                                ? "Word documents on a local server (localhost) cannot be previewed in-app. Please download the file to view it."
                                                : "This file type or location doesn't support in-app preview."}
                                        </p>
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary rounded-xl text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Download size={18} /> Download to View
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom info - Slimmer */}
                        <div className="mt-2 flex items-center justify-center gap-4 text-muted-foreground/40 text-[9px] uppercase tracking-[0.2em] font-bold">
                            <span>Scroll to Review</span>
                            <div className="w-6 h-[1px] bg-border"></div>
                            <span>Secure Cloud Viewer</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
