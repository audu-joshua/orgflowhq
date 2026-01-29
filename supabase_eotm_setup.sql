-- Employee of the Month (EOTM) Tables

-- 1. Competitions Table: Tracks monthly cycles per organization
CREATE TABLE IF NOT EXISTS eotm_competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'VOTING_OPEN' CHECK (status IN ('VOTING_OPEN', 'VOTING_CLOSED', 'REVEALED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, month, year)
);

-- 2. Votes Table: Stores individual votes with role-based weights
CREATE TABLE IF NOT EXISTS eotm_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES eotm_competitions(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    nominee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    points INTEGER NOT NULL CHECK (points >= 1 AND points <= 3),-- Weight determined by role at time of vote
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, voter_id),
    CONSTRAINT no_self_voting CHECK (voter_id <> nominee_id)
);

-- 3. Winners Table: Historical record of EOTM winners
CREATE TABLE IF NOT EXISTS eotm_winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES eotm_competitions(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL,
    reveal_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Competitions
ALTER TABLE eotm_competitions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Users can view competitions for their organization" ON eotm_competitions
        FOR SELECT USING (
            organization_id IN (
                SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
            )
        );
EXCEPTION WHEN others THEN NULL; END $$;

-- Votes
ALTER TABLE eotm_votes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Employees can view votes in their competitions" ON eotm_votes
        FOR SELECT USING (
            competition_id IN (
                SELECT id FROM eotm_competitions WHERE organization_id IN (
                    SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
                )
            )
        );

    CREATE POLICY "Employees can cast one vote per month" ON eotm_votes
        FOR INSERT WITH CHECK (
            voter_id IN (
                SELECT id FROM employees WHERE user_id = auth.uid()
            )
        );
EXCEPTION WHEN others THEN NULL; END $$;

-- Winners
ALTER TABLE eotm_winners ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Anyone can view winners" ON eotm_winners
        FOR SELECT USING (true);
EXCEPTION WHEN others THEN NULL; END $$;
