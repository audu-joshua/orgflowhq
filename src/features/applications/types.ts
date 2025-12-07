export interface Application {
  id: string
  role_id: string
  candidate_name: string
  candidate_email: string
  status: "new" | "shortlisted" | "interviewed" | "hired"
  resume_url?: string
  cover_letter?: string | null
  passport_photo_url?: string | null
  created_at: string
  updated_at: string
}
