"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, X } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { roleService } from "../services/roleService"
import { departmentService } from "@/features/departments/services/departmentService"
import { compressImages } from "@/lib/imageUtils"
import { CustomSelect } from "@/components/ui/CustomSelect"
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
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

    if (images.length + files.length > 6) {
      setError("Maximum 6 images allowed")
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newImages = [...images]
    const newPreviews = [...imagePreviews]

    // Remove dragged items
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    const [draggedPreview] = newPreviews.splice(draggedIndex, 1)

    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage)
    newPreviews.splice(dropIndex, 0, draggedPreview)

    setImages(newImages)
    setImagePreviews(newPreviews)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
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

  const departmentOptions = departments.map(dept => ({
    value: dept.name,
    label: dept.name
  }))

  const employmentTypeOptions = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "temporary", label: "Temporary" }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Four Fields in Flex Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <CustomSelect
            id="department"
            value={department}
            onChange={setDepartment}
            options={departmentOptions}
            placeholder="Select a department"
            required
          />
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
          <CustomSelect
            id="employmentType"
            value={employmentType}
            onChange={setEmploymentType}
            options={employmentTypeOptions}
            placeholder="Select employment type"
            required
          />
        </div>
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
          Role Images (up to 6)
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
          <>
            <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {imagePreviews.map((preview, index) => (
                <div
                  key={`preview-${index}`}
                  className={`relative group ${draggedIndex === index ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="bg-muted rounded-lg overflow-hidden aspect-square relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover cursor-move hover:opacity-90 transition-opacity"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium">
                        Cover
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1.5 hover:bg-destructive/90 shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Drag and drop to reorder images. The first image will be used as the cover image when sharing this role.
            </p>
          </>
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
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium cursor-pointer"
        >
          {loading ? "Creating..." : "Create Role"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
