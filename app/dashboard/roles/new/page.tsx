import { CreateRoleForm } from "@/features/roles/components/CreateRoleForm"

export default function CreateRolePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Role</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateRoleForm />
      </div>
    </div>
  )
}
