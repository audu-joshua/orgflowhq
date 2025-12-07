"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { ApplicationForm } from "./ApplicationForm"

interface ApplicationPageContentProps {
  roleId: string
}

export function ApplicationPageContent({ roleId }: ApplicationPageContentProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [roleTitle, setRoleTitle] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch role details
    const fetchRoleDetails = async () => {
      try {
        const { roleService } = await import("@/features/roles/services/roleService")
        const role = await roleService.getRoleById(roleId)
        setRoleTitle(role.title)
        
        // Fetch organization name
        const { getSupabaseClient } = await import("@/lib/supabaseClient")
        const supabase = getSupabaseClient()
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", role.organization_id)
          .single()
        
        if (orgData) setOrganizationName(orgData.name)
        
        // Fetch role images
        const { data: imageData } = await supabase
          .from("role_images")
          .select("image_url")
          .eq("role_id", roleId)
          .order("display_order")
        
        if (imageData) {
          setImages(imageData.map(img => img.image_url))
        }
      } catch (error) {
        console.error("Failed to load role details:", error)
      }
    }

    fetchRoleDetails()
  }, [roleId])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Company Name */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-2xl">H</span>
          </div>
          <div className="text-right min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{organizationName || "Company"}</h2>
            <p className="text-sm text-muted-foreground truncate">Application Portal</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Role Images Slider */}
        {images.length > 0 && (
          <div className="mb-8 bg-card rounded-lg border border-border overflow-hidden relative">
            <div className="relative h-96 md:h-[500px] lg:h-[600px] bg-muted">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Role image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply for {roleTitle}</h1>
          <p className="text-muted-foreground mb-8">Submit your application below</p>
          <ApplicationForm roleId={roleId} />
        </div>
      </div>
    </div>
  )
}

