export interface Role {
  id: string
  organization_id: string
  title: string
  description: string | null
  department: string | null
  location: string | null
  employment_type: string | null
  slug: string
  status: 'active' | 'closed' | 'draft'
  stages: string[]
  hiring_manager?: string
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
