export type EOTMStatus = 'VOTING_OPEN' | 'VOTING_CLOSED' | 'REVEALED';

export interface EOTMCompetition {
    id: string;
    organization_id: string;
    month: number;
    year: number;
    status: EOTMStatus;
    created_at: string;
    updated_at: string;
}

export interface EOTMVote {
    id: string;
    competition_id: string;
    voter_id: string;
    nominee_id: string;
    points: number;
    created_at: string;
}

export interface EOTMWinner {
    id: string;
    competition_id: string;
    employee_id: string;
    total_points: number;
    reveal_at: string;
    created_at: string;
    employee?: {
        full_name: string;
        profile_image_url: string | null;
        position: string | null;
    };
}
