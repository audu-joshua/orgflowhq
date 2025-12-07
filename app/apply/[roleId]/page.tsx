import { ApplicationPageContent } from "@/features/applications/components/ApplicationPageContent"

export default async function ApplyPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params
  return <ApplicationPageContent roleId={roleId} />
}
