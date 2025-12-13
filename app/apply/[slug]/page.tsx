import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { ApplicationPageContent } from "@/features/applications/components/ApplicationPageContent"
import type { RoleWithImages } from "@/features/roles/services/roleService"

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer Service Role Key for server-side operations to bypass RLS, otherwise fallback to Anon Key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log(`[ApplyPage] Fetching role for slug: "${slug}"`)

  const { data: role, error } = await supabase
    .from("roles")
    .select(`
      *,
      role_images(*),
      applications(count)
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    console.error(`[ApplyPage] Error fetching role: ${error.message} (${error.code})`)
  }

  if (error || !role) {
    if (error?.code !== 'PGRST116') {
      console.error("Error fetching role:", error)
    }
    notFound()
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", role.organization_id)
    .single()

  return <ApplicationPageContent role={role as RoleWithImages} organizationName={org?.name || ""} />
}
