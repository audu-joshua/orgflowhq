export interface User {
  id: string
  email: string
  organization_id?: string
  created_at?: string
  createdAt?: string // MongoDB compat
  role?: string | null
  full_name?: string
  profile_image_url?: string
  status?: string
  memberships?: any[]
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  organization: any | null
  signUp: (email: string, password: string, organizationName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
