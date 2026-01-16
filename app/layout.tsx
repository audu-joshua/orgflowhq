import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { AuthProvider } from "@/providers/AuthProvider"
import { ToastProvider } from "@/components/shared/ToastProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OrgFlow | HR & Recruitment Software",
  description: "Manage hiring, payroll, timesheets, and your team, all in one platform with OrgFlow.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "OrgFlow | HR & Recruitment Software",
    description: "Manage hiring, payroll, timesheets, and your team; all in one platform with OrgFlow.",
    url: "https://www.orgflowhq.com",
    siteName: "OrgFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OrgFlow HR & Recruitment Software",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrgFlow | HR & Recruitment Software",
    description: "Manage hiring, payroll, timesheets, and your team; all in one platform.",
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
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
