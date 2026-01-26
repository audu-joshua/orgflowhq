export interface Department {
  id: string
  _id: string
  organization_id: string
  organizationId?: string
  name: string
  description: string | null
  created_at: string
  createdAt: string
  updated_at: string
  updatedAt: string
}

export interface Employee {
  id: string
  _id: string
  organization_id: string
  organizationId?: string
  user_id: string | null
  userId?: string | null
  department_id: string
  departmentId?: string
  full_name?: string
  fullName: string
  email: string
  employee_id: string | null
  employeeId: string | null
  position: string | null
  phone: string | null
  hire_date: string | null
  hireDate: string | null
  profile_image_url: string | null
  profileImageUrl: string | null
  status: 'active' | 'inactive' | 'invited' | 'terminated'
  activated_at: string | null
  activatedAt?: string | null
  system_role?: string | null
  systemRole?: string | null
  created_at: string
  createdAt: string
  updated_at: string
  updatedAt: string
}
