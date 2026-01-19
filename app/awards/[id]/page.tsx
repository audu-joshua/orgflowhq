import { Metadata } from 'next'
import AwardClient from './AwardClient'
import { organizationService } from "@/features/organization/services/organizationService"
import { createSupabaseServerClient } from '@/lib/supabaseServer'

interface Props {
    params: Promise<{ id: string }>
}

async function getAwardData(id: string) {
    const supabase = await createSupabaseServerClient()

    const { data: winnerData, error } = await supabase
        .from('eotm_winners')
        .select(`
        *,
        employee:employees (
            full_name,
            profile_image_url,
            position,
            organization_id
        )
    `)
        .eq('id', id)
        .single()

    if (!winnerData || error) return null

    const orgData = await organizationService.getOrganizationById(winnerData.employee.organization_id)
    return { winner: winnerData, org: orgData }
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { id } = await params
    const data = await getAwardData(id)

    if (!data) return { title: 'Award Not Found' }

    const { winner, org } = data
    const month = new Date(winner.revel_at || winner.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const title = `Employee of the Month: ${winner.employee.full_name}`
    const description = `Celebrating excellence at ${org?.name}. ${winner.employee.full_name} has been awarded Employee of the Month for ${month}.`
    const image = winner.employee.profile_image_url || '/og-award.png'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    }
}

export default async function PublicAwardPage({ params }: Props) {
    const { id } = await params
    const data = await getAwardData(id)

    if (!data) {
        return <div className="h-screen flex items-center justify-center text-muted-foreground font-bold italic">Award certificate not found.</div>
    }

    return <AwardClient winner={data.winner} org={data.org} />
}
