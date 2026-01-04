import { getSupabaseClient } from "@/lib/supabaseClient"
import { slugify } from "@/lib/utils"

export const authService = {
  async signUp(email: string, password: string, organizationName: string, fullName?: string) {
    const supabase = getSupabaseClient()

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName || "Owner"
          }
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Failed to create user")

      return { user: authData.user }
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  },

  async signIn(email: string, password: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const supabase = getSupabaseClient()

    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session?.user ?? null
    } catch (error) {
      // Session missing is expected when not logged in
      return null
    }
  },

  async getUserProfile(userId: string) {
    const supabase = getSupabaseClient()
    console.log(`[getUserProfile] Fetching for userId: ${userId}`)

    // 1. Check for privileged role in specific organization (Source of Truth for Admin/Owner/etc)
    const { data: roleLink, error: roleError } = await supabase
      .from("users_organizations")
      .select("role, organization_id, organizations(id, slug, name, logo_url)")
      .eq("user_id", userId)
      .maybeSingle()

    if (roleError) console.error("[getUserProfile] Role lookup error:", roleError)

    if (roleLink) {
      console.log(`[getUserProfile] Found privileged role: ${roleLink.role} for org: ${roleLink.organization_id}`)
      if (!roleLink.organizations) {
        console.warn("[getUserProfile] Role found but organization details blocked by RLS or missing.")
      }

      // It's a privileged user
      const { data: userDetails } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      // Also try to get employee details for name/image (Managers/HR/etc start as employees)
      const { data: employeeDetails } = await supabase
        .from("employees")
        .select("full_name, profile_image_url, status")
        .eq("user_id", userId)
        .maybeSingle()

      return {
        ...userDetails, //id, email, etc
        // Enforce organization from the link, not the user record
        organization_id: roleLink.organization_id,
        role: roleLink.role,
        full_name: employeeDetails?.full_name,
        profile_image_url: employeeDetails?.profile_image_url,
        status: employeeDetails?.status,
        organizations: roleLink.organizations,
        is_employee_only: false
      }
    }

    console.log("[getUserProfile] No privileged role found. Checking employees table...")

    // 2. If not privileged, check employees table (Clock-only users)
    const { data: employeeData, error: empError } = await supabase
      .from("employees")
      .select("*, organizations(*)")
      .eq("user_id", userId)
      .maybeSingle()

    if (empError) console.error("[getUserProfile] Employee lookup error:", empError)

    if (employeeData) {
      console.log(`[getUserProfile] Found employee record for org: ${employeeData.organization_id}`)
      return {
        id: employeeData.user_id, // Map correctly
        email: employeeData.email,
        organization_id: employeeData.organization_id,
        created_at: employeeData.created_at,
        role: "employee", // Explicitly set for frontend logic
        full_name: employeeData.full_name,
        profile_image_url: employeeData.profile_image_url,
        status: employeeData.status,
        is_employee_only: true, // Flag for redirection
        organizations: employeeData.organizations
      }
    }

    // 3. Fallback: User exists in Auth but has no roles/links (Zombie account)
    console.warn(`[getUserProfile] Zombie account detected for ${userId}. No links found.`)
    const { data: basicUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (basicUser) {
      return {
        ...basicUser,
        role: null,
        organizations: null
      }
    }

    return null
  },

  async setupEmployeeAccount(email: string, employeeId: string) {
    const supabase = getSupabaseClient()
    console.log(`[setupEmployeeAccount] Starting for email: ${email}, ID: ${employeeId}`)

    // 1. Verify employee exists and has no user_id
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .eq("employee_id", employeeId)
      .maybeSingle()

    if (empError) {
      console.error("[setupEmployeeAccount] Employee lookup error:", empError)
      throw empError
    }

    if (!employee) {
      console.warn("[setupEmployeeAccount] No matching employee found for:", { email, employeeId })
      throw new Error("No employee record matches these credentials.")
    }

    if (employee.user_id) {
      console.log("[setupEmployeeAccount] Employee already has user_id:", employee.user_id)
      throw new Error("Account already exists. Try logging in normally.")
    }

    console.log("[setupEmployeeAccount] Creating auth user...")
    // 2. Register the user with their employee ID as password
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: employeeId,
      options: {
        data: {
          full_name: employee.full_name
        }
      }
    })

    if (signUpError) {
      console.error("[setupEmployeeAccount] Auth signUp error:", signUpError.message)
      throw signUpError
    }

    if (!authData.user) {
      console.error("[setupEmployeeAccount] Auth signUp succeeded but no user returned")
      throw new Error("Signup failed.")
    }

    console.log("[setupEmployeeAccount] Auth user created successfully. ID:", authData.user.id)

    // 3. Link the employee record to the new user_id
    const { error: linkError } = await supabase
      .from("employees")
      .update({ user_id: authData.user.id })
      .eq("id", employee.id)

    if (linkError) {
      console.error("[setupEmployeeAccount] Failed to link employee record to user_id:", linkError)
      throw linkError
    }

    console.log("[setupEmployeeAccount] Link successful.")
    return authData.user
  }
}
