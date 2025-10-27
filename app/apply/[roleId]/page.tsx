import { ApplicationForm } from "@/features/applications/components/ApplicationForm"

export default function ApplyPage({ params }: { params: { roleId: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Position</h1>
          <p className="text-gray-600 mb-8">Submit your application below</p>
          <ApplicationForm roleId={params.roleId} />
        </div>
      </div>
    </div>
  )
}
