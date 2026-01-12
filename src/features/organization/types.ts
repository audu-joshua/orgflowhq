export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  address?: string | null
  welcome_doc_url?: string | null
  created_at?: string
  updated_at?: string
}
