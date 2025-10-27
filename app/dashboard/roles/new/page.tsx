import { CreateRoleForm } from "@/features/roles/components/CreateRoleForm"

export default function CreateRolePage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground mb-6">Create New Role</h1>
      <div className="bg-card rounded-lg border border-border p-6">
        <CreateRoleForm />
      </div>
    </div>
  )
}
