export interface User {
  id: string
  email: string
  fullName?: string | null
  profileImageUrl?: string | null
  role?: string
  organizationId?: string
  status?: string
  createdAt?: string
  memberships?: any[]
}
