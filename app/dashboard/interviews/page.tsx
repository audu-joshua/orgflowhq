import { InterviewsList } from "@/features/interviews/components/InterviewsList"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

export default async function InterviewsPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isGoogleConnected = false

    if (user) {
        const { data } = await supabase
            .from('user_integrations')
            .select('id')
            .eq('user_id', user.id)
            .eq('provider', 'google')
            .single()

        isGoogleConnected = !!data
    }

    return (
        <div className="container mx-auto py-8">
            <InterviewsList isGoogleConnected={isGoogleConnected} />
        </div>
    )
}
