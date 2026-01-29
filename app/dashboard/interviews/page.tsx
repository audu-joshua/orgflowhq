import { InterviewsList } from "@/features/interviews/components/InterviewsList"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { UserIntegration } from "@/models/User"

export default async function InterviewsPage() {
    const session = await getServerSession(authOptions) as any
    let isGoogleConnected = false

    if (session?.user) {
        await connectToDatabase()
        const integration = await UserIntegration.findOne({
            userId: (session.user as any).id,
            provider: 'google'
        })
        isGoogleConnected = !!integration
    }

    return (
        <div className="container mx-auto py-8">
            <InterviewsList isGoogleConnected={isGoogleConnected} />
        </div>
    )
}
