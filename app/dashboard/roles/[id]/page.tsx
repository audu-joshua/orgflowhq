import { RoleDetail } from "@/features/roles/components/RoleDetail"

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  return <RoleDetail roleId={params.id} />
}
