import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabaseServer"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    // Verify Super Admin Role
    const { data: userData } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", user.id)
        .single()

    if (userData?.role !== 'super_admin') {
        redirect("/dashboard")
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <AdminSidebar user={userData} authUser={user} />

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
