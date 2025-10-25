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
  const [resume, setResume] = useState<File | null>(null)
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

      await applicationService.createApplication(organization.id, {
        role_id: roleId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        resume_url: resumeUrl,
        status: "new",
      })

      setSuccess(true)
      setCandidateName("")
      setCandidateEmail("")
      setResume(null)

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
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={candidateEmail}
          onChange={(e) => setCandidateEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Resume (Optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto mb-2 text-gray-400" size={24} />
          <p className="text-sm text-gray-600 mb-2">Upload your resume (PDF, DOC, DOCX)</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium"
          >
            Select file
          </label>
          {resume && <p className="text-sm text-green-600 mt-2">✓ {resume.name}</p>}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  )
}
