-- HYBRID: Restoring 'invited' status for Activation Flow (Optimized RLS)

-- 1. Drop existing constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_status_check;

-- 2. Add hybrid constraint (Active, Inactive, Invited)
ALTER TABLE employees ADD CONSTRAINT employees_status_check 
CHECK (status IN ('active', 'inactive', 'invited'));

-- 3. Optimized SELECT policy (Fast/Safer)
DROP POLICY IF EXISTS "Allow employees to view own record" ON employees;
CREATE POLICY "Allow employees to view own record"
ON employees
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR (
    status = 'invited'
    AND user_id IS NULL
    AND email = auth.jwt() ->> 'email'
  )
);

-- 4. UPDATE policy for activation
DROP POLICY IF EXISTS "Invited employees can activate" ON employees;
CREATE POLICY "Invited employees can activate"
ON employees
FOR UPDATE
TO authenticated
USING (
  status = 'invited'
  AND user_id IS NULL
  AND email = auth.jwt() ->> 'email'
)
WITH CHECK (
  status = 'active'
  AND user_id = auth.uid()
);

-- 5. Set default back to invited for new employees
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'invited';
