export interface Application {
  id: string
  role_id: string
  organization_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  status: "new" | "shortlisted" | "interviewed" | "hired"
  resume_url?: string
  cover_letter?: string | null
  applicant_passport?: string | null
  additional_info?: any
  source?: string
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
}
