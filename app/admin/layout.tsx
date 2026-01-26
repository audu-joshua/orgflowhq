import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user) {
        redirect("/login")
    }

    if (session.user.role !== 'super_admin') {
        redirect("/dashboard")
    }

    const userData = {
        role: session.user.role,
        full_name: session.user.name
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar user={userData} authUser={session.user} />

            <div className="flex-1 flex flex-col pl-64">
                <AdminHeader />

                <main className="flex-1 pt-16">
                    <div className="p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
