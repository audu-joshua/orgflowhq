"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { roleService } from "../services/roleService"
import { departmentService } from "@/features/departments/services/departmentService"
import { compressImages } from "@/lib/imageUtils"
import type { Department } from "@/features/departments/types"

export function CreateRoleForm() {
  const router = useRouter()
  const { organization } = useAppStore()
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [employmentType, setEmploymentType] = useState("full-time")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (organization) {
      departmentService.getDepartmentsByOrganization(organization.id)
        .then(setDepartments)
        .catch(err => console.error("Failed to load departments:", err))
    }
  }, [organization])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }

    setError("")
    setCompressing(true)

    try {
      // Compress all images in parallel
      const compressedFiles = await compressImages(files)
      setImages([...images, ...compressedFiles])

      // Generate previews for the compressed images
      const newPreviews: string[] = await Promise.all(
        compressedFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(file)
          })
        })
      )

      setImagePreviews([...imagePreviews, ...newPreviews])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process images")
    } finally {
      setCompressing(false)
    }
  }

  const removeImage = (index: number) => {
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

    setLoading(true)

    try {
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

      // Upload all images in parallel for speed
      if (images.length > 0) {
        await Promise.all(
          images.map((image, i) => 
            roleService.uploadRoleImage(role.id, image, i)
          )
        )
      }

      router.push(`/dashboard/roles/${role.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          Role Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          placeholder="e.g., Senior Developer"
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">
          Department *
        </label>
        <select
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a department</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          placeholder="e.g., Remote, New York, Hybrid"
        />
      </div>

      <div>
        <label htmlFor="employmentType" className="block text-sm font-medium text-foreground mb-1">
          Employment Type *
        </label>
        <select
          id="employmentType"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="temporary">Temporary</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          placeholder="Job description and requirements..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Role Images (up to 5)
          {compressing && <span className="text-xs text-muted-foreground ml-2">Compressing...</span>}
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
          <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
          <p className="text-sm text-muted-foreground mb-2">Click to select images (will be compressed)</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={compressing}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-block text-primary hover:text-primary/80 cursor-pointer text-sm font-medium ${compressing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Select images
          </label>
        </div>

        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative">
                <div className="bg-muted rounded-lg overflow-hidden aspect-square">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {images[index]?.name}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
        >
          {loading ? "Creating..." : "Create Role"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
