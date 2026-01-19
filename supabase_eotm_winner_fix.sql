-- EOTM Schema Fix: Add Unique Constraint to winners

-- Ensure there is only one winner record per competition to allow upsert logic
ALTER TABLE eotm_winners 
ADD CONSTRAINT unique_competition_winner UNIQUE (competition_id);
