export interface User {
  id: string
  email: string
  organization_id: string
  created_at: string
  role?: string
  full_name?: string
  profile_image_url?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  organization: any | null
  signUp: (email: string, password: string, organizationName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
