import { notFound } from "next/navigation"
import { ApplicationPageContent } from "@/features/applications/components/ApplicationPageContent"
import { Metadata } from "next"
import { connectToDatabase } from "@/lib/mongodb"
import { JobRole } from "@/models/Business"
import { Application } from "@/models/Recruitment"
import { Organization } from "@/models/User"
import mongoose from "mongoose"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  await connectToDatabase()

  const role: any = await JobRole.findOne({ slug }).populate("organizationId")

  if (!role) return { title: "Job Opening | OrgFlow" }

  const ogImage = role.images?.[0]?.imageUrl
  const orgName = role.organizationId?.name || "OrgFlow"

  return {
    title: `${role.title} at ${orgName}`,
    description: role.description?.substring(0, 160) || `Apply for the ${role.title} position at ${orgName}.`,
    openGraph: {
      title: `${role.title} | ${orgName}`,
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
  await connectToDatabase()

  console.log(`[ApplyPage] Fetching role for slug: "${slug}"`)

  const role: any = await JobRole.findOne({ slug })
    .populate("organizationId")

  if (!role) {
    notFound()
  }

  const org = role.organizationId
  const appCount = await Application.countDocuments({ roleId: role._id })

  if (role.status === 'closed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          {org?.logoUrl && (
            <img src={org.logoUrl} alt={org.name} className="h-16 mx-auto object-contain" />
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
      role={{
        ...role.toObject(),
        id: role._id.toString(),
        organization_id: role.organizationId?._id?.toString(),
        applications: { count: appCount },
        role_images: role.images?.map((im: any) => ({ image_url: im.imageUrl })) || []
      }}
      organizationName={org?.name || ""}
      organizationLogo={org?.logoUrl || ""}
      organizationId={role.organizationId?._id?.toString()}
    />
  )
}
