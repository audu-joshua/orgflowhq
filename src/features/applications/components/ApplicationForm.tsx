"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Phone, User, Mail, FileText, Camera } from "lucide-react"
import { submitApplicationAction } from "../actions"
import { uploadFileAction } from "../uploadActions"
import { compressImage } from "@/lib/imageUtils"
import type { Application } from "../types"

interface ApplicationFormProps {
  roleId: string
  organizationId: string
}

export function ApplicationForm({ roleId, organizationId }: ApplicationFormProps) {
  const router = useRouter()
  const [applicantName, setApplicantName] = useState("")
  const [applicantEmail, setApplicantEmail] = useState("")
  const [applicantPhone, setApplicantPhone] = useState("")
  const [coverLetter, setCoverLetter] = useState<File | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Redirect on success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("Resume must be less than 1MB")
        return
      }
      setResume(file)
      setError("")
    }
  }

  const handleCoverLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError("Cover letter must be less than 1MB")
        return
      }
      setCoverLetter(file)
      setError("")
    }
  }

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Passport photo must be less than 5MB")
        return
      }

      setCompressing(true)
      try {
        const compressedFile = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          format: 'jpeg'
        })
        setPassportPhoto(compressedFile)
        setError("")
      } catch (err) {
        console.error("Compression error:", err)
        setError("Failed to process image")
      } finally {
        setCompressing(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!resume) {
      setError("Please upload your resume")
      return
    }

    if (!coverLetter) {
      setError("Please upload your cover letter")
      return
    }

    if (!passportPhoto) {
      setError("Please upload your passport photo")
      return
    }

    setLoading(true)
    const setStatus = (msg: string) => setError(msg); // Use error state area for status or a new state

    try {
      // 1. Upload Resume
      setError("Uploading resume...")
      const resumeFd = new FormData();
      resumeFd.append("file", resume);
      resumeFd.append("folder", "resumes");
      const resumeRes: any = await uploadFileAction(resumeFd);
      if (!resumeRes.success) throw new Error(resumeRes.error || "Resume upload failed");
      const resumeUrl = resumeRes.url;

      // 2. Upload Cover Letter
      setError("Uploading cover letter...")
      const clFd = new FormData();
      clFd.append("file", coverLetter);
      clFd.append("folder", "cover-letters");
      const clRes: any = await uploadFileAction(clFd);
      if (!clRes.success) throw new Error(clRes.error || "Cover letter upload failed");
      const coverLetterUrl = clRes.url;

      // 3. Upload Passport
      setError("Uploading passport photo...")
      const pFd = new FormData();
      pFd.append("file", passportPhoto!);
      pFd.append("folder", "passports");
      const pRes: any = await uploadFileAction(pFd);
      if (!pRes.success) throw new Error(pRes.error || "Photo upload failed");
      const passportUrl = pRes.url;

      setError("Submitting application...")
      const applicationData = {
        role_id: roleId,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        resume_url: resumeUrl,
        cover_letter: coverLetterUrl || null,
        applicant_passport: passportUrl || null,
      }

      const result = await submitApplicationAction(organizationId, applicationData)

      if (!result.success) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setApplicantName("")
      setApplicantEmail("")
      setApplicantPhone("")
      setCoverLetter(null)
      setResume(null)
      setPassportPhoto(null)
    } catch (err: any) {
      console.error("Submission error:", err)
      setError(err.message || "Failed to submit application")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative overflow-hidden bg-muted/30 rounded-lg border border-border animate-in fade-in zoom-in duration-300">
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="text-primary" size={32} />
          </div>
          <div className="text-foreground text-2xl font-bold mb-2">Application Received!</div>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Thank you for applying. Your application has been submitted successfully and the team will review it soon.
          </p>
          <p className="text-xs text-muted-foreground mt-4 animate-pulse">Redirecting to home...</p>
        </div>
        {/* Depleting progress bar at the bottom */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-[3000ms] ease-linear"
            style={{
              width: "100%",
              animation: "deplete 3s linear forwards"
            }}
          />
        </div>
        <style jsx>{`
          @keyframes deplete {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            <span className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" />
              Full Name *
            </span>
          </label>
          <input
            id="name"
            type="text"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            <span className="flex items-center gap-2">
              <Mail size={14} className="text-muted-foreground" />
              Email *
            </span>
          </label>
          <input
            id="email"
            type="email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-muted-foreground" />
              Phone Number *
            </span>
          </label>
          <input
            id="phone"
            type="tel"
            value={applicantPhone}
            onChange={(e) => setApplicantPhone(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground transition-all"
            placeholder="+1 234 567 890"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <Camera size={14} className="text-muted-foreground" />
              Passport Photo *
            </span>
          </label>
          <div className="group relative border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer h-[160px] flex flex-col items-center justify-center">
            {compressing ? (
              <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePassportUpload}
                  className="hidden"
                  id="passport-upload"
                />
                <Camera className="mb-2 text-muted-foreground group-hover:text-primary transition-colors" size={24} />
                <label
                  htmlFor="passport-upload"
                  className="text-xs font-medium text-foreground mb-1 truncate px-2 w-full cursor-pointer"
                >
                  {passportPhoto ? passportPhoto.name : "Upload Photo"}
                </label>
                <p className="text-[10px] text-muted-foreground">JPG, PNG (Max 1MB)</p>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <span className="flex items-center gap-2">
              <FileText size={14} className="text-muted-foreground" />
              Cover Letter *
            </span>
          </label>
          <div className="group relative border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer h-[160px] flex flex-col items-center justify-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleCoverLetterUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="cover-letter-upload"
              required
            />
            <Upload className="mb-2 text-muted-foreground group-hover:text-primary transition-colors" size={24} />
            <p className="text-xs font-medium text-foreground mb-1 truncate px-2 w-full">
              {coverLetter ? coverLetter.name : "Upload Cover Letter"}
            </p>
            <p className="text-[10px] text-muted-foreground">PDF, DOC, DOCX, or Image (Max 1MB)</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <span className="flex items-center gap-2">
            <Upload size={14} className="text-muted-foreground" />
            Resume *
          </span>
        </label>
        <div className="group relative border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            id="resume-upload"
            required
          />
          <Upload className="mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" size={28} />
          <p className="text-sm font-medium text-foreground mb-1">
            {resume ? resume.name : "Click to upload resume"}
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (Max 1MB)</p>
          {resume && (
            <div className="mt-2 text-xs text-green-600 font-semibold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              File selected
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all font-bold text-lg shadow-lg hover:shadow-primary/20 active:scale-[0.99] flex items-center justify-center"
      >
        {loading ? (
          <span className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : "Submit Application"}
      </button>
    </form>
  )
}
