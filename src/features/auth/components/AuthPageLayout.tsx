"use client"

import Image from "next/image"
import type React from "react"

interface AuthPageLayoutProps {
    children: React.ReactNode
    title: string
    subtitle: string
    imageMessage?: string
    imagePath?: string
    showSocialAuth?: boolean
}

export function AuthPageLayout({
    children,
    title,
    subtitle,
    imageMessage,
    imagePath = "/auth_image.webp",
    showSocialAuth = true
}: AuthPageLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Form (Scrollable) */}
            <div className="flex-1 flex flex-col p-6 lg:p-12 bg-background lg:overflow-y-auto lg:h-screen custom-scrollbar relative overflow-hidden">
                {/* Decorative Logo Watermark */}
                <div className="absolute -bottom-24 -left-24 z-0 opacity-[0.05] grayscale pointer-events-none select-none">
                    <Image
                        src="/logo.png"
                        alt="Logo Watermark"
                        width={1000}
                        height={1000}
                        className="w-[800px] h-auto object-contain"
                    />
                </div>

                <div className="w-full max-w-md m-auto relative z-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>

                    {children}

                    {showSocialAuth && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={async () => {
                                    const { getSupabaseClient } = await import("@/lib/supabaseClient")
                                    const supabase = getSupabaseClient()
                                    await supabase.auth.signInWithOAuth({
                                        provider: 'google',
                                        options: {
                                            redirectTo: `${window.location.origin}/auth/callback`,
                                            queryParams: {
                                                access_type: 'offline', // Request refresh token
                                                prompt: 'consent',
                                            },
                                        },
                                    })
                                }}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl hover:bg-muted/50 transition-colors font-medium text-sm cursor-pointer"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                                Sign in with Google
                            </button>
                        </div>
                    )}

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        &copy; {new Date().getFullYear()} OrgFlow. All Rights Reserved.
                    </p>
                </div>
            </div>

            {/* Right Panel - Image with Decorative Elements (Fixed) */}
            <div className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen flex-1 relative bg-gradient-to-br from-primary/90 to-primary overflow-hidden">
                {/* Custom Scrollbar Styles */}
                <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: hsl(var(--muted));
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: hsl(var(--primary) / 0.5);
            border-radius: 4px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--primary) / 0.7);
          }
          
          /* Firefox */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: hsl(var(--primary) / 0.5) hsl(var(--muted));
          }
        `}</style>

                {/* Wavy Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" opacity="0.1" />
                                <path d="M0,60 Q25,40 50,60 T100,60 L100,100 L0,100 Z" fill="currentColor" opacity="0.1" />
                                <path d="M0,70 Q25,50 50,70 T100,70 L100,100 L0,100 Z" fill="currentColor" opacity="0.1" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#wave)" />
                    </svg>
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    {/* Message Card - Only show if imageMessage is provided */}
                    {imageMessage && (
                        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 mb-8 max-w-md">
                            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                                {imageMessage}
                            </h2>
                        </div>
                    )}

                    {/* Image Container with Decorative Frame */}
                    <div className="relative">
                        {/* Decorative Badge - Top Right */}
                        <div className="absolute -top-8 -right-8 bg-background rounded-full p-4 shadow-lg z-20">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-2xl">💼</span>
                            </div>
                        </div>

                        {/* Decorative Badge - Bottom Left */}
                        <div className="absolute -bottom-8 -left-8 bg-background rounded-full p-4 shadow-lg z-20">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-2xl">✨</span>
                            </div>
                        </div>

                        {/* Main Image Frame */}
                        <div className="bg-primary-foreground/20 backdrop-blur-md rounded-3xl p-2 shadow-2xl">
                            <div className="relative w-80 h-96 rounded-2xl overflow-hidden">
                                <Image
                                    src={imagePath}
                                    alt="Authentication"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}
