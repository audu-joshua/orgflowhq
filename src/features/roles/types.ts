export interface Role {
  id: string
  organization_id: string
  title: string
  description: string | null
  department: string | null
  location: string | null  // ← Add this
  employment_type: string | null  // ← Add this
  status: 'active' | 'closed' | 'draft'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RoleImage {
  id: string
  role_id: string
  image_url: string
  created_at: string
}
