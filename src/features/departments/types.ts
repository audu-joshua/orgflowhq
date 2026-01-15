export interface Department {
  id: string
  organization_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  organization_id: string
  user_id: string | null
  department_id: string
  full_name?: string
  email?: string
  employee_id: string | null
  position: string | null
  phone: string | null
  hire_date: string | null
  profile_image_url: string | null
  status: 'active' | 'inactive' | 'invited'
  activated_at: string | null
  system_role?: string | null
  created_at: string
  updated_at: string
}
