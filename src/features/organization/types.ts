export interface Organization {
  id: string
  _id: string
  name: string
  slug: string
  logoUrl?: string | null
  address?: string | null
  welcomeDocUrl?: string | null
  website?: string | null
  description?: string | null
  contactEmail?: string | null
  createdAt?: string
  updatedAt?: string
}
