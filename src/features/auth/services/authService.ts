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

      // 2. Generate unique slug for organization
      let slug = slugify(organizationName)
      const { data: existingOrgs } = await supabase
        .from("organizations")
        .select("slug")
        .ilike("slug", `${slug}%`)

      if (existingOrgs && existingOrgs.length > 0) {
        const slugs = existingOrgs.map((o: { slug: string }) => o.slug)
        if (slugs.includes(slug)) {
          let counter = 1
          while (slugs.includes(`${slug}-${counter}`)) {
            counter++
          }
          slug = `${slug}-${counter}`
        }
      }

      // 3. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{
          name: organizationName,
          slug: slug
        }])
        .select()
        .single()

      if (orgError) throw orgError

      // 4. Create default "Management" department
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .insert([{
          organization_id: orgData.id,
          name: "Management",
          description: "Executive and Administrative management team"
        }])
        .select()
        .single()

      if (deptError) throw deptError

      // 5. Create user profile
      const { error: userError } = await supabase
        .from("users")
        .insert([{
          id: authData.user.id,
          email,
          organization_id: orgData.id
        }])

      if (userError) throw userError

      // 6. Link user to organization as owner
      const { error: linkError } = await supabase
        .from("users_organizations")
        .insert([{
          user_id: authData.user.id,
          organization_id: orgData.id,
          role: "owner"
        }])

      if (linkError) throw linkError

      // 7. Create employee record for the owner (Senior developer approach)
      // This ensures the owner can immediately use the clock portal if needed
      const { error: empError } = await supabase
        .from("employees")
        .insert([{
          organization_id: orgData.id,
          user_id: authData.user.id,
          department_id: deptData.id,
          full_name: fullName || "Owner",
          email: email,
          employee_id: "OWN-001",
          position: "Owner",
          status: "active",
          hire_date: new Date().toISOString().split('T')[0]
        }])

      if (empError) throw empError

      return { user: authData.user, organization: orgData }
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

    // 1. Check for privileged role in specific organization (Source of Truth for Admin/Owner/etc)
    const { data: roleLink } = await supabase
      .from("users_organizations")
      .select("role, organization_id, organizations(id, slug, name, logo_url)")
      .eq("user_id", userId)
      .maybeSingle()

    if (roleLink) {
      // It's a privileged user
      const { data: userDetails } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      // Also try to get employee details for name/image (Managers/HR/etc start as employees)
      const { data: employeeDetails } = await supabase
        .from("employees")
        .select("full_name, profile_image_url")
        .eq("user_id", userId)
        .maybeSingle()

      return {
        ...userDetails, //id, email, etc
        // Enforce organization from the link, not the user record
        organization_id: roleLink.organization_id,
        role: roleLink.role,
        full_name: employeeDetails?.full_name,
        profile_image_url: employeeDetails?.profile_image_url,
        organizations: roleLink.organizations,
        is_employee_only: false
      }
    }

    // 2. If not privileged, check employees table (Clock-only users)
    const { data: employeeData } = await supabase
      .from("employees")
      .select("*, organizations(*)")
      .eq("user_id", userId)
      .maybeSingle()

    if (employeeData) {
      return {
        id: employeeData.user_id, // Map correctly
        email: employeeData.email,
        organization_id: employeeData.organization_id,
        created_at: employeeData.created_at,
        role: "employee", // Explicitly set for frontend logic
        full_name: employeeData.full_name,
        profile_image_url: employeeData.profile_image_url,
        is_employee_only: true, // Flag for redirection
        organizations: employeeData.organizations
      }
    }

    // 3. Fallback: User exists in Auth but has no roles/links (Zombie account)
    // We try to return basic info so we don't crash, but they will likely be denied access
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
