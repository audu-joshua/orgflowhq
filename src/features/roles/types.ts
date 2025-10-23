export interface Role {
  id: string
  organization_id: string
  title: string
  department: string
  description?: string
  created_at: string
  updated_at: string
  application_count?: number
}

export interface RoleImage {
  id: string
  role_id: string
  image_url: string
  created_at: string
}
