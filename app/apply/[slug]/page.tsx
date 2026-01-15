import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { ApplicationPageContent } from "@/features/applications/components/ApplicationPageContent"
import type { RoleWithImages } from "@/features/roles/services/roleService"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: role } = await supabase
    .from("roles")
    .select(`*, role_images(image_url), organizations(name)`)
    .eq("slug", slug)
    .single()

  if (!role) return { title: "Job Opening | OrgFlow" }

  const ogImage = role.role_images?.[0]?.image_url

  return {
    title: `${role.title} at ${role.organizations?.name || "OrgFlow"}`,
    description: role.description?.substring(0, 160) || `Apply for the ${role.title} position at ${role.organizations?.name || "OrgFlow"}.`,
    openGraph: {
      title: `${role.title} | ${role.organizations?.name || "OrgFlow"}`,
      description: role.description?.substring(0, 160),
      images: ogImage ? [ogImage] : ["/og-image.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: role.title,
      description: role.description?.substring(0, 160),
      images: ogImage ? [ogImage] : ["/og-image.png"],
    }
  }
}

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
    .select("name, logo_url")
    .eq("id", role.organization_id)
    .single()

  if (role.status === 'closed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {org?.logo_url && (
            <img src={org.logo_url} alt={org.name} className="h-16 mx-auto object-contain" />
          )}
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-bold uppercase tracking-widest">
              Applications Closed
            </div>
            <h1 className="text-4xl font-bold text-foreground">{role.title}</h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your interest! Unfortunately, we are no longer accepting new applications for this position at {org?.name || 'this time'}.
            </p>
          </div>
          <div className="pt-8 border-t border-border">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              View other opportunities
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ApplicationPageContent
      role={role as RoleWithImages}
      organizationName={org?.name || ""}
      organizationLogo={org?.logo_url || ""}
      organizationId={role.organization_id}
    />
  )
}
