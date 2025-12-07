import { getSupabaseClient } from "@/lib/supabaseClient"
import type { Department, Employee } from "../types"

export const departmentService = {
  async createDepartment(organizationId: string, departmentData: Omit<Department, "id" | "organization_id" | "created_at" | "updated_at">) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("departments")
      .insert([{ ...departmentData, organization_id: organizationId }])
      .select()
      .single()

    if (error) throw error
    return data as Department
  },

  async updateDepartment(departmentId: string, departmentData: Partial<Department>) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("departments")
      .update(departmentData)
      .eq("id", departmentId)
      .select()
      .single()

    if (error) throw error
    return data as Department
  },

  async deleteDepartment(departmentId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", departmentId)

    if (error) throw error
  },

  async getDepartmentById(departmentId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("departments")
      .select("*, employees(count)")
      .eq("id", departmentId)
      .single()

    if (error) throw error
    return data
  },

  async getDepartmentsByOrganization(organizationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("departments")
      .select("*, employees(count)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Employee management
  async createEmployee(organizationId: string, employeeData: Omit<Employee, "id" | "organization_id" | "created_at" | "updated_at">) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("employees")
      .insert([{ ...employeeData, organization_id: organizationId }])
      .select()
      .single()

    if (error) throw error
    return data as Employee
  },

  async getEmployeesByDepartment(departmentId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("department_id", departmentId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getEmployeesByOrganization(organizationId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async deleteEmployee(employeeId: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId)

    if (error) throw error
  },
}

