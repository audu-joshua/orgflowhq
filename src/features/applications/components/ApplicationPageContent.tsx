"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"
import { ApplicationForm } from "./ApplicationForm"
import type { RoleWithImages } from "@/features/roles/services/roleService"

interface ApplicationPageContentProps {
  role: RoleWithImages
  organizationName: string
  organizationLogo?: string
  organizationId: string
}

export function ApplicationPageContent({
  role,
  organizationName,
  organizationLogo,
  organizationId
}: ApplicationPageContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  // Extract images from role data
  const images = role.role_images?.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url) || []

  const sliderRef = useRef<HTMLDivElement>(null)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `role-image-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download failed:", error)
      // Fallback: open in new tab
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Company Name */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4 shrink-0">
            {organizationLogo ? (
              <img
                src={organizationLogo}
                alt={organizationName}
                className="w-12 h-12 object-contain rounded-lg border border-border bg-white"
              />
            ) : (
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-2xl">
                  {organizationName?.[0] || 'H'}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground truncate">{organizationName || "Company"}</h2>
              <p className="text-sm text-muted-foreground truncate">Application Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Role Images Slider */}
        {images.length > 0 && (
          <div className="mb-8 bg-card rounded-lg border border-border overflow-hidden relative">
            <div className="relative h-80 md:h-[450px] bg-muted/20">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                  {/* Glassmorphic Background Effect */}
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
                    style={{ backgroundImage: `url(${img})` }}
                  />

                  {/* Main Image */}
                  <img
                    src={img}
                    alt={`Role image ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain cursor-zoom-in relative z-10"
                    onClick={() => setExpandedImage(img)}
                  />
                </div>
              ))}

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply for {role.title}</h1>
          <p className="text-muted-foreground mb-4">Submit your application below</p>

          {role.description && (
            <div className="mb-8 text-foreground/90 whitespace-pre-wrap text-sm border-l-4 border-primary pl-4 py-1 bg-muted/30">
              {role.description}
            </div>
          )}

          <ApplicationForm roleId={role.id} organizationId={organizationId} />
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => handleDownload(expandedImage)}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Download Image"
          >
            <Download size={24} />
          </button>

          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          <img
            src={expandedImage}
            alt="Expanded view"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
