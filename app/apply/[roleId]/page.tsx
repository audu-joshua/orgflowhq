import { ApplicationForm } from "@/features/applications/components/ApplicationForm"

export default function ApplyPage({ params }: { params: { roleId: string } }) {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="w-full">
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply for Position</h1>
          <p className="text-muted-foreground mb-8">Submit your application below</p>
          <ApplicationForm roleId={params.roleId} />
        </div>
      </div>
    </div>
  )
}
