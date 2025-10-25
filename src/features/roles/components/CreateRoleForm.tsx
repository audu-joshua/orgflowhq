"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { roleService } from "../services/roleService"

export function CreateRoleForm() {
  const router = useRouter()
  const { organization } = useAppStore()
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [employmentType, setEmploymentType] = useState("full-time")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    console.log("Files selected:", files.length)
    
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }
    
    setError("")
    
    // Use FileReader to create previews
    const newPreviews: string[] = []
    
    for (const file of files) {
      console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error("Not an image file:", file.name)
        setError(`${file.name} is not a valid image file`)
        continue
      }
      
      const reader = new FileReader()
      
      const preview = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          const result = event.target?.result as string
          console.log("Preview created for:", file.name, "Length:", result.length)
          resolve(result)
        }
        reader.onerror = () => {
          console.error("Failed to read file:", file.name)
          reject(new Error(`Failed to read ${file.name}`))
        }
        reader.readAsDataURL(file)
      })
      
      newPreviews.push(preview)
    }
    
    setImages([...images, ...files])
    setImagePreviews([...imagePreviews, ...newPreviews])
    
    console.log("Total images:", images.length + files.length)
    console.log("Total previews:", imagePreviews.length + newPreviews.length)
  }

  const removeImage = (index: number) => {
    console.log("Removing image at index:", index)
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!organization) {
      setError("Organization not found")
      return
    }

    console.log("=== Starting Role Creation ===")
    console.log("Organization ID:", organization.id)
    console.log("Number of images:", images.length)

    setLoading(true)

    try {
      // Create role - Note: application_count is computed, not stored
      console.log("Creating role with data:", {
        title,
        department,
        description,
        location: location || null,
        employment_type: employmentType,
        status: "active",
      })
      
      const role = await roleService.createRole(organization.id, {
        title,
        department,
        description: description || null,
        location: location || null,
        employment_type: employmentType,
        status: "active",
        organization_id: organization.id,
        created_by: null,
      })
      console.log("✅ Role created:", role.id)

      // Upload images
      if (images.length > 0) {
        console.log(`Uploading ${images.length} images...`)
        
        for (let i = 0; i < images.length; i++) {
          console.log(`Uploading image ${i + 1}/${images.length}:`, images[i].name)
          try {
            const result = await roleService.uploadRoleImage(role.id, images[i], i)
            console.log(`✅ Image ${i + 1} uploaded:`, result)
          } catch (imgError) {
            console.error(`❌ Failed to upload image ${i + 1}:`, imgError)
            // Continue with other images
          }
        }
      }

      console.log("Redirecting to role page...")
      router.push(`/dashboard/roles/${role.id}`)
    } catch (err) {
      console.error("❌ Failed to create role:", err)
      setError(err instanceof Error ? err.message : "Failed to create role")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Role Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Senior Developer"
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department *
        </label>
        <input
          id="department"
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Engineering"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Remote, New York, Hybrid"
        />
      </div>

      <div>
        <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
          Employment Type *
        </label>
        <select
          id="employmentType"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="temporary">Temporary</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Job description and requirements..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Role Images (up to 5)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto mb-2 text-gray-400" size={24} />
          <p className="text-sm text-gray-600 mb-2">Click to select images</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium"
          >
            Select images
          </label>
        </div>

        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log(`✅ Image ${index + 1} displayed`)}
                    onError={(e) => console.error(`❌ Image ${index + 1} failed to display`)}
                  />
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {images[index]?.name}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? "Creating..." : "Create Role"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}