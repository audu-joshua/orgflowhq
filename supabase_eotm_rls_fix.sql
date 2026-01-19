-- EOTM RLS Fix: Grant Write Permissions

-- 1. Competitions: Allow full access to members of the organization
DROP POLICY IF EXISTS "Users can view competitions for their organization" ON eotm_competitions;

CREATE POLICY "Users can manage competitions for their organization" ON eotm_competitions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
        )
    );

-- 2. Votes: Allow members to view all votes in their org (for tallying)
DROP POLICY IF EXISTS "Employees can view votes in their competitions" ON eotm_votes;

CREATE POLICY "Users can view votes in their organization" ON eotm_votes
    FOR SELECT USING (
        competition_id IN (
            SELECT id FROM eotm_competitions WHERE organization_id IN (
                SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
            )
        )
    );

-- 3. Winners: Allow admins to insert/update winners
CREATE POLICY "Users can manage winners for their organization" ON eotm_winners
    FOR ALL USING (
        competition_id IN (
            SELECT id FROM eotm_competitions WHERE organization_id IN (
                SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
            )
        )
    ) WITH CHECK (
        competition_id IN (
            SELECT id FROM eotm_competitions WHERE organization_id IN (
                SELECT organization_id FROM users_organizations WHERE user_id = auth.uid()
            )
        )
    );
