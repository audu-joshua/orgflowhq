import { getSupabaseClient } from "@/lib/supabaseClient"

export const authService = {
  async signUp(email: string, password: string, organizationName: string) {
    const supabase = getSupabaseClient()

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Failed to create user")

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert([{ name: organizationName }])
      .select()
      .single()

    if (orgError) throw orgError

    // Update user with organization_id
    const { error: updateError } = await supabase
      .from("users")
      .insert([{ id: authData.user.id, email, organization_id: orgData.id }])

    if (updateError) throw updateError

    return { user: authData.user, organization: orgData }
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
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  async getUserProfile(userId: string) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("users").select("*, organizations(*)").eq("id", userId).single()

    if (error) throw error
    return data
  },
}
