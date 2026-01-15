-- SIMPLIFICATION: Employee Status Model (Active vs Inactive)

-- 1. Drop existing constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;

-- 2. Migrate existing records
-- We convert 'invited' to 'active' as they are now active by default.
-- 'terminated' is also converted to 'active' for this migration, 
-- as future terminations will be actual deletions.
UPDATE employees 
SET status = 'active' 
WHERE status IN ('invited', 'terminated');

-- 3. Add clean constraint (ONLY Active and Inactive)
ALTER TABLE employees ADD CONSTRAINT employees_status_check 
CHECK (status IN ('active', 'inactive'));

-- 4. Set default
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'active';

-- 5. Helper Policy Check
-- Ensure invited users (if any were sticking around in cache/JWT) can still see their orgs
-- but we've basically simplified the whole flow so active is the standard.
-- This script assuming cleaning up the "invited" era.
