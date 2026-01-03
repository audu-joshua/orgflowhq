import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { ToastProvider } from "@/components/shared/ToastProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OrgFlow | Complete Workforce Management Solution",
  description: "Empower your team with OrgFlow. Manage payroll, time tracking, recruitment, and employee relations in one professional platform.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "OrgFlow | Complete Workforce Management Solution",
    description: "Modern HR and workforce management platform. Manage your team anywhere.",
    url: "https://www.orgflowhq.com",
    siteName: "OrgFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OrgFlow Workforce Management",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrgFlow | Workforce Management",
    description: "Complete HR and team management solution.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
