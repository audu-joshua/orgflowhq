"use client"

import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 Missing Supabase environment variables:")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey)
    throw new Error(
      "@supabase/ssr: Your project's URL and API key are required to create a Supabase client! " +
        "Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file."
    )
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}
