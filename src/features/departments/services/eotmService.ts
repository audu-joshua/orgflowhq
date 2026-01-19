import { getSupabaseClient } from "@/lib/supabaseClient"
import type { EOTMCompetition, EOTMVote, EOTMWinner, EOTMStatus } from "../types/eotm"

const supabase = getSupabaseClient()

export const eotmService = {
    async getActiveCompetition(organizationId: string): Promise<EOTMCompetition | null> {
        const now = new Date()
        const month = now.getMonth() + 1
        const year = now.getFullYear()

        const { data, error } = await supabase
            .from('eotm_competitions')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('month', month)
            .eq('year', year)
            .maybeSingle()

        if (error) throw error
        return data
    },

    async ensureCompetitionInitialized(organizationId: string): Promise<EOTMCompetition> {
        const now = new Date()
        const day = now.getDate()
        const month = now.getMonth() + 1
        const year = now.getFullYear()

        // check if it's the 24th or later
        if (day < 24) {
            // In production, we might return null here, but for testing or logic continuation:
            const existing = await this.getActiveCompetition(organizationId)
            if (existing) return existing
        }

        const { data, error } = await supabase
            .from('eotm_competitions')
            .upsert({
                organization_id: organizationId,
                month,
                year,
                status: 'VOTING_OPEN'
            }, { onConflict: 'organization_id, month, year' })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async castVote(competitionId: string, voterId: string, nomineeId: string, voterRole: string) {
        // Determine point weight
        let points = 1
        if (voterRole === 'hr') points = 3
        else if (voterRole === 'owner') points = 2

        const { error } = await supabase
            .from('eotm_votes')
            .insert({
                competition_id: competitionId,
                voter_id: voterId,
                nominee_id: nomineeId,
                points
            })

        if (error) {
            if (error.code === '23505') throw new Error("You have already voted this month!")
            throw error
        }
    },

    async getWinner(competitionId: string): Promise<EOTMWinner | null> {
        const { data, error } = await supabase
            .from('eotm_winners')
            .select(`
        *,
        employee:employees (
          full_name,
          profile_image_url,
          position
        )
      `)
            .eq('competition_id', competitionId)
            .maybeSingle()

        if (error) throw error
        return data
    },

    // Manual Trigger for Testing
    async devForceStartVoting(organizationId: string) {
        const now = new Date()
        const { data, error } = await supabase
            .from('eotm_competitions')
            .upsert({
                organization_id: organizationId,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                status: 'VOTING_OPEN'
            }, { onConflict: 'organization_id, month, year' })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async devForceReveal(competitionId: string) {
        // 1. Tally votes for this competition
        const { data: votes, error: voteError } = await supabase
            .from('eotm_votes')
            .select('nominee_id, points')
            .eq('competition_id', competitionId)

        if (voteError) throw voteError
        if (!votes || votes.length === 0) {
            throw new Error("No votes found! Please cast at least one vote before revealing.")
        }

        // Point Tally Logic
        const tallies: Record<string, number> = {}
        votes.forEach((v: any) => {
            tallies[v.nominee_id] = (tallies[v.nominee_id] || 0) + v.points
        })

        // Sort to find winner
        const sorted = Object.entries(tallies).sort((a, b) => b[1] - a[1])
        const [winnerId, totalPoints] = sorted[0]

        // 2. Update competition status
        const { error: statusError } = await supabase
            .from('eotm_competitions')
            .update({ status: 'REVEALED' })
            .eq('id', competitionId)

        if (statusError) throw statusError

        // 3. Create/Update winner record
        const { error: winnerError } = await supabase
            .from('eotm_winners')
            .upsert({
                competition_id: competitionId,
                employee_id: winnerId,
                total_points: totalPoints,
                reveal_at: new Date().toISOString()
            }, { onConflict: 'competition_id' })

        if (winnerError) throw winnerError
    }
}
