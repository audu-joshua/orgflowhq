export interface Application {
  id: string
  role_id: string
  organization_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  /** @deprecated Use current_stage instead */
  status: "new" | "shortlisted" | "interviewed" | "hired" | "rejected" | string
  current_stage: "New" | "Shortlisted" | "Interview Scheduled" | "Interview Completed" | "Hired" | "Rejected" | string
  resume_url?: string
  cover_letter?: string | null
  applicant_passport?: string | null
  additional_info?: any
  metadata?: any
  source?: string
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
}
