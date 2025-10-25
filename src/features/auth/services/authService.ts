import { getSupabaseClient } from "@/lib/supabaseClient"

export const authService = {
  async signUp(email: string, password: string, organizationName: string) {
    const supabase = getSupabaseClient()

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Failed to create user")

      // 2. Create organization with slug
      const slug = organizationName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{ 
          name: organizationName,
          slug: slug 
        }])
        .select()
        .single()

      if (orgError) throw orgError

      // 3. Create user profile
      const { error: userError } = await supabase
        .from("users")
        .insert([{ 
          id: authData.user.id, 
          email, 
          organization_id: orgData.id 
        }])

      if (userError) throw userError

      // 4. Link user to organization as owner
      const { error: linkError } = await supabase
        .from("users_organizations")
        .insert([{
          user_id: authData.user.id,
          organization_id: orgData.id,
          role: "owner"
        }])

      if (linkError) throw linkError

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
    const { data, error } = await supabase
      .from("users")
      .select("*, organizations(*)")
      .eq("id", userId)
      .single()

    if (error) throw error
    return data
  },
}