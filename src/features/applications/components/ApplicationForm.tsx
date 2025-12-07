"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { applicationService } from "../services/applicationService"

interface ApplicationFormProps {
  roleId: string
}

export function ApplicationForm({ roleId }: ApplicationFormProps) {
  const router = useRouter()
  const { organization } = useAppStore()
  const [candidateName, setCandidateName] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setResume(file)
      setError("")
    }
  }

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Passport photo must be less than 2MB")
        return
      }
      setPassportPhoto(file)
      setError("")
    }
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
      let resumeUrl: string | undefined

      if (resume) {
        resumeUrl = await applicationService.uploadResume("temp", resume)
      }

      let passportPhotoUrl: string | undefined
      if (passportPhoto) {
        passportPhotoUrl = await applicationService.uploadResume("temp", passportPhoto)
      }

      await applicationService.createApplication(organization.id, {
        role_id: roleId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        resume_url: resumeUrl,
        cover_letter: coverLetter || null,
        passport_photo_url: passportPhotoUrl,
        status: "new",
      })

      setSuccess(true)
      setCandidateName("")
      setCandidateEmail("")
      setCoverLetter("")
      setResume(null)
      setPassportPhoto(null)

      setTimeout(() => {
        router.push("/dashboard/applications")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-lg font-semibold mb-2">Application submitted successfully!</div>
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={candidateEmail}
          onChange={(e) => setCandidateEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="coverLetter" className="block text-sm font-medium text-foreground mb-1">
          Cover Letter
        </label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground resize-none"
          placeholder="Tell us why you're interested in this position..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Passport Photo</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
          <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
          <p className="text-sm text-muted-foreground mb-2">Upload your passport photo (JPG, PNG - Max 2MB)</p>
          <input
            type="file"
            accept="image/*"
            onChange={handlePassportUpload}
            className="hidden"
            id="passport-upload"
          />
          <label
            htmlFor="passport-upload"
            className="text-primary hover:text-primary/80 cursor-pointer text-sm font-medium"
          >
            Select photo
          </label>
          {passportPhoto && <p className="text-sm text-green-600 mt-2">✓ {passportPhoto.name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Resume (Optional)</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
          <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
          <p className="text-sm text-muted-foreground mb-2">Upload your resume (PDF, DOC, DOCX)</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="text-primary hover:text-primary/80 cursor-pointer text-sm font-medium"
          >
            Select file
          </label>
          {resume && <p className="text-sm text-green-600 mt-2">✓ {resume.name}</p>}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  )
}
