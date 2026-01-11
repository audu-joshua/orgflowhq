export interface Interview {
    id: string
    organization_id: string
    applicant_id: string
    role_id: string
    type: 'virtual' | 'in_person'
    status: 'scheduled' | 'completed' | 'missed'
    scheduled_at: string
    duration: number // minutes
    meeting_link?: string
    location?: string
    created_at: string
    updated_at: string
}
