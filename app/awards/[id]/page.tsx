import { Metadata } from 'next'
import AwardClient from './AwardClient'
import { eotmService } from "@/features/departments/services/eotmService"
import { headers } from 'next/headers'

interface Props {
    params: Promise<{ id: string }>
}

async function getAwardData(id: string) {
    const data = await eotmService.getWinnerById(id)
    if (!data) return null
    return { winner: data, org: data.organization }
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const headerList = await headers()
    const host = headerList.get('host') || 'orgflowhq.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    const { id } = await params
    const data = await getAwardData(id)

    if (!data) return { title: 'Award Not Found' }

    const { winner, org } = data
    const month = new Date(winner.reveal_at || winner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const title = `Employee of the Month: ${winner.employee?.full_name}`
    const description = `Celebrating excellence at ${org?.name}. ${winner.employee?.full_name} has been awarded Employee of the Month for ${month}.`

    let imageUrl = winner.employee?.profile_image_url || `${baseUrl}/og-image.png`
    if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`
    }

    return {
        metadataBase: new URL(baseUrl),
        title,
        description,
        openGraph: {
            title,
            description,
            images: [imageUrl],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    }
}

export default async function PublicAwardPage({ params }: Props) {
    const { id } = await params
    const data = await getAwardData(id)

    if (!data) {
        return <div className="h-screen flex items-center justify-center text-muted-foreground font-bold italic">Award certificate not found.</div>
    }

    return <AwardClient winner={data.winner as any} org={data.org} />
}
