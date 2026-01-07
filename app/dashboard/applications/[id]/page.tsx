"use client"

import { useParams } from "next/navigation"
import { ApplicationDetail } from "@/features/applications/components/ApplicationDetail"

export default function ApplicationDetailPage() {
    const params = useParams()
    const id = params?.id as string

    if (!id) return null

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <ApplicationDetail applicationId={id} />
        </div>
    )
}
